import { Type } from "class-transformer";
import { IsNumber, IsOptional } from "class-validator";
import { Types } from "mongoose";

export class CreatePaymentDto {
  @IsNumber()
  amount: number

  date: Date

  @IsOptional()
  @Type(() => Types.ObjectId)
  client: Types.ObjectId
}