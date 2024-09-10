import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { WorkshopsService } from './workshops.service';
import { CreateWorkshopDto } from './dto/create-workshop.dto';

@Controller('workshops')
export class WorkshopsController {
  constructor(
    private readonly workshopsService: WorkshopsService
  ) {}

  @Post()
  async createWorkshop(@Body() workshop: CreateWorkshopDto) {
    return this.workshopsService.createWorkshop(workshop)
  }

  @Get()
  async getWorkshops() {
    return this.workshopsService.getWorkshops()
  }

  @Get("/:id")
  async getWorkshop(@Param("id") id: string) {
    return this.workshopsService.getWorkshop(id)
  }

  @Put("/:id")
  async updateWorkshop(@Param("id") id: string, @Body() workshop: CreateWorkshopDto) {
    return this.workshopsService.updateWorkshop(id, workshop)
  }
}
