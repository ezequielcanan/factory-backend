import { Body, Controller, Post } from '@nestjs/common';
import { BuyOrdersService } from './buy-orders.service';
import { CreateBuyOrderDto } from './dto/create-buy-order.dto';

@Controller('buy-orders')
export class BuyOrdersController {
  constructor(
    private readonly buyOrderService: BuyOrdersService
  ) {}

  @Post()
  async createBuyOrder(@Body() buyOrder: CreateBuyOrderDto) {
    const result = await this.buyOrderService.createBuyOrder(buyOrder)
    return result
  }
}
