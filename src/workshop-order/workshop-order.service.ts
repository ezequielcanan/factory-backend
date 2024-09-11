import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { WorkshopOrder, WorkshopOrderDocument } from './schema/workshop-order.schema';
import { Model, Types } from 'mongoose';
import { CreateWorkshopOrderDto } from './dto/create-workshop-order.dto';

@Injectable()
export class WorkshopOrderService {
  constructor(
    @InjectModel(WorkshopOrder.name) private workshopOrderModel: Model<WorkshopOrderDocument>
  ) {}

  async createWorkshopOrder(order: CreateWorkshopOrderDto): Promise<WorkshopOrder | undefined> {
    const {cut, workshop, ...rest} = order
    return this.workshopOrderModel.create({cut: new Types.ObjectId(cut), workshop: new Types.ObjectId(workshop), ...rest})
  }

  async getWorkshopOrder(id: string): Promise<WorkshopOrder | undefined> {
    return this.workshopOrderModel.findOne({_id: new Types.ObjectId(id)})
  }

  async updateWorkshopOrder(id: string, order: any): Promise<any> {
    return this.workshopOrderModel.updateOne({_id: new Types.ObjectId(id)}, {$set: order})
  }

  async receiveWorkshopOrder(id: string): Promise<any> {
    const workshopOrder = await this.getWorkshopOrder(id)

    return this.workshopOrderModel.updateOne({_id: id})
  }
}
