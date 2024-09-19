import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from "bcrypt"

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService, private jwtService: JwtService) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findUser(username, "email")
    if (user && bcrypt.compareSync(pass, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any){
    return {
      access_token: this.jwtService.sign(user),
      user
    };
  }

  async register(user: RegisterDto) {
    const existsUser = await this.usersService.findUser(user?.email, "email")
    if (!existsUser) {
      return await this.usersService.createUser(user)
    }
  }
}
