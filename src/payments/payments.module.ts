import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Payment, PaymentSchema } from './schema/payments.schema';
import { ClientsService } from 'src/clients/clients.service';
import { Client, ClientSchema } from 'src/clients/schema/clients.schema';
import { Order, OrderSchema } from 'src/orders/schemas/orders.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {name: Payment.name, schema: PaymentSchema},
      {name: Client.name, schema: ClientSchema},
      {name: Order.name, schema: OrderSchema},
    ])
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, ClientsService]
})
export class PaymentsModule {}
