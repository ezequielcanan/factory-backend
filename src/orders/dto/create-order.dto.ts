import { IsArray, IsBoolean, IsDate, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Types } from 'mongoose';
import { Type } from 'class-transformer';

class ItemDto {
  booked: number

  quantity: number
  
  common: boolean

  @IsOptional()
  @IsString()
  customArticle: Types.ObjectId

  @IsOptional()
  @IsString()
  article: Types.ObjectId

  @IsOptional()
  @IsNumber()
  unitPrice: number

  @IsOptional()
  @IsNumber()
  price: number
}

export class CreateOrderDto {
  @IsNotEmpty()
  @IsNumber()
  orderNumber: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemDto)
  articles: ItemDto[];

  @IsNotEmpty()
  @IsString()
  client: Types.ObjectId;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  date: Date;

  @IsNotEmpty()
  @IsBoolean()
  finished: boolean;
}
