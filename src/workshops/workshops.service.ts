import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Workshop, WorkshopDocument } from './schema/workshops.schema';
import { Model } from 'mongoose';
import { CreateWorkshopDto } from './dto/create-workshop.dto';

@Injectable()
export class WorkshopsService {
  constructor(
    @InjectModel(Workshop.name) private workshopModel: Model<WorkshopDocument>
  ) {}

  async createWorkshop(workshop: CreateWorkshopDto): Promise<Workshop | undefined> {
    return this.workshopModel.create(workshop)
  }

  async getWorkshops(): Promise<Workshop[] | undefined> {
    return this.workshopModel.find()
  }

  async getWorkshop(id: string): Promise<Workshop | undefined> {
    return this.workshopModel.findOne({_id: id})
  }

  async updateWorkshop(id: string, workshop: CreateWorkshopDto): Promise<Workshop | undefined> {
    return this.workshopModel.findOneAndUpdate({_id: id}, {$set: workshop}, {new: true})
  }
}
