import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

@Schema()
export class Client {
  @Prop()
  name: string

  @Prop()
  cuit: string

  @Prop()
  email: string

  @Prop()
  phone: string

  @Prop()
  address: string

  @Prop()
  detail: string

  @Prop()
  discount: number

  @Prop()
  expreso: string

  @Prop()
  expresoAddress: string
}

export const ClientSchema = SchemaFactory.createForClass(Client)
export type ClientDocument = HydratedDocument<Client>