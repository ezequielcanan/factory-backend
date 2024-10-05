import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Payment, PaymentDocument } from './schema/payments.schema';
import { Model, Types } from 'mongoose';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ClientsService } from 'src/clients/clients.service';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    private readonly clientsService: ClientsService
  ) { }

  async getPaymentsByClient(cid: string): Promise<Payment[] | undefined> {
    return this.paymentModel.find({ client: new Types.ObjectId(cid) })
  }

  async getTotalPaymentsByClient(cid: string): Promise<any> {
    const payments = await this.getPaymentsByClient(cid)
    return payments.reduce((acc, payment) => {
      return Number(acc) + Number(payment?.amount)
    }, 0)
  }

  async getClientBalance(cid: string): Promise<any> {
    const orders = await this.clientsService.getOrdersByClient(cid)

    const ordersTotal = orders.reduce((acc, order) => {
      const multiply = (order?.mode ? 1.21 : 1)
      return acc + (order?.articles?.reduce((artAcc, article) => {
        return artAcc + (((article?.price || 0) * article?.quantity) * multiply)
      }, 0))
    }, 0)

    const paymentsTotal = await this.getTotalPaymentsByClient(cid)

    return {balance: ordersTotal - paymentsTotal, orders}
  }

  async createPayment(payment: CreatePaymentDto): Promise<Payment | undefined> {
    return this.paymentModel.create({...payment, client: new Types.ObjectId(payment?.client)})
  }

  async deletePayment(id: string): Promise<any> {
    return this.paymentModel.deleteOne({ _id: new Types.ObjectId(id) })
  }

  async updatePayment(id: string, property: string, value: string): Promise<Payment | undefined> {
    const updateObj = {}
    updateObj[property] = value
    return this.paymentModel.findOneAndUpdate({ _id: new Types.ObjectId(id) }, { $set: updateObj }, { new: true })
  }

  async getClientsResume(): Promise<any> {
    const clients = await this.clientsService.getClients(false, "")
    await Promise.all(clients.map(async (client, i) => {
      const result = await this.getClientBalance(client["_id"])

      clients[i]["balance"] = result["balance"]
    }))

    return clients.sort((a,b) => b["balance"] - a["balance"])
  }

  async getClientResume(cid: string): Promise<any> {
    const client = await this.clientsService.getClient(cid)
    const clientResume = await this.getClientBalance(cid)
    const payments = await this.getPaymentsByClient(cid)

    return {...client["_doc"], ...clientResume, payments}
  }

}
