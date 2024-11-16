import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Client, ClientDocument } from './schema/clients.schema';
import { Model, Types } from 'mongoose';
import { CreateClientDto } from './dto/create-client.dto';
import { Order, OrderDocument } from 'src/orders/schemas/orders.schema';

@Injectable()
export class ClientsService {
  constructor(
    @InjectModel(Client.name) private clientModel: Model<ClientDocument>,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>
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

  async getOrdersByClient(cid: string): Promise<any> {
    return this.orderModel.find({client: new Types.ObjectId(cid), finished: true}).populate("articles.article").populate("articles.customArticle")
  }
}
