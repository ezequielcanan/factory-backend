import { IsOptional, IsString } from "class-validator";

export class CreateCustomArticleDto {
  @IsString()
  detail: string

  @IsOptional()
  @IsString()
  details: string

  @IsOptional()
  @IsString()
  size: string

  @IsOptional()
  @IsString()
  ubicacion: string

  @IsOptional()
  @IsString()
  bordado: string

  
  @IsOptional()
  @IsString()
  bordadoType: string
}