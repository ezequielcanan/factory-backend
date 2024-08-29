import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from './schemas/orders.schema';
import { Item, ItemSchema } from './schemas/item.schema';
import { Article, ArticleSchema } from 'src/articles/schema/articles.schema';
import { CustomArticle, CustomArticleSchema } from 'src/articles/schema/customArticle.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {name: Order.name, schema: OrderSchema},
      {name: Item.name, schema: ItemSchema},
      {name: Article.name, schema: ArticleSchema},
      {name: CustomArticle.name, schema: CustomArticleSchema},
    ]),
    ConfigModule
  ],
  controllers: [OrdersController],
  providers: [OrdersService]
})
export class OrdersModule {}
