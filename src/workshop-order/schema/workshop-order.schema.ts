import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { Cut } from "src/cuts/schema/cuts.schema";
import { Item, ItemSchema } from "src/orders/schemas/item.schema";
import { Workshop } from "src/workshops/schema/workshops.schema";

@Schema()
export class WorkshopOrder {
  @Prop({type: Types.ObjectId, ref: Workshop.name})
  workshop: Types.ObjectId

  @Prop({type: Types.ObjectId, ref: Cut.name})
  cut: Types.ObjectId

  @Prop()
  price: number

  @Prop()
  date: Date

  @Prop()
  deliveryDate: Date

  @Prop()
  description: string

  @Prop()
  detail: string

  @Prop({ type: [String] })
  articles: String[]

  @Prop({type: [ItemSchema]})
  items: Item[]
}

export const WorkshopOrderSchema = SchemaFactory.createForClass(WorkshopOrder)

WorkshopOrderSchema.pre("findOne", function (next) {
  this.populate('cut')
  this.populate('workshop')
  next()
})

WorkshopOrderSchema.pre("find", function (next) {
  this.populate('cut')
  this.populate('workshop')
  next()
})

export type WorkshopOrderDocument = HydratedDocument<WorkshopOrder>