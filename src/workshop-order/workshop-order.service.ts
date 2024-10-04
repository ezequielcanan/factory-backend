import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { WorkshopOrder, WorkshopOrderDocument } from './schema/workshop-order.schema';
import { Model, Types } from 'mongoose';
import { CreateWorkshopOrderDto } from './dto/create-workshop-order.dto';
import moment from "moment"
import { ArticlesService } from 'src/articles/articles.service';
import { OrdersService } from 'src/orders/orders.service';
import { CutsService } from 'src/cuts/cuts.service';

@Injectable()
export class WorkshopOrderService {
  constructor(
    @InjectModel(WorkshopOrder.name) private workshopOrderModel: Model<WorkshopOrderDocument>,
    private readonly articlesService: ArticlesService,
    private readonly ordersService: OrdersService,
    private readonly cutsServices: CutsService
  ) {}

  async createWorkshopOrder(order: CreateWorkshopOrderDto): Promise<WorkshopOrder | undefined> {
    const {cut, workshop, ...rest} = order
    return this.workshopOrderModel.create({cut: new Types.ObjectId(cut), workshop: new Types.ObjectId(workshop), ...rest})
  }

  async getWorkshopOrders(): Promise<WorkshopOrder[] | undefined> {
    return this.workshopOrderModel.find()
  }

  async getWorkshopOrder(id: string): Promise<WorkshopOrder | undefined> {
    return this.workshopOrderModel.findOne({_id: new Types.ObjectId(id)})
  }

  async updateWorkshopOrder(id: string, order: any): Promise<any> {
    return this.workshopOrderModel.updateOne({_id: new Types.ObjectId(id)}, {$set: order})
  }

  async receiveWorkshopOrder(id: string): Promise<any> {
    const workshopOrder = await this.getWorkshopOrder(id)

    if (workshopOrder?.cut["order"]) {
      const oldItems = workshopOrder?.cut["order"]?.articles?.map(art => {
        if (art?.customArticle) {
          return {booked: art.booked, quantity: art.quantity, common: art.common, hasToBeCut: art.hasToBeCut, customArticle: art?.customArticle?._id}
        } else {
          return {booked: art.booked, quantity: art.quantity, common: art.common, hasToBeCut: art.hasToBeCut, article: art?.article?._id}
        }
      }) 
      await this.cutsServices.insertItems(workshopOrder?.cut?._id, oldItems)
    }

    await Promise.all((workshopOrder?.cut["order"]?.articles || workshopOrder?.cut["manualItems"])?.map(async a => {
      if (workshopOrder?.cut["order"] && a.hasToBeCut && (a.quantity > a.booked)) {
        this.ordersService.updateArticleBooked(workshopOrder?.cut["order"]?._id, a[a.common ? "article" : "customArticle"]?._id, (a.booked || 0) + (a.quantity - (a.booked || 0)), a.common ? "" : "true")
        if (a.common) {
          this.articlesService.updateStock(a?.article?.stock + (a.quantity - a.booked), a?.article?._id)
        }
      } else {
        this.articlesService.updateStock(a?.article?.stock + a.quantity, a?.article?._id)
      }
    }))
    

    return this.workshopOrderModel.updateOne({_id: new Types.ObjectId(id)}, {$set: {deliveryDate: new Date()}})
  }
}
