import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import * as moment from 'moment';

@Controller('activities')
export class ActivitiesController {
  constructor(
    private readonly activitiesService: ActivitiesService
  ) {}

  @Post()
  async newActivity(@Body() activity: CreateActivityDto) {
    return this.activitiesService.createActivity(activity)
  }

  @Put("/:id")
  async updateActivity(@Body() activity: CreateActivityDto, @Param("id") id: string) {
    return this.activitiesService.updateActivity(id, activity)
  }

  @Get()
  async getActivities(@Query("to") to: string, @Query("from") from: string) {
    return this.activitiesService.getActivities(moment.utc(to, "YYYY-MM-DD").toDate(), moment.utc(from, "YYYY-MM-DD").toDate())
  }

  @Delete("/:id")
  async deleteActivity(@Param("id") id: string) {
    return this.activitiesService.deleteActivity(id)
  }
}
