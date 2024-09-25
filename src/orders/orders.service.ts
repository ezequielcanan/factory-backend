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


  async getOrder(id: string): Promise<Order | undefined> {
    return this.orderModel.findOne({ _id: id }).populate("client").populate("articles.article").populate("articles.customArticle")
  }

  async getOrderAndCut(id: string): Promise<any> {
    const order = await this.getOrder(id)
    const cut = await this.cutsService.getCutFromOrder(id)
    return { order, cut }
  }

  async getOrders(society: string): Promise<any | undefined> {
    /*if (society) { 
      return this.orderModel.find({society}).populate("client").populate("articles.article").populate("articles.customArticle")
    } else {
      return this.orderModel.find().populate("client").populate("articles.article").populate("articles.customArticle")
    }*/
    const matchObj = {$match: {}}
    if (society) {
      matchObj["$match"]["society"] = society
    }
    const result = await this.orderModel.aggregate([
      matchObj,
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
      }
    ])

    await Promise.all(result.map(async order => {
      const articles = await Promise.all(order?.articles?.map(async article => {
        const art = article?.customArticle ? await this.customArticlesModel.findOne({_id: article?.customArticle}) : await this.articlesModel.findOne({_id: article?.article})
        const artObj = {}
        artObj[article?.customArticle ? "customArticle" : "article"] = art
        return {...article, ...artObj}
      }))

      const orderIndex = result.findIndex(o => o?._id == order?._id)
      const client = await this.clientModel.findOne({_id: order?.client})
      const workshop = await this.workshopOrdersModel.findOne({cut: order?.cut?._id})
      result[orderIndex].workshop = workshop
      result[orderIndex].articles = articles
      result[orderIndex].client = client
    }))
    return result
  }
  

  async createOrder(order: CreateOrderDto): Promise<Order | undefined> {
    let { client, articles, ...rest } = order
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
      {new: true}
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
      {new: true}
    );

    return result;
  }
}
