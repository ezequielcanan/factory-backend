import { Module } from '@nestjs/common';
import { ClientsController } from './clients.controller';
import { ClientsService } from './clients.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Client, ClientSchema } from './schema/clients.schema';
import { Order, OrderSchema } from 'src/orders/schemas/orders.schema';
import { BuyOrder, BuyOrderSchema } from 'src/buy-orders/schema/buy-orders.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {name: Client.name, schema: ClientSchema},
      {name: Order.name, schema: OrderSchema},
      {name: BuyOrder.name, schema: BuyOrderSchema},
    ]),
    ConfigModule
  ],
  controllers: [ClientsController],
  providers: [ClientsService]
})
export class ClientsModule {}
