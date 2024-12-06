import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { BuyItem } from "./buy-item.schema"
import { HydratedDocument, Types } from "mongoose"
import { Client } from "src/clients/schema/clients.schema"

@Schema()
export class BuyOrder {
  @Prop()
  orderNumber: number

  @Prop({type: [BuyItem]})
  articles: BuyItem[]

  @Prop({type: Types.ObjectId, ref: Client.name})
  client: Types.ObjectId

  @Prop()
  extraInfo: string

  @Prop()
  mode: boolean

  @Prop()
  priority: boolean

  @Prop()
  date: Date

  @Prop()
  billNumber: string

  @Prop()
  billDate: Date

  @Prop()
  received: boolean

  @Prop()
  receivedDate: Date
}

export const BuyOrderSchema = SchemaFactory.createForClass(BuyOrder)

BuyOrderSchema.pre("findOne", function (next) {
  this.populate("client")
  next()
})

BuyOrderSchema.pre("find", function (next) {
  this.populate("client")
  next()
})

export type BuyOrderDocument = HydratedDocument<BuyOrder>