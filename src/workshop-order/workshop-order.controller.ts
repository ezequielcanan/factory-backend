import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { WorkshopOrderService } from './workshop-order.service';
import { CreateWorkshopOrderDto } from './dto/create-workshop-order.dto';

@Controller('workshop-order')
export class WorkshopOrderController {
  constructor(
    private readonly workshopOrderService: WorkshopOrderService
  ) {}

  @Get()
  async getWorkshopOrders() {
    return this.workshopOrderService.getWorkshopOrders()
  }

  @Get("/:id")
  async getWorkshopOrder(@Param() id: string) {
    return this.workshopOrderService.getWorkshopOrder(id)
  }

  @Post()
  async createWorkshopOrder(@Body() order: CreateWorkshopOrderDto) {
    return this.workshopOrderService.createWorkshopOrder(order)
  }

  @Put("/:id")
  async updateWorkshopOrder(@Param() id: string, @Body() order) {
    return this.workshopOrderService.updateWorkshopOrder(id, order)
  }

  @Put("/receive/:id")
  async receiveWorkshopOrder(@Param() id: string) {
    return this.workshopOrderService.receiveWorkshopOrder(id)
  }
}
