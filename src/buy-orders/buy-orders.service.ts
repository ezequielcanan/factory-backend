import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BuyOrder, BuyOrderDocument } from './schema/buy-orders.schema';
import { Model, Types } from 'mongoose';
import { CreateBuyOrderDto } from './dto/create-buy-order.dto';

@Injectable()
export class BuyOrdersService {
  constructor(
    @InjectModel(BuyOrder.name) private buyOrderModel: Model<BuyOrderDocument>
  ) {}

  async createBuyOrder(buyOrder: CreateBuyOrderDto): Promise<BuyOrder> {
    let { client, items, ...rest } = buyOrder

    const lastOrder = await this.buyOrderModel.find().sort({ orderNumber: "desc" }).limit(1)
    const newArticles = items.map(a => {
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
    return this.buyOrderModel.create({ orderNumber: lastOrder.length ? lastOrder[0]?.orderNumber + 1 : 0, client: new Types.ObjectId(client), items: newArticles, ...rest })
  }

}
