import { Injectable, Param } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schema/users.schema';
import { Model, Types } from 'mongoose';
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

  async findUser(username: string, field: string = "username"): Promise<User | undefined> {
    const findObj = {}
    findObj[field] = username
    return this.userModel.findOne(findObj)
  }

  async findOneById(id: string): Promise<User | undefined> {
    return this.userModel.findOne({_id: new Types.ObjectId(id)})
  }

  async getUsers(): Promise<User[] | undefined> {
    return this.userModel.find()
  }


  async toggleRole(id: string, role: string): Promise<any> {
    const result = await this.userModel.updateOne({ _id: id }, { 
      $addToSet: {
         roles: role
      }
   })
   
   if(!result.modifiedCount){
      await this.userModel.updateOne({ _id: id }, {
         $pull: {
          roles: role
         }
      })
   }

   return true
  }
}
