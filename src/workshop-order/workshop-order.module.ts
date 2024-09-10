import { Module } from '@nestjs/common';
import { WorkshopOrderController } from './workshop-order.controller';
import { WorkshopOrderService } from './workshop-order.service';
import { MongooseModule } from '@nestjs/mongoose';
import { WorkshopOrder, WorkshopOrderSchema } from './schema/workshop-order.schema';
import { Workshop, WorkshopSchema } from 'src/workshops/schema/workshops.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {name: WorkshopOrder.name, schema: WorkshopOrderSchema},
      {name: Workshop.name, schema: WorkshopSchema}
    ])
  ],
  controllers: [WorkshopOrderController],
  providers: [WorkshopOrderService]
})
export class WorkshopOrderModule {}
