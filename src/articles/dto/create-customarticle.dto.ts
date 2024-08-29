import { IsString } from "class-validator";

export class CreateCustomArticleDto {
  @IsString()
  detail: string
}