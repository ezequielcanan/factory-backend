import { IsEmail, MinLength } from "class-validator";

export class CreateUserDto {
  @IsEmail()
  @MinLength(1)
  email: string

  @MinLength(4)
  password: string
}