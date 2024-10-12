import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { Article } from "src/articles/schema/articles.schema";
import { CustomArticle } from "../../articles/schema/customArticle.schema";

@Schema()
export class Item {
  @Prop()
  booked: number

  @Prop()
  quantity: number

  @Prop()
  common: boolean

  @Prop()
  hasToBeCut: boolean

  @Prop({type: Types.ObjectId, ref: CustomArticle.name})
  customArticle: Types.ObjectId

  @Prop({type: Types.ObjectId, ref: Article.name})
  article: Types.ObjectId

  @Prop()
  unitPrice: number

  @Prop()
  price: number

  @Prop()
  received: number
}

export const ItemSchema = SchemaFactory.createForClass(Item)
export type ItemDocument = HydratedDocument<Item>