import { Type } from "class-transformer";
import { IsArray, IsOptional, IsString, ValidateNested } from "class-validator";
import { ItemDto } from "src/orders/dto/create-order.dto";

export class CreateWorkshopOrderDto {
  @IsString()
  workshop: string

  @IsString()
  cut: string

  date: Date

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemDto)
  articles: ItemDto[];
}