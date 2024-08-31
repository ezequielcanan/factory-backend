import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
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
  async getOrders() {
    return this.ordersService.getOrders()
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
  async getArticleBooked (@Param("id") id: string) {
    const bookedQuantity = await this.ordersService.getBookedQuantity(id);
    const article = await this.articlesService.getArticle(id)
    return {booked: bookedQuantity, stock: article?.stock}
  }

  @Put("/articles/:id")
  async setToCutCommonArticles (@Param("id") id: string) {
    const result = await this.ordersService.setToCutCommonArticles(id);
    return result
  }
}
