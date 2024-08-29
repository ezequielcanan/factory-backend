import { Module } from '@nestjs/common';
import { ArticlesController } from './articles.controller';
import { ArticlesService } from './articles.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Article, ArticleSchema } from './schema/articles.schema';
import { ConfigModule } from '@nestjs/config';
import { CustomArticle, CustomArticleSchema } from './schema/customArticle.schema';

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
      }
    ]),
    ConfigModule
  ],
  providers: [ArticlesService],
  controllers: [ArticlesController]
})
export class ArticlesModule {}
