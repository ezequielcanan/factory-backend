import { IsNumber, MinLength } from "class-validator";

export class CreateArticleDto {
  @MinLength(5)
  description: string

  @IsNumber()
  stock: number
  
  @MinLength(1)
  color: string

  @MinLength(1)
  size: string

  cateogry: string
}