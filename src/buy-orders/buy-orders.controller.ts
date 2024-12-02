import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
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

  @Get()
  async getBuyOrders(@Query("page") page: string, @Query("search") search: string) {
    const result = await this.buyOrderService.getOrders(page, search)
    return result
  }

  @Get("/:id")
  async getBuyOrder(@Param("id") id: string) {
    const result = await this.buyOrderService.getOrder(id)
    return result
  }

  @Put("/price/:oid/:aid")
  async updateArticleUnitPrice(@Param() params: { oid: string, aid: string }, @Query("custom") custom: string, @Query("price") price: string) {
    const { oid, aid } = params
    const result = await this.buyOrderService.updateArticleUnitPrice(oid, aid, custom, price)
    return result
  }
}
