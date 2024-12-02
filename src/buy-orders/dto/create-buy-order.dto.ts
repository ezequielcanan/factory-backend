import { IsArray, IsBoolean, IsDate, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Types } from 'mongoose';
import { Type, Transform } from 'class-transformer';

export class BuyItemDto {
  quantity: number

  @IsOptional()
  @IsString()
  customArticle: Types.ObjectId

  @IsOptional()
  @IsString()
  article: Types.ObjectId

  @IsOptional()
  @IsNumber()
  price: number

  @IsOptional()
  @IsArray()
  received: [{
    date: Date,
    quantity: number
  }]
}

export class CreateBuyOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BuyItemDto)
  articles: BuyItemDto[];

  @IsOptional()
  @IsString()
  extraInfo: string;

  @IsNotEmpty()
  @IsString()
  client: string

  date: Date
}
