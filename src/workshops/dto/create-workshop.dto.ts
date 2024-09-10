import { IsNotEmpty, IsString } from "class-validator";

export class CreateWorkshopDto {
  @IsString()
  @IsNotEmpty()
  name: string

  phone: string

  address: string
}