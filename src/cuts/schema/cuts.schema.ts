import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { Item, ItemSchema } from "src/orders/schemas/item.schema";
import { Order, OrderSchema } from "src/orders/schemas/orders.schema";

@Schema()
export class Cut {
  @Prop()
  priority: number

  @Prop()
  detail: string

  @Prop({type: Types.ObjectId, ref: Order.name})
  order: Types.ObjectId

  @Prop({type: [ItemSchema]})
  items: Item[]
}

export const CutsSchema = SchemaFactory.createForClass(Cut)
export type CutDocument = HydratedDocument<Cut>