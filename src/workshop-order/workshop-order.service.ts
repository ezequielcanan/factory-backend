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
  ) { }

  async createWorkshopOrder(order: CreateWorkshopOrderDto): Promise<WorkshopOrder | undefined> {
    const { cut, workshop, articles, ...rest } = order
    return this.workshopOrderModel.create({ cut: new Types.ObjectId(cut), workshop: new Types.ObjectId(workshop), articles: articles?.map(a => { return { ...a, [a?.article ? "article" : "customArticle"]: new Types.ObjectId(a[a?.article ? "article" : "customArticle"]) } }), ...rest })
  }

  async getWorkshopOrders(): Promise<WorkshopOrder[] | undefined> {
    return this.workshopOrderModel.find()
  }

  async getWorkshopOrder(id: string): Promise<WorkshopOrder | undefined> {
    return this.workshopOrderModel.findOne({ _id: new Types.ObjectId(id) })
  }

  async updateWorkshopOrder(id: string, order: any): Promise<any> {
    return this.workshopOrderModel.updateOne({ _id: new Types.ObjectId(id) }, { $set: order })
  }

  async deleteWorkshopOrder(id: string): Promise<any> {
    return this.workshopOrderModel.findOneAndDelete({ _id: new Types.ObjectId(id) })
  }

  async updateArticleReceived(oid: string, aid: string, qty: string, custom: string): Promise<any> {
    const workshopOrder = await this.getWorkshopOrder(oid)
    const article = workshopOrder?.articles?.find(art => String(art?.[custom ? "customArticle" : "article"]?._id) == aid)

    const findObj = this.ordersService.getFindObjForArticle(oid, aid, custom)
    const setObj = {
      $set: {
        "articles.$.received": parseInt(qty) >= 0 ? parseInt(qty) : 0
      }
    }
    const result = await this.workshopOrderModel.updateOne(
      findObj,
      setObj
    );


    return result;

  }

  async receiveWorkshopOrder(id: string, articles: any): Promise<any> {
    const workshopOrder = await this.getWorkshopOrder(id)

    /*if (workshopOrder?.cut["order"]) {
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
    

    return this.workshopOrderModel.updateOne({_id: new Types.ObjectId(id)}, {$set: {deliveryDate: new Date()}})*/

    await Promise.all(articles?.map(async a => {
      const quantityInWorkshop = Number(a?.quantity || 0) - Number(a?.booked || 0)
      const tryingToRecibe = (a?.received || 0) + (a?.receiving || 0)
      const updatingQuantity = tryingToRecibe < 0 ? (-a?.received || 0) : (quantityInWorkshop >= tryingToRecibe ? (a?.receiving || 0) : 0)
      const isCustom = a.article ? "article" : "customArticle"
      this.updateArticleReceived(workshopOrder["_id"], a[isCustom]?._id, (a?.received || 0) + updatingQuantity, a.article ? "" : "true")

      if (a.article) {
        this.articlesService.updateStock((a?.article?.stock || 0) + updatingQuantity, a?.article?._id)
      }
      if (workshopOrder?.cut["order"]) {
        const article = workshopOrder?.cut["order"]?.articles?.find(art => art[isCustom]?._id == a[isCustom]?._id)
        const booked = (article?.booked || 0) + (updatingQuantity || 0)
        this.ordersService.updateArticleBooked(workshopOrder?.cut["order"]?._id, a[isCustom]?._id, booked > article?.quantity ? article?.quantity : booked, a.article ? "" : "true")
      }
    }))

    return true
  }
}
