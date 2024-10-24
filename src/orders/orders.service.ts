import { Injectable, Type } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Order, OrderDocument } from './schemas/orders.schema';
import { Types } from 'mongoose';
import { Model } from 'mongoose';
import { CreateOrderDto } from './dto/create-order.dto';
import { CutsService } from 'src/cuts/cuts.service';
import { ArticlesService } from 'src/articles/articles.service';
import { Article, ArticleDocument } from 'src/articles/schema/articles.schema';
import { CustomArticle, CustomArticleDocument } from 'src/articles/schema/customArticle.schema';
import { Client, ClientDocument } from 'src/clients/schema/clients.schema';
import { WorkshopOrder, WorkshopOrderDocument } from 'src/workshop-order/schema/workshop-order.schema';
import * as moment from 'moment';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Client.name) private clientModel: Model<ClientDocument>,
    @InjectModel(Article.name) private articlesModel: Model<ArticleDocument>,
    @InjectModel(CustomArticle.name) private customArticlesModel: Model<CustomArticleDocument>,
    @InjectModel(WorkshopOrder.name) private workshopOrdersModel: Model<WorkshopOrderDocument>,
    private readonly cutsService: CutsService
  ) { }

  async getBookedQuantity(articleId: string | Types.ObjectId): Promise<number> {
    const result = await this.orderModel.aggregate([
      { $match: { finished: false, "articles.article": new Types.ObjectId(articleId) } },
      { $unwind: "$articles" },
      { $match: { "articles.article": new Types.ObjectId(articleId) } },
      { $group: { _id: null, totalBooked: { $sum: "$articles.booked" } } }
    ]);

    return result[0]?.totalBooked || 0;
  }

  async getLastOrder(): Promise<Order[] | undefined> {
    return this.orderModel.find().sort({ orderNumber: "desc" }).limit(1)
  }

  async subordersFlat(order): Promise<Order | undefined> {
    if (order?.suborders?.length) {
      order.articles = order?.suborders?.map(suborder => suborder?.["articles"]).flat()
      order.articles = await this.populateArticlesFromOrder(order)
    }
    return order
  }

  async getOrder(id: string, number: boolean = false): Promise<Order | undefined> {
    const findObj = {}

    if (!number) {
      findObj["_id"] = id
    } else {
      findObj["orderNumber"] = id
    }

    return this.orderModel.findOne(findObj).populate("client").populate("articles.article").populate("articles.customArticle")
  }

  async getOrderAndCut(id: string, number: boolean = false): Promise<any> {
    const order = await this.subordersFlat(await this.getOrder(id, number))
    const cut = await this.cutsService.getCutFromOrder(!number ? id : order["_id"])
    return { order, cut }
  }

  async getOrdersByClient(cid: string): Promise<Order[] | undefined> {
    return this.orderModel.find({ client: new Types.ObjectId(cid) })
  }

  async getOrders(society: string, page: string, search: string, finished: string, colors: any): Promise<any | undefined> {
    const limit = 25
    const skip = (Number(page) - 1) * limit
    const matchClient = { $match: {} }

    const matchObj = { $match: {} }
    if (society) {
      matchObj["$match"]["society"] = society
    }

    if (finished) {
      matchObj["$match"]["finished"] = true;
    }

    if (colors?.length) {
      matchObj["$match"]["$or"] = []

      const agrupatedObj = {
        $expr: {
          $gte: [{ $size: { $ifNull: ["$suborders", []] } }, 1]  // Verifica si la longitud de 'suborders' es >= 1
        }
      }

      if (colors?.some(c => c == 6)) {
        matchObj["$match"]["$or"].push(agrupatedObj)
      }

      const finishedObj = { $nor: [agrupatedObj], finished: true }

      if (colors?.some(c => c == 5)) {
        matchObj["$match"]["$or"].push(finishedObj)
      }

      const separatedObj = {
        $nor: [finishedObj],
        inPricing: true,
        $or: [
          { finished: { $exists: false } },
          { finished: { $eq: false } }
        ]
      }

      if (colors?.some(c => c == 4)) {
        matchObj["$match"]["$or"].push(separatedObj)
      }

      const forSeparateObj = {
        $and: [
          { $nor: [separatedObj] },
          { $nor: [agrupatedObj] },
          {
            $or: [
              { inPricing: { $exists: false } },
              { inPricing: { $eq: false } }
            ]
          },
          {
            $expr: {
              $eq: [
                {
                  $size: {
                    $filter: {
                      input: "$articles",  // Campo array que estás filtrando
                      as: "article",       // Alias para los elementos dentro de "articles"
                      cond: { $eq: ["$$article.quantity", "$$article.booked"] }  // Comparar la cantidad con "booked"
                    }
                  }
                },
                { $size: "$articles" }
              ]
            }
          }
        ]
      }

      if (colors?.some(c => c == 3)) {
        matchObj["$match"]["$or"].push(forSeparateObj);
      }

      const inWorkshopOrder = {
        $and: [
          { $nor: [forSeparateObj], },
          {
            $expr: {
              $gte: [{ $size: { $ifNull: ["$workshopOrder", []] } }, 1]  // Verifica si la longitud de 'suborders' es >= 1
            }
          },
          {
            $or: [
              { inPricing: { $exists: false } },
              { inPricing: { $eq: false } }
            ]
          }
        ]
      }

      if (colors?.some(c => c == 2)) {
        matchObj["$match"]["$or"].push(inWorkshopOrder)
      }

      if (colors?.some(c => c == 1)) {
        matchObj["$match"]["$or"].push(
          {
            $nor: [inWorkshopOrder, agrupatedObj, finishedObj, separatedObj, forSeparateObj]
          }
        )
      }

      if (!matchObj["$match"]["$or"]?.length) delete matchObj["$match"]["$or"]

    }

    if (search) {
      matchClient["$match"]["client.name"] = { $regex: search, $options: 'i' }
    }

    const result = await this.orderModel.aggregate([
      {
        $lookup: {
          from: "cuts",
          localField: "_id",
          foreignField: "order",
          as: "cut"
        }
      },
      {
        $unwind: { path: "$cut", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "clients",
          localField: "client",
          foreignField: "_id",
          as: "client"
        }
      },
      {
        $unwind: { path: "$client", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "workshoporders",
          localField: "cut._id",
          foreignField: "cut",
          as: "workshopOrder"
        }
      },
      matchObj,
      matchClient,
      {
        $sort: {
          "finished": 1,
          "deliveryDate": 1
        }
      },
      {
        $skip: skip
      },
      {
        $limit: limit
      }
    ])

    await Promise.all(result.map(async order => {
      const articles = await Promise.all(order?.articles?.map(async article => {
        const art = article?.customArticle ? await this.customArticlesModel.findOne({ _id: article?.customArticle }) : await this.articlesModel.findOne({ _id: article?.article })
        const artObj = {}
        artObj[article?.customArticle ? "customArticle" : "article"] = art
        return { ...article, ...artObj }
      }))

      const orderIndex = result.findIndex(o => o?._id == order?._id)
      const client = await this.clientModel.findOne({ _id: order?.client })
      const workshop = await this.workshopOrdersModel.findOne({ cut: order?.cut?._id })
      if (result[orderIndex].workshopOrder) delete result[orderIndex].workshopOrder
      result[orderIndex].workshop = workshop
      result[orderIndex].articles = articles
    }))
    return result
  }


  async createOrder(order: CreateOrderDto): Promise<Order | undefined> {
    let { client, articles, ...rest } = order

    if (rest?.suborders?.length) {
      rest.suborders = rest?.suborders?.map(s => new Types.ObjectId(s))
    }

    const lastOrder = await this.getLastOrder()
    const newArticles = articles.map(a => {
      const returnItem = {
        ...a
      }

      if (a.customArticle) {
        returnItem.customArticle = new Types.ObjectId(a.customArticle)
      }

      if (a.article) {
        returnItem.article = new Types.ObjectId(a.article)
      }

      return returnItem
    })
    return this.orderModel.create({ orderNumber: lastOrder.length ? lastOrder[0]?.orderNumber + 1 : 0, client: new Types.ObjectId(client), articles: newArticles, ...rest })
  }

  async setToCutCommonArticles(id: string): Promise<any> {
    const order = await this.getOrder(id)
    const cut = await this.cutsService.getCutFromOrder(new Types.ObjectId(id))

    if (!order) {
      return { order: false }
    }

    const newArticles = order.articles?.map(article => {
      if (article?.common && article?.quantity > article?.booked) {
        article.hasToBeCut = true
      }

      return article
    })


    const newOrder = await this.orderModel.findOneAndUpdate({ finished: false, _id: id }, { $set: { articles: newArticles } }, { new: true })
    if (!cut) {
      await this.cutsService.createCutFromOrder(newOrder)
    }

    return newOrder
  }

  getFindObjForArticle(oid: string, aid: string, custom: string): any {
    const findObj = {
      _id: oid
    }

    if (custom) {
      findObj["articles.customArticle"] = new Types.ObjectId(aid);
    } else {
      findObj["articles.article"] = new Types.ObjectId(aid);
    }

    return findObj
  }

  async updateArticleQuantity(oid: string, aid: string, qty: string, custom: string): Promise<any> {
    if (parseInt(qty) >= 0) {
      const findObj = this.getFindObjForArticle(oid, aid, custom)
      const setObj = {
        $set: {
          "articles.$.quantity": parseInt(qty)
        }
      }
      const order = await this.getOrder(oid)
      if (parseInt(qty) < order?.articles?.find((a) => String(custom ? a.customArticle?._id : a.article?._id) == aid)?.booked) {
        setObj["$set"]["articles.$.booked"] = qty
      }
      const result = await this.orderModel.updateOne(
        findObj,
        setObj
      );

      return result;
    }
  }

  async updateArticleBooked(oid: string, aid: string, qty: string, custom: string): Promise<any> {
    if (parseInt(qty) >= 0) {
      const findObj = this.getFindObjForArticle(oid, aid, custom)
      const setObj = {
        $set: {
          "articles.$.booked": parseInt(qty)
        }
      }

      const order = await this.getOrder(oid)
      const bookedArticles = await this.getBookedQuantity(aid)
      const article = await this.articlesModel.findOne({ _id: aid })
      const articleToUpdate = order?.articles?.find((a) => String(custom ? a.customArticle?._id : a.article?._id) == aid)

      if (((bookedArticles - (articleToUpdate?.booked) + parseInt(qty)) <= article?.stock && articleToUpdate.quantity >= parseInt(qty)) || !articleToUpdate?.common) {
        const result = await this.orderModel.updateOne(
          findObj,
          setObj
        );
        return result;
      }
    }
  }

  async updateArticleCut(oid: string, aid: string, custom: string): Promise<any> {
    const order = await this.getOrder(oid)
    const cut = await this.cutsService.getCutFromOrder(new Types.ObjectId(oid))
    const articleToUpdate = order?.articles?.find((a) => String(custom ? a.customArticle?._id : a.article?._id) == aid)

    const findObj = this.getFindObjForArticle(oid, aid, custom)
    const setObj = {
      $set: {
        "articles.$.hasToBeCut": !articleToUpdate?.hasToBeCut
      }
    }

    const result = await this.orderModel.findOneAndUpdate(
      findObj,
      setObj,
      { new: true }
    );

    if (!cut) {
      await this.cutsService.createCutFromOrder(result)
    }

    return result;
  }

  async updateArticleUnitPrice(oid: string, aid: string, custom: string, price: string): Promise<any> {
    const order = await this.getOrder(oid)

    const findObj = this.getFindObjForArticle(oid, aid, custom)
    const setObj = {
      $set: {
        "articles.$.price": Number(price)
      }
    }

    const result = await this.orderModel.findOneAndUpdate(
      findObj,
      setObj,
      { new: true }
    );

    return result;
  }

  async finishOrder(id: string): Promise<Order | undefined> {
    return this.orderModel.findOneAndUpdate({ _id: id }, { finished: true, finalDate: moment.utc().toDate() }, { new: true })
  }

  async updatePaidAmount(id: string, paid: string): Promise<Order | undefined> {
    return this.orderModel.findOneAndUpdate({ _id: id }, { paid: Number(paid) }, { new: true })
  }

  async deleteOrder(id: string): Promise<any> {
    const cut = await this.cutsService.deleteCutByOrder(id)
    if (cut) await this.workshopOrdersModel.deleteMany({ cut: cut["_id"] })
    return this.orderModel.deleteOne({ _id: new Types.ObjectId(id) })
  }

  async deleteArticle(oid: string, aid: string, custom: boolean): Promise<any> {
    const findObj = {}
    findObj[custom ? "customArticle" : "article"] = new Types.ObjectId(aid)
    return this.orderModel.findOneAndUpdate({ _id: new Types.ObjectId(oid) }, { $pull: { articles: findObj } }, { new: true })
  }

  async addArticle(oid: string, aid: string, custom: boolean): Promise<any> {
    const findObj = { quantity: 0, booked: 0, common: custom ? false : true }
    findObj[custom ? "customArticle" : "article"] = new Types.ObjectId(aid)
    return this.orderModel.findOneAndUpdate({ _id: new Types.ObjectId(oid) }, { $push: { articles: findObj } }, { new: true })
  }

  async deleteSuborder(oid: string, sid: string): Promise<any> {
    return this.orderModel.findOneAndUpdate({ _id: new Types.ObjectId(oid) }, { $pull: { suborders: new Types.ObjectId(sid) } }, { new: true })
  }

  async addSuborder(oid: string, number: string, cattown: string): Promise<any> {
    const suborder = await this.getOrder(number, true)
    if (oid != suborder["_id"] && (cattown ? suborder?.society == "Cattown" : true)) {
      return this.orderModel.findOneAndUpdate({ _id: new Types.ObjectId(oid) }, { $addToSet: { suborders: suborder["_id"] } }, { new: true })
    }
  }

  async changeMode(id: string): Promise<Order | undefined> {
    const order = await this.orderModel.findOne({ _id: new Types.ObjectId(id) })
    return this.orderModel.findOneAndUpdate({ _id: new Types.ObjectId(id) }, { $set: { mode: !order?.mode } }, { new: true })
  }

  async updateOrder(id: string, property: string, value: string): Promise<Order | undefined> {
    const updateObj = {}
    updateObj[property] = (value == "true" || value == "false") ? Boolean(value) : value
    return this.orderModel.findOneAndUpdate({ _id: new Types.ObjectId(id) }, { $set: updateObj }, { new: true })
  }

  async populateArticlesFromOrder(order): Promise<any> {
    const articles = []
    await Promise.all(order?.articles?.map(async article => {
      if (article?.article) {
        const result = await this.articlesModel.findOne({ _id: new Types.ObjectId(article?.article?._id) })
        articles.push({ ...article, article: result })
      } else {
        const result = await this.customArticlesModel.findOne({ _id: new Types.ObjectId(article?.customArticle?._id) })
        articles.push({ ...article, customArticle: result })
      }
    }))
    return articles
  }
  
  async getRecentOrders(from, to): Promise<any> {
    const dateString = "DD-MM-YYYY"
    const fromDate = moment(from || moment().subtract(7, "days").format(dateString), dateString).toDate()
    const toDate = to ? moment(to, dateString).subtract(-1, "days").toDate() : new Date()
    
    const recentOrders = await this.orderModel.find({
      finalDate: {$gte: fromDate, $lte: toDate}
    })
    
    const resume = {}
    resume["orders"] = recentOrders || []
    resume["ordersLength"] = recentOrders?.length || 0
    resume["profits"] = recentOrders?.reduce((acc, order) => acc+(order?.articles?.reduce((artAcc, art) => artAcc+((art?.price || 0) * (art?.quantity || 0) * (order?.mode ? 1.21 : 1)),0)), 0)
    
    const articles = recentOrders.map((order) => order?.articles).flat()

    resume["articles"] = articles.filter((article, index, self) =>
      index === self.findIndex((t) => article?.article ? String(t?.article?._id) === String(article?.article?._id) : String(t?.customArticle?._id) === String(article?.customArticle?._id))
    )

    return resume;
  }

}
