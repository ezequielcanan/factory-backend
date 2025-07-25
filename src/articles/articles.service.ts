import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Article, ArticleDocument } from "./schema/articles.schema"
import { CreateArticleDto } from './dto/create-article.dto';
import { CustomArticle, CustomArticleDocument } from './schema/customArticle.schema';
import { CreateCustomArticleDto } from './dto/create-customarticle.dto';
import { OrdersService } from 'src/orders/orders.service';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectModel(Article.name) private articleModel: Model<ArticleDocument>,
    @InjectModel(CustomArticle.name) private customArticleModel: Model<CustomArticleDocument>,
    private readonly ordersService: OrdersService
  ) { }

  async createArticle(article: CreateArticleDto): Promise<Article | undefined> {
    return this.articleModel.create(article)
  }

  async getArticles(page: string, color: string, size: string, category: string, society: string, search: string, materials: boolean = false, paginate: boolean = true): Promise<Article[] | any> {
    const limit = 25
    const skip = (Number(page) - 1) * limit

    const findObj = {}
    !materials ? findObj["$or"] = [
      { material: { $exists: false } },
      { material: { $eq: false } }
    ] : findObj["material"] = true
    color && (findObj["color"] = color)
    size && (findObj["size"] = size)
    category && (findObj["category"] = category)
    society && (findObj["society"] = society)
    search && (findObj["description"] = { $regex: search, $options: 'i' })


    let query = this.articleModel.find(findObj).sort({ description: 1 });

    // Aplica paginación solo si paginate es true
    if (paginate) {
      query = query.skip(skip).limit(limit);
    }

    const articles = await query.lean().exec();
    const newArticles = []
    await Promise.all(articles.map(async (article, i) => {
      const booked = await this.ordersService.getBookedQuantity(article?._id)
      newArticles.push({ ...article, booked })
    }))

    return newArticles
  }

  async getArticle(id: string | Types.ObjectId): Promise<Article> {
    return this.articleModel.findOne({ _id: id })
  }

  async updateArticle(id: string, article: CreateArticleDto): Promise<Article | undefined> {
    return this.articleModel.findOneAndUpdate({ _id: id }, { $set: article }, { new: true })
  }

  async updateStock(stock: number, id: string | Types.ObjectId): Promise<Article | undefined> {
    return this.articleModel.findOneAndUpdate({ _id: id }, { $set: { stock } }, { new: true })
  }

  async deleteArticle(id: string | Types.ObjectId): Promise<Article | undefined> {
    return this.articleModel.findOneAndDelete({ _id: id })
  }

  async getCustomArticle(id: string): Promise<Article> {
    return this.customArticleModel.findOne({ _id: id })
  }

  async createCustomArticle(article: CreateCustomArticleDto): Promise<CustomArticle | undefined> {
    return this.customArticleModel.create(article)
  }

  async createCustomArticles(articles: CreateCustomArticleDto[]): Promise<CustomArticle[] | undefined> {
    return this.customArticleModel.create(articles)
  }
}
