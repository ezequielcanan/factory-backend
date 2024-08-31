import { Injectable, Type } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Order, OrderDocument } from './schemas/orders.schema';
import { Types } from 'mongoose';
import { Model } from 'mongoose';
import { CreateOrderDto } from './dto/create-order.dto';
import { CutsService } from 'src/cuts/cuts.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
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
    return this.orderModel.findOne({_id: id}).populate("client").populate("articles.article").populate("articles.customArticle")
  }

  async getOrderAndCut(id: string): Promise<any> {
    const order = await this.getOrder(id)
    const cut = await this.cutsService.getCutFromOrder(id)
    return {order,cut}
  }

  async getOrders(): Promise<Order[] | undefined> {
    return this.orderModel.find().populate("client").populate("articles.article").populate("articles.customArticle")
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
    const cut = await this.cutsService.getCutFromOrder(id)

    if (!order) {
      return {order: false}
    }
    
    const newArticles = order.articles?.map(article => {
      if (article?.common && article?.quantity > article?.booked) {
        article.hasToBeCut = true
      }
      
      return article
    })
    
    
    const newOrder = await this.orderModel.findOneAndUpdate({finished: false, _id: id}, {$set: {articles: newArticles}}, {new: true})
    if (!cut) {
      await this.cutsService.createCutFromOrder(newOrder)
    }

    return newOrder
  }
}
