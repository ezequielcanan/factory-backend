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
import { UsersService } from 'src/users/users.service';
import { User, UserSchema } from 'src/users/schema/users.schema';
import { Client, ClientSchema } from 'src/clients/schema/clients.schema';
import { WorkshopOrder, WorkshopOrderSchema } from 'src/workshop-order/schema/workshop-order.schema';

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
      },
      {
        name: User.name,
        schema: UserSchema
      },
      {
        name: Client.name,
        schema: ClientSchema
      },
      {
        name: WorkshopOrder.name,
        schema: WorkshopOrderSchema
      }
    ]),
    ConfigModule
  ],
  providers: [ArticlesService, OrdersService, CutsService, UsersService],
  controllers: [ArticlesController],
  exports: [ArticlesService]
})
export class ArticlesModule {}
