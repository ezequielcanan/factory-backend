import { Controller } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import {ConfigService} from "@nestjs/config"

@Controller('articles')
export class ArticlesController {
  constructor(
    private readonly articlesService: ArticlesService,
    private config: ConfigService
  ) {}
  
}