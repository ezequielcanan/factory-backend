import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Client, ClientDocument } from './schema/clients.schema';
import { Model } from 'mongoose';
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

  async getClients(sort: boolean, page: string): Promise<Client[]> {
    if (!sort) {
      return this.clientModel.aggregate([
        {
          $project: {
            name: { $toLower: "$name" },
            original: "$$ROOT"
          }
        },
        { $sort: { name: 1 } },
        { $replaceRoot: { newRoot: "$original" } }
      ])
    } else {
      const clients = await this.clientModel.find()
      const clientsWithBalance = []
      await Promise.all(clients.map(async client => {
        const orders = await this.orderModel.find({client: client?._id})
        
      }))
    }
  }

  async getClient(id: string): Promise<Client | undefined> {
    return this.clientModel.findOne({ _id: id })
  }

  async updateClient(id: string, client: CreateClientDto): Promise<Client | undefined> {
    return this.clientModel.findOneAndUpdate({ _id: id }, { $set: client }, { new: true })
  }
}
