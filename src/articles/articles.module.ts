import { Module } from '@nestjs/common';
import { ArticlesController } from './articles.controller';
import { ArticlesService } from './articles.service';

@Module({
  providers: [ArticlesService],
  controllers: [ArticlesController]
})
export class ArticlesModule {}
