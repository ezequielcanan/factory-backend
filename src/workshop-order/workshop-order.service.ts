import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { WorkshopOrder, WorkshopOrderDocument } from './schema/workshop-order.schema';
import { Model } from 'mongoose';

@Injectable()
export class WorkshopOrderService {
  constructor(
    @InjectModel(WorkshopOrder.name) private workshopOrderModel: Model<WorkshopOrderDocument>
  ) {}

  
}
