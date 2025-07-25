import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BuyOrder, BuyOrderDocument } from './schema/buy-orders.schema';
import { Model, Types } from 'mongoose';
import { CreateBuyOrderDto } from './dto/create-buy-order.dto';
import { CustomArticle, CustomArticleDocument } from 'src/articles/schema/customArticle.schema';
import { Article, ArticleDocument } from 'src/articles/schema/articles.schema';
import * as moment from 'moment';

@Injectable()
export class BuyOrdersService {
  constructor(
    @InjectModel(BuyOrder.name) private buyOrderModel: Model<BuyOrderDocument>,
    @InjectModel(CustomArticle.name) private customArticleModel: Model<CustomArticleDocument>,
    @InjectModel(Article.name) private articleModel: Model<ArticleDocument>,
  ) {}

  async createBuyOrder(buyOrder: CreateBuyOrderDto): Promise<BuyOrder> {
    let { client, articles, ...rest } = buyOrder

    const lastOrder = await this.buyOrderModel.find().sort({ orderNumber: "desc" }).limit(1)
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
    return this.buyOrderModel.create({ orderNumber: lastOrder.length ? lastOrder[0]?.orderNumber + 1 : 0, client: new Types.ObjectId(client), articles: newArticles, ...rest })
  }

  async getOrders(page: string, search: string): Promise<any> {
    const limit = 50
    const skip = (Number(page) - 1) * limit
    const matchClient = { $match: {} }


    if (search) {
      matchClient["$match"]["client.name"] = { $regex: search, $options: 'i' }
    }

    const result = await this.buyOrderModel.aggregate([
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
      matchClient,
      {
        $addFields: {
          priority: { $ifNull: ["$priority", false] }
        }
      },
      {
        $sort: {
          "priority": -1,
          "received": 1
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
        const art = article?.customArticle ? await this.customArticleModel.findOne({ _id: article?.customArticle }) : await this.articleModel.findOne({ _id: article?.article })
        const artObj = {}
        artObj[article?.customArticle ? "customArticle" : "article"] = art
        return { ...article, ...artObj }
      }))

      const orderIndex = result.findIndex(o => o?._id == order?._id)
      result[orderIndex].articles = articles
    }))
    return result
  }

  async getOrder(id: string): Promise<any | undefined> {
    return this.buyOrderModel.findOne({_id: new Types.ObjectId(id)}).populate("client").populate("articles.article").populate("articles.customArticle").lean()
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

  async updateArticleUnitPrice(oid: string, aid: string, custom: string, price: string): Promise<any> {
    const order = await this.getOrder(oid)

    const findObj = this.getFindObjForArticle(oid, aid, custom)
    const setObj = {
      $set: {
        "articles.$.price": Number(price)
      }
    }

    const result = await this.buyOrderModel.findOneAndUpdate(
      findObj,
      setObj,
      { new: true }
    );

    return result;
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
      setObj["$set"]["articles.$.booked"] = qty
      const result = await this.buyOrderModel.updateOne(
        findObj,
        setObj
      );

      return result;
    }
  }

  async deleteArticle(oid: string, aid: string, custom: boolean): Promise<any> {
    const findObj = {}
    findObj[custom ? "customArticle" : "article"] = new Types.ObjectId(aid)
    return this.buyOrderModel.findOneAndUpdate({ _id: new Types.ObjectId(oid) }, { $pull: { articles: findObj } }, { new: true })
  }

  async addArticle(oid: string, aid: string, custom: boolean): Promise<any> {
    const findObj = { quantity: 0, booked: 0, common: custom ? false : true }
    findObj[custom ? "customArticle" : "article"] = new Types.ObjectId(aid)
    return this.buyOrderModel.findOneAndUpdate({ _id: new Types.ObjectId(oid) }, { $push: { articles: findObj } }, { new: true })
  }

  async deleteOrder(id: string): Promise<any> {
    return this.buyOrderModel.deleteOne({ _id: new Types.ObjectId(id) })
  }

  async updateOrder(id: string, property: string, value: string): Promise<BuyOrder | undefined> {
    const updateObj = {}
    updateObj[property] = (value == "true" || value == "false") ? ((value == "true") ? true : false) : value
    return this.buyOrderModel.findOneAndUpdate({ _id: new Types.ObjectId(id) }, { $set: updateObj }, { new: true })
  }

  async getRecentBuyOrders(from, to, property = "receivedDate"): Promise<any> {
    const dateString = "DD-MM-YYYY"
    const fromDate = moment(from || moment().subtract(7, "days").format(dateString), dateString).toDate()
    const toDate = to ? moment(to, dateString).subtract(-1, "days").toDate() : new Date()

    const recentOrders = await this.buyOrderModel.find({
      [property]: { $gte: fromDate, $lte: toDate }
    })

    const resume = {}
    resume["orders"] = recentOrders || []
    resume["ordersLength"] = recentOrders?.length || 0
    resume["profits"] = recentOrders?.reduce((acc, order) => {
      return acc + (order?.articles?.reduce((artAcc, art) => artAcc + ((art?.price || 0) * (art?.quantity || 0) * (order?.mode ? 1.21 : 1)), 0))
    }, 0)

    const articles = recentOrders.map((order) => order?.articles).flat()

    resume["articles"] = articles.filter((article, index, self) =>
      index === self.findIndex((t) => article?.article ? String(t?.article?._id) === String(article?.article?._id) : String(t?.customArticle?._id) === String(article?.customArticle?._id))
    )

    return resume;
  }
}
