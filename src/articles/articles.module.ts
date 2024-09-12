import { Module } from '@nestjs/common';
import { ArticlesController } from './articles.controller';
import { ArticlesService } from './articles.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Article, ArticleSchema } from './schema/articles.schema';
import { ConfigModule } from '@nestjs/config';
import { CustomArticle, CustomArticleSchema } from './schema/customArticle.schema';
import { OrdersService } from 'src/orders/orders.service';
import { Order, OrderSchema } from 'src/orders/schemas/orders.schema';
import { Cut, CutsSchema } from 'src/cuts/schema/cuts.schema';
import { CutsService } from 'src/cuts/cuts.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Article.name,
        schema: ArticleSchema
      },
      {
        name: CustomArticle.name,
        schema: CustomArticleSchema
      },
      {
        name: Order.name,
        schema: OrderSchema
      },
      {
        name: Cut.name,
        schema: CutsSchema
      }
    ]),
    ConfigModule
  ],
  providers: [ArticlesService, OrdersService, CutsService],
  controllers: [ArticlesController],
  exports: [ArticlesService]
})
export class ArticlesModule {}
