import { IsArray, IsBoolean, IsDate, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Types } from 'mongoose';
import { Type, Transform } from 'class-transformer';

export class ItemDto {
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
  @IsBoolean()
  hasToBeCut: boolean
  /*@IsOptional()
  @IsNumber()
  unitPrice: number

  @IsOptional()
  @IsNumber()
  price: number*/
}

export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemDto)
  articles: ItemDto[];

  @IsNotEmpty()
  @IsString()
  client: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  date: Date;

  @IsNotEmpty()
  @IsBoolean()
  finished: boolean;
}
