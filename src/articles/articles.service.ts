import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {Article, ArticleDocument} from "./schema/articles.schema"
import { CreateArticleDto } from './dto/create-article.dto';
import { CustomArticle, CustomArticleDocument } from './schema/customArticle.schema';
import { CreateCustomArticleDto } from './dto/create-customarticle.dto';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectModel(Article.name) private articleModel: Model<ArticleDocument>,
    @InjectModel(CustomArticle.name) private customArticleModel: Model<CustomArticleDocument>
  ) {}

  async createArticle(article: CreateArticleDto): Promise<Article | undefined> {
    return this.articleModel.create(article)
  }

  async getArticles(): Promise<Article[]> {
    return this.articleModel.find()
  }

  async getArticle(id: string): Promise<Article> {
    return this.articleModel.findOne({_id: id})
  }

  async updateArticle(id: string, article: CreateArticleDto): Promise<Article | undefined> {
    return this.articleModel.findOneAndUpdate({_id: id}, {$set: article}, {new: true})
  }

  async updateStock(stock: number, id: string): Promise<Article | undefined> {
    return this.articleModel.findOneAndUpdate({_id: id}, {$set: {stock}}, {new: true})
  }

  async createCustomArticle(article: CreateCustomArticleDto): Promise<CustomArticle | undefined> {
    return this.customArticleModel.create(article)
  }

  async createCustomArticles(articles: CreateCustomArticleDto[]): Promise<CustomArticle[] | undefined> {
    return this.customArticleModel.create(articles)
  }
}
