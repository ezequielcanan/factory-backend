import { Type } from "class-transformer";
import { ItemDto } from "src/orders/dto/create-order.dto";
import { IsArray, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";

export class CreateCutDto {
  @IsNumber()
  @IsOptional()
  prority: number

  @IsString()
  @IsOptional()
  detail: string

  @IsOptional()
  @IsString()
  order: string

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemDto)
  articles: ItemDto[]

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemDto)
  manualItems: ItemDto[];
}