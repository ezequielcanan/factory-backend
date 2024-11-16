import { Module } from '@nestjs/common';
import { BuyOrdersController } from './buy-orders.controller';
import { BuyOrdersService } from './buy-orders.service';

@Module({
  controllers: [BuyOrdersController],
  providers: [BuyOrdersService]
})
export class BuyOrdersModule {}
