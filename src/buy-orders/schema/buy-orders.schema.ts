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
  date: Date
}

export const BuyOrderSchema = SchemaFactory.createForClass(BuyOrder)

export type BuyOrderDocument = HydratedDocument<BuyOrder>