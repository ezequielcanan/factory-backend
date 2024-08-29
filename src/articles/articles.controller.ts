import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import {ConfigService} from "@nestjs/config"
import { CreateArticleDto } from './dto/create-article.dto';
import { CreateCustomArticleDto } from './dto/create-customarticle.dto';

@Controller('articles')
export class ArticlesController {
  constructor(
    private readonly articlesService: ArticlesService,
  ) {}
  
  @Post()
  async createArticle(@Body() article: CreateArticleDto) {
    return this.articlesService.createArticle(article)
  }

  @Post("/custom")
  async createCustomArticle(@Body() articles: CreateCustomArticleDto[]) {
    return this.articlesService.createCustomArticles(articles)
  }

  @Get()
  async getArticles() {
    return this.articlesService.getArticles()
  }

  @Get("/:id")
  async getArticle(@Param("id") id: string) {
    return this.articlesService.getArticle(id)
  }

  @Put("/:id")
  async updateArticle(@Param("id") id: string, @Body() article: CreateArticleDto) {
    return this.articlesService.updateArticle(id, article)
  }

  @Put("/stock/:id")
  async updateStock(@Param("id") id: string, @Query("stock") stock: string) {
    return this.articlesService.updateStock(Number(stock), id)
  }
}