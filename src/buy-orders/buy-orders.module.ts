import { Module } from '@nestjs/common';
import { BuyOrdersController } from './buy-orders.controller';
import { BuyOrdersService } from './buy-orders.service';
import { MongooseModule } from '@nestjs/mongoose';
import { BuyOrder, BuyOrderSchema } from './schema/buy-orders.schema';
import { BuyItem, BuyItemSchema } from './schema/buy-item.schema';
import { CustomArticle, CustomArticleSchema } from 'src/articles/schema/customArticle.schema';
import { Article, ArticleSchema } from 'src/articles/schema/articles.schema';

@Module({
  imports: [MongooseModule.forFeature([
    {name: BuyOrder.name, schema: BuyOrderSchema},
    {name: BuyItem.name, schema: BuyItemSchema},
    {name: CustomArticle.name, schema: CustomArticleSchema},
    {name: Article.name, schema: ArticleSchema},
  ])],
  controllers: [BuyOrdersController],
  providers: [BuyOrdersService]
})
export class BuyOrdersModule {}
