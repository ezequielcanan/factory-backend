import { Module } from '@nestjs/common';
import { WorkshopOrderController } from './workshop-order.controller';
import { WorkshopOrderService } from './workshop-order.service';
import { MongooseModule } from '@nestjs/mongoose';
import { WorkshopOrder, WorkshopOrderSchema } from './schema/workshop-order.schema';
import { Workshop, WorkshopSchema } from 'src/workshops/schema/workshops.schema';
import { ArticlesService } from 'src/articles/articles.service';
import { OrdersService } from 'src/orders/orders.service';
import { Article, ArticleSchema } from 'src/articles/schema/articles.schema';
import { CustomArticle, CustomArticleSchema } from 'src/articles/schema/customArticle.schema';
import { Order, OrderSchema } from 'src/orders/schemas/orders.schema';
import { CutsService } from 'src/cuts/cuts.service';
import { Cut, CutsSchema } from 'src/cuts/schema/cuts.schema';
import { Client, ClientSchema } from 'src/clients/schema/clients.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {name: WorkshopOrder.name, schema: WorkshopOrderSchema},
      {name: Workshop.name, schema: WorkshopSchema},
      {name: Article.name, schema: ArticleSchema},
      {name: CustomArticle.name, schema: CustomArticleSchema},
      {name: Order.name, schema: OrderSchema},
      {name: Cut.name, schema: CutsSchema},
      {name: Client.name, schema: ClientSchema},
    ])
  ],
  controllers: [WorkshopOrderController],
  providers: [WorkshopOrderService, ArticlesService, OrdersService, CutsService]
})
export class WorkshopOrderModule {}
