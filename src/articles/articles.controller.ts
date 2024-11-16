import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import {ConfigService} from "@nestjs/config"
import { CreateArticleDto } from './dto/create-article.dto';
import { CreateCustomArticleDto } from './dto/create-customarticle.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';

@Controller('articles')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.Prices, Role.Orders)
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
  async getArticles(@Query("page") page: string, @Query("color") color: string, @Query("size") size: string, @Query("category") category: string, @Query("society") society: string, @Query("search") search: string, @Query("materials") materials: string) {
    return this.articlesService.getArticles(page, color, size, category, society, search, materials ? true : false)
  }

  @Get("/:id")
  async getArticle(@Param("id") id: string) {
    return this.articlesService.getArticle(id)
  }

  @Put("/:id")
  async updateArticle(@Param("id") id: string, @Body() article: CreateArticleDto) {
    return this.articlesService.updateArticle(id, article)
  }

  @Delete("/:id")
  async deleteArticle(@Param("id") id: string) {
    return this.articlesService.deleteArticle(id)
  }

  @Put("/stock/:id")
  async updateStock(@Param("id") id: string, @Query("stock") stock: string) {
    return this.articlesService.updateStock(Number(stock), id)
  }
}