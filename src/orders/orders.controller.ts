import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { ConfigService } from '@nestjs/config';
import { ArticlesService } from 'src/articles/articles.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CutsService } from 'src/cuts/cuts.service';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly articlesService: ArticlesService,
    private readonly cutsService: CutsService,
    private config: ConfigService
  ) {}

  
  @Get()
  async getOrders(@Query("society") society: string) {
    return this.ordersService.getOrders(society)
  }

  @Get("/:id")
  async getOrder(@Param("id") id: string) {
    return this.ordersService.getOrderAndCut(id)
  }

  @Post()
  async createOrder(@Body() order: CreateOrderDto) {
    const createdOrder = await this.ordersService.createOrder(order)
    const createdCut = await this.cutsService.createCutFromOrder(createdOrder)
    return createdOrder
  }

  @Get("/booked/:id")
  async getArticleBooked(@Param("id") id: string) {
    const bookedQuantity = await this.ordersService.getBookedQuantity(id);
    const article = await this.articlesService.getArticle(id)
    return {booked: bookedQuantity, stock: article?.stock}
  }

  @Put("/articles/:id")
  async setToCutCommonArticles(@Param("id") id: string) {
    const result = await this.ordersService.setToCutCommonArticles(id);
    return result
  }

  @Put("/quantity/:oid/:aid/:qty")
  async updateArticleQuantity(@Param() params: { oid: string, aid: string, qty: string }, @Query("custom") custom: string) {
    const {oid, aid, qty} = params
    const result = await this.ordersService.updateArticleQuantity(oid, aid, qty, custom)
    return result
  }

  @Put("/booked/:oid/:aid/:qty")
  async updateArticleBooked(@Param() params: { oid: string, aid: string, qty: string }, @Query("custom") custom: string) {
    const {oid, aid, qty} = params
    const result = await this.ordersService.updateArticleBooked(oid, aid, qty, custom)
    return result
  }

  @Put("/cut-state/:oid/:aid")
  async updateArticleCut(@Param() params: { oid: string, aid: string }, @Query("custom") custom: string) {
    const {oid, aid} = params
    const result = await this.ordersService.updateArticleCut(oid, aid, custom)
    return result
  }

  @Put("/price/:oid/:aid")
  async updateArticleUnitPrice(@Param() params: { oid: string, aid: string }, @Query("custom") custom: string, @Query("price") price: string) {
    const {oid, aid} = params
    const result = await this.ordersService.updateArticleUnitPrice(oid, aid, custom, price)
    return result
  }
}
