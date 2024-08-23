import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { Role } from "src/auth/enums/role.enum";

@Schema()
export class User {
  @Prop()
  username: string
  
  @Prop({type: String, unique: true})
  email: string

  @Prop()
  password: string

  @Prop({type: [String], enum: Role})
  roles: Role[]
}

export const UserSchema = SchemaFactory.createForClass(User)
export type UserDocument = HydratedDocument<User>