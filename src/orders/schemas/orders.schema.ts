import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { Item, ItemSchema } from "./item.schema";
import { Client } from "src/clients/schema/clients.schema";

@Schema()
export class Order {
  @Prop()
  orderNumber: number

  @Prop({type: [ItemSchema]})
  articles: Item[]

  @Prop({type: Types.ObjectId, ref: Client.name})
  client: Types.ObjectId

  @Prop()
  date: Date

  @Prop()
  finished: boolean
}

export const OrderSchema = SchemaFactory.createForClass(Order)
export type OrderDocument = HydratedDocument<Order>
