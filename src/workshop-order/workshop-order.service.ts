import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { WorkshopOrder, WorkshopOrderDocument } from './schema/workshop-order.schema';
import { Model, Types } from 'mongoose';
import { CreateWorkshopOrderDto } from './dto/create-workshop-order.dto';
import moment from "moment"
import { ArticlesService } from 'src/articles/articles.service';
import { OrdersService } from 'src/orders/orders.service';

@Injectable()
export class WorkshopOrderService {
  constructor(
    @InjectModel(WorkshopOrder.name) private workshopOrderModel: Model<WorkshopOrderDocument>,
    private readonly articlesService: ArticlesService,
    private readonly ordersService: OrdersService
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
    await Promise.all(workshopOrder?.cut["order"]?.articles?.map(async a => {
      if (a.hasToBeCut && (a.quantity > a.booked)) {
        this.ordersService.updateArticleBooked(workshopOrder?.cut["order"]?._id, a[a.common ? "article" : "customArticle"]?._id, (a.booked || 0) + (a.quantity - (a.booked || 0)), a.common ? "" : "true")
        if (a.common) {
          this.articlesService.updateStock(a?.article?.stock + (a.quantity - a.booked), a?.article?._id)
        }
      }
    }))
    

    return this.workshopOrderModel.updateOne({_id: new Types.ObjectId(id)}, {$set: {deliveryDate: new Date()}})
  }
}
