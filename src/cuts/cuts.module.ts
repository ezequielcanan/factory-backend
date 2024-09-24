import { forwardRef, Module } from '@nestjs/common';
import { CutsController } from './cuts.controller';
import { CutsService } from './cuts.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Cut, CutsSchema } from './schema/cuts.schema';
import { Article, ArticleSchema } from 'src/articles/schema/articles.schema';
import { CustomArticle, CustomArticleSchema } from 'src/articles/schema/customArticle.schema';
import { ArticlesService } from 'src/articles/articles.service';
import { ArticlesModule } from 'src/articles/articles.module';
import { WorkshopOrder, WorkshopOrderSchema } from 'src/workshop-order/schema/workshop-order.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {name: Cut.name, schema: CutsSchema},
      {name: Article.name, schema: ArticleSchema},
      {name: CustomArticle.name, schema: CustomArticleSchema},
      {name: WorkshopOrder.name, schema: WorkshopOrderSchema},
    ])
  ],
  controllers: [CutsController],
  providers: [CutsService]
})
export class CutsModule {}
