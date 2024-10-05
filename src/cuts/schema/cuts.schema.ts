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

  @Prop({type: [ItemSchema]})
  manualItems: Item[]

  @Prop()
  description: string
}

export const CutsSchema = SchemaFactory.createForClass(Cut)

CutsSchema.pre("findOne", function (next) {
  this.populate('order')
  this.populate('items.article')
  this.populate('items.customArticle')
  this.populate('manualItems.article')
  next()
})

CutsSchema.pre("find", function (next) {
  this.populate('order')
  this.populate('items.article')
  this.populate('items.customArticle')
  this.populate('manualItems.article')
  next()
})

export type CutDocument = HydratedDocument<Cut>