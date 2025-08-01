import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Activity, ActivityDocument } from './schema/activities.schema';
import { Model, Types } from 'mongoose';
import { OrdersService } from 'src/orders/orders.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import * as moment from 'moment';

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectModel(Activity.name) private activityModel: Model<ActivityDocument>,
    private ordersService: OrdersService
  ) {}

  async createActivity(activity: CreateActivityDto): Promise<Activity | undefined> {
    return this.activityModel.create(activity)
  }

  async getActivities(to, from, cut = false): Promise<any> {
    const orders = await this.ordersService.getRecentOrders(from, to, "deliveryDate")
    
    const dateString = "DD-MM-YYYY"
    const fromDate = moment(from, dateString).toDate()
    const toDate = to ? moment(to, dateString).add(2, "days").toDate() : new Date()
    const findObj = {date: {$gte: fromDate, $lte: toDate}}
    if (cut) {
      findObj["cut"] = true
    } else {
      findObj["$or"] = [{ cut: { $exists: false } },{ cut: { $eq: false } }]
    }
    const activities = await this.activityModel.find(findObj)
    

    return {orders: orders["orders"], activities}
  }

  async updateActivity(id: string, activity: CreateActivityDto): Promise<Activity | undefined> {
    const newActivity = {...activity}
    /*if (activity?.date) {
      newActivity.date = moment.utc(activity?.date).subtract(1, "day").toDate()
    }*/
    return this.activityModel.findOneAndUpdate({_id: new Types.ObjectId(id)}, {$set: newActivity}, {new: true})
  }

  async deleteActivity(id: string): Promise<Activity | undefined> {
    return this.activityModel.findOneAndDelete({_id: new Types.ObjectId(id)})
  }
}
