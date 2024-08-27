import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Client, ClientDocument } from './schema/clients.schema';
import { Model } from 'mongoose';
import { CreateClientDto } from './dto/create-client.dto';

@Injectable()
export class ClientsService {
  constructor(
    @InjectModel(Client.name) private clientModel: Model<ClientDocument>
  ) {}

  async createClient(client: CreateClientDto): Promise<Client | undefined> {
    return this.clientModel.create(client)
  }

  async getClients(): Promise<Client[]> {
    return this.clientModel.aggregate([
      {
        $project: {
          name: { $toLower: "$name" },
          original: "$$ROOT"
        }
      },
      { $sort: { name: 1 } },
      { $replaceRoot: { newRoot: "$original" } }
    ]);
  }

  async getClient(id: string): Promise<Client | undefined> {
    return this.clientModel.findOne({_id: id})
  }

  async updateClient(id: string, client: CreateClientDto): Promise<Client | undefined> {
    return this.clientModel.findOneAndUpdate({_id: id}, {$set: client}, {new: true})
  }
}
