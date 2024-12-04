import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { Item, ItemSchema } from "./item.schema";
import { Client } from "src/clients/schema/clients.schema";

@Schema()
export class Order {
  @Prop()
  orderNumber: number

  @Prop()
  billNumber: string

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
  inPricing: boolean

  @Prop()
  extraInfo: string

  @Prop()
  paid: number

  @Prop()
  finalDate: Date

  @Prop()
  packages: number

  @Prop()
  mode: boolean

  @Prop({ type: [Types.ObjectId], ref: 'Order' })
  suborders: Types.ObjectId[]

  @Prop()
  budget: boolean

  @Prop()
  delivered: boolean

  @Prop()
  priority: number
}

export const OrderSchema = SchemaFactory.createForClass(Order)

OrderSchema.pre("findOne", function (next) {
  this.populate('suborders')
  this.populate("client")
  this.populate({
    path: 'suborders',
    populate: {
      path: 'articles.article',
      model: 'Article',
    }
  });
  this.populate({
    path: 'suborders',
    populate: {
      path: 'articles.customArticle',
      model: 'CustomArticle', // Reemplaza esto con el nombre del modelo correspondiente
    }
  });
  next()
})

OrderSchema.pre("find", function (next) {
  this.populate('suborders')
  this.populate({
    path: 'suborders',
    populate: {
      path: 'articles.article',
      model: 'Article',
    }
  });
  this.populate({
    path: 'suborders',
    populate: {
      path: 'articles.customArticle',
      model: 'CustomArticle', // Reemplaza esto con el nombre del modelo correspondiente
    }
  });
  this.populate("client")
  next()
})


export type OrderDocument = HydratedDocument<Order>
