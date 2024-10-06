import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsString } from "class-validator";
import { Types } from "mongoose";

export class CreatePaymentDto {
  @IsNumber()
  amount: number

  date: Date

  @IsOptional()
  @IsString()
  detail: string

  @IsOptional()
  @Type(() => Types.ObjectId)
  client: Types.ObjectId
}