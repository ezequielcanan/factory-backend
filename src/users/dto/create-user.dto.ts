import { IsEmail, MinLength, isEnum, isString } from "class-validator";

export class CreateUserDto {
  @MinLength(1)
  username: string

  @IsEmail()
  @MinLength(1)
  email: string

  @MinLength(4)
  password: string
  
  role: string
}