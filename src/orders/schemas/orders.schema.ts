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
  society: string

  @Prop()
  deliveryDate: Date

  @Prop()
  date: Date

  @Prop()
  finished: boolean

  @Prop()
  extraInfo: string

  @Prop()
  paid: number

  @Prop()
  finalDate: Date

  @Prop()
  mode: boolean

  @Prop({ type: [Types.ObjectId], ref: 'Order' })
  suborders: Types.ObjectId[]
}

export const OrderSchema = SchemaFactory.createForClass(Order)

OrderSchema.pre("findOne", function (next) {
  this.populate('articles.article')
  this.populate('articles.customArticle')
  this.populate('suborders')
  this.populate("client")
  next()
})

OrderSchema.pre("find", function (next) {
  this.populate('articles.article')
  this.populate('articles.customArticle')
  this.populate('suborders')
  this.populate("client")
  next()
})


export type OrderDocument = HydratedDocument<Order>
