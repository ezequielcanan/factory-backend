import { IsNumber, IsOptional, MinLength } from "class-validator";

export class CreateArticleDto {
  @MinLength(1)
  description: string

  @IsNumber()
  stock: number

  @IsOptional()
  @IsNumber()
  price: number
  
  @IsOptional()
  @MinLength(1)
  color: string

  @IsOptional()
  @MinLength(1)
  size: string

  cateogry: string

  material: boolean
}