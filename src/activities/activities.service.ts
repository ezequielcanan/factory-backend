import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Activity, ActivityDocument } from './schema/activities.schema';
import { Model } from 'mongoose';
import { OrdersService } from 'src/orders/orders.service';
import { CreateActivityDto } from './dto/create-activity.dto';

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectModel(Activity.name) private activityModel: Model<ActivityDocument>,
    private ordersService: OrdersService
  ) {}

  async createActivity(activity: CreateActivityDto): Promise<Activity | undefined> {
    return this.activityModel.create(activity)
  }

  async getActivities(to, from): Promise<any> {
    const orders = await this.ordersService.getRecentOrders(from, to)
    const activities = await this.activityModel.find({date: {$gte: from, $lte: to}})
  }
}
