import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schema/users.schema';
import { Model } from 'mongoose';
import * as bcrypt from "bcrypt"
import { RegisterDto } from 'src/auth/dto/register.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>
  ) {}

  async createUser(user: any): Promise<User> {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const result = this.userModel.create({ username: user.username, email: user.email, password: hashedPassword })
    return result
  }

  async findUser(username: string): Promise<User | undefined> {
    return this.userModel.findOne({username})
  } 
}
