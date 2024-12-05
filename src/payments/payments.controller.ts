import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService
  ) {}

  @Post()
  async createPayment(@Body() payment: CreatePaymentDto) {
    return this.paymentsService.createPayment(payment)
  }

  @Get("/balance")
  async getClientsBalance(@Query("buys") buys: string) {
    return this.paymentsService.getClientsResume(buys ? true : false)
  }

  @Get("/balance/:cid")
  async getClientBalance(@Param("cid") cid: string, @Query("buys") buys: string) {
    return this.paymentsService.getClientResume(cid, buys ? true : false)
  }

  @Get("/:cid")
  async getPaymentsByClient(@Param("cid") cid: string) {
    return this.paymentsService.getPaymentsByClient(cid)
  }


  @Put("/:id")
  async updatePayment(@Param("id") id: string, @Query("property") property: string, @Query("value") value: string) {
    return this.paymentsService.updatePayment(id, property, value)
  }

  @Delete("/:id")
  async deletePayment(@Param("id") id: string) {
    return this.paymentsService.deletePayment(id)
  }
}
