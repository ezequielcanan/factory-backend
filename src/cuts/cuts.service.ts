import { Injectable } from '@nestjs/common';
import { Cut, CutDocument } from './schema/cuts.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateCutDto } from './dto/create-cut.dto';
import { Order } from 'src/orders/schemas/orders.schema';

@Injectable()
export class CutsService {
  constructor(
    @InjectModel(Cut.name) private cutsModel: Model<CutDocument>
  ) {}

  async createCut(cut: CreateCutDto): Promise<Cut | undefined> {
    const {order, ...rest} = cut
    return this.cutsModel.create({order: new Types.ObjectId(order), ...rest})
  }

  async createCutFromOrder(order: any): Promise<Cut | undefined> {
    if (order?.articles?.some(a => a.hasToBeCut)) {
      const cut = {
        order: order?._id
      }
      return this.cutsModel.create(cut)
    } else {
      null
    }
  }

  async getCutFromOrder(orderId: string): Promise<Cut | undefined> {
    return this.cutsModel.findOne({order: orderId})
  }

  async getCuts(): Promise<Cut[] | undefined> {
    return this.cutsModel.find().populate("order")
  }
}
