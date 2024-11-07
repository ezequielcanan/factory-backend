import { IsNumber, IsOptional, MinLength } from "class-validator";

export class CreateArticleDto {
  @MinLength(1)
  description: string

  @IsNumber()
  stock: number

  @IsOptional()
  @IsNumber()
  price: number
  
  @MinLength(1)
  color: string

  @MinLength(1)
  size: string

  cateogry: string

  material: boolean
}