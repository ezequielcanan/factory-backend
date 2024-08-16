import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { Item, ItemSchema } from "./item.schema";

@Schema()
export class Order {
  @Prop()
  id: number

  @Prop({type: String, enum: ["common", "customized"]})
  type: string

  @Prop({type: [ItemSchema]})
  articles: Item[]

  @Prop()
  finished: boolean
}

export const OrderSchema = SchemaFactory.createForClass(Order)
export type OrderDocument = HydratedDocument<Order>
