import { IsEmail, MinLength } from "class-validator";

export class CreateClientDto {
  email: string

  name: string

  phone: string

  cuit: string

  address: string

  discount: number

  detail: string

  expreso: string

  expresoAddress: string

  supplier: boolean
}