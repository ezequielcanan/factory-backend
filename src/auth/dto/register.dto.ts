import { IsEmail, MinLength } from "class-validator";

export class RegisterDto {
  @MinLength(1)
  username: string

  @IsEmail()
  @MinLength(1)
  email: string

  @MinLength(4)
  password: string
}