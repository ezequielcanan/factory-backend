import { IsEmail, MinLength } from "class-validator";

export class CreateClientDto {
  email: string

  name: string

  phone: string

  cuit: string
}