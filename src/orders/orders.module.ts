import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from './schemas/orders.schema';
import { Item, ItemSchema } from './schemas/item.schema';
import { Article, ArticleSchema } from 'src/articles/schema/articles.schema';
import { CustomArticle, CustomArticleSchema } from 'src/articles/schema/customArticle.schema';
import { ArticlesService } from 'src/articles/articles.service';
import { Cut, CutsSchema } from 'src/cuts/schema/cuts.schema';
import { CutsService } from 'src/cuts/cuts.service';
import { Client, ClientSchema } from 'src/clients/schema/clients.schema';
import { WorkshopOrder, WorkshopOrderSchema } from 'src/workshop-order/schema/workshop-order.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {name: Order.name, schema: OrderSchema},
      {name: Item.name, schema: ItemSchema},
      {name: Cut.name, schema: CutsSchema},
      {name: Article.name, schema: ArticleSchema},
      {name: CustomArticle.name, schema: CustomArticleSchema},
      {name: Client.name, schema: ClientSchema},
      {name: WorkshopOrder.name, schema: WorkshopOrderSchema},
    ]),
    ConfigModule
  ],
  controllers: [OrdersController],
  providers: [OrdersService, ArticlesService, CutsService],
  exports: [OrdersService]
})
export class OrdersModule {}
