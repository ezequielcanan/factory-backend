import { IsEmail, MinLength } from "class-validator";

export class CreateClientDto {
  email: string

  name: string

  phone: string

  cuit: string

  address: string

  detail: string

  expreso: string

  expresoAddress: string
}