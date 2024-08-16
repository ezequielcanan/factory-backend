import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {Article, ArticleDocument} from "./schema/articles.schema"

@Injectable()
export class ArticlesService {
  constructor(
    @InjectModel(Article.name) private pizzaModel: Model<ArticleDocument>
  ) {}
}
