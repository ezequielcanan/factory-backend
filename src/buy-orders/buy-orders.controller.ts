import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
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

  @Put("/quantity/:oid/:aid/:qty")
  async updateArticleQuantity(@Param() params: { oid: string, aid: string, qty: string }, @Query("custom") custom: string) {
    const { oid, aid, qty } = params
    const result = await this.buyOrderService.updateArticleQuantity(oid, aid, qty, custom)
    return result
  }

  @Delete("/articles/:oid/:aid")
  async deleteArticleFromOrder(@Param("oid") oid: string, @Param("aid") aid: string, @Query("custom") custom: string) {
    const result = await this.buyOrderService.deleteArticle(oid, aid, custom ? true : false)
    return result
  }

  @Post("/articles/:oid/:aid")
  async addArticles(@Param("oid") oid: string, @Param("aid") aid: string, @Query("custom") custom: string) {
    const result = await this.buyOrderService.addArticle(oid, aid, custom ? true : false)
    return result
  }

  @Delete("/:id")
  async deleteOrder(@Param("id") id: string) {
    const result = await this.buyOrderService.deleteOrder(id);
    return result
  }

  @Put("/:id")
  async updateOrder(@Param("id") id: string, @Query("property") property: string, @Query("value") value: string) {
    return this.buyOrderService.updateOrder(id, property, value)
  }
}
