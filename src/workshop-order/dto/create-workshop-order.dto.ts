import { IsOptional, IsString } from "class-validator";

export class CreateWorkshopOrderDto {
  @IsString()
  workshop: string

  @IsString()
  cut: string

  date: Date

  @IsOptional()
  articles: String[]
}