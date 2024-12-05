import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Client, ClientDocument } from './schema/clients.schema';
import { Model, Types } from 'mongoose';
import { CreateClientDto } from './dto/create-client.dto';
import { Order, OrderDocument } from 'src/orders/schemas/orders.schema';
import { BuyOrder, BuyOrderDocument } from 'src/buy-orders/schema/buy-orders.schema';

@Injectable()
export class ClientsService {
  constructor(
    @InjectModel(Client.name) private clientModel: Model<ClientDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(BuyOrder.name) private buyOrderModel: Model<BuyOrderDocument>,
  ) { }

  async createClient(client: CreateClientDto): Promise<Client | undefined> {
    return this.clientModel.create(client)
  }

  async getClients(sort: boolean, page: string, suppliers = false): Promise<Client[]> {
    const findObj = {}
    if (!suppliers) {
      findObj["$or"] = [
        { supplier: { $exists: false } },
        { supplier: { $eq: false } }
      ]
    } else {
      findObj["supplier"] = true
    }
    if (!sort) {
      return this.clientModel.aggregate([
        {$match: findObj},
        {
          $project: {
            name: { $toLower: "$name" },
            original: "$$ROOT"
          }
        },
        { $sort: { name: 1 } },
        { $replaceRoot: { newRoot: "$original" } }
      ])
    }
  }

  async getClient(id: string): Promise<Client | undefined> {
    return this.clientModel.findOne({ _id: id })
  }

  async updateClient(id: string, client: CreateClientDto): Promise<Client | undefined> {
    return this.clientModel.findOneAndUpdate({ _id: id }, { $set: client }, { new: true })
  }

  async getOrdersByClient(cid: string, buys: boolean = false): Promise<any> {
    return !buys ? this.orderModel.find({client: new Types.ObjectId(cid), finished: true}).populate("articles.article").populate("articles.customArticle") : this.buyOrderModel.find({client: new Types.ObjectId(cid), received: true}).populate("articles.article").populate("articles.customArticle")
  }
}
