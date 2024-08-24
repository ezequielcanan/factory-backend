import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {Article, ArticleDocument} from "./schema/articles.schema"
import { CreateArticleDto } from './dto/create-article.dto';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectModel(Article.name) private articleModel: Model<ArticleDocument>
  ) {}

  async createArticle(article: CreateArticleDto): Promise<Article | undefined> {
    return this.articleModel.create(article)
  }

  async getArticles(): Promise<Article[]> {
    return this.articleModel.find()
  }
}
