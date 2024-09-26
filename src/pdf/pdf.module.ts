import { Module } from '@nestjs/common';
import { PdfController } from './pdf.controller';
import { OrdersService } from 'src/orders/orders.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Article, ArticleSchema } from 'src/articles/schema/articles.schema';
import { CustomArticle, CustomArticleSchema } from 'src/articles/schema/customArticle.schema';
import { Cut, CutsSchema } from 'src/cuts/schema/cuts.schema';
import { Client, ClientSchema } from 'src/clients/schema/clients.schema';
import { WorkshopOrder, WorkshopOrderSchema } from 'src/workshop-order/schema/workshop-order.schema';
import { ClientsService } from 'src/clients/clients.service';
import { Order, OrderSchema } from 'src/orders/schemas/orders.schema';
import { Item, ItemSchema } from 'src/orders/schemas/item.schema';
import { CutsService } from 'src/cuts/cuts.service';


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
  controllers: [PdfController],
  providers: [OrdersService, ClientsService, CutsService]
})
export class PdfModule {}
