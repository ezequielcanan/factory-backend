import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

@Schema()
export class User {
  @Prop()
  username: string
  
  @Prop()
  email: string

  @Prop()
  password: string

  @Prop({type: String, enum: ["admin", "orders", "cuts", "payments"]})
  role: string
}

export const UserSchema = SchemaFactory.createForClass(User)
export type UserDocument = HydratedDocument<User>