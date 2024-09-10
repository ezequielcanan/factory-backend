import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

@Schema()
export class Workshop {
  @Prop()
  name: string

  @Prop()
  phone: string

  @Prop()
  address: string
}

export const WorkshopSchema = SchemaFactory.createForClass(Workshop)
export type WorkshopDocument = HydratedDocument<Workshop>