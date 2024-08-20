import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { Article } from "src/articles/schema/articles.schema";
import { CustomArticle, CustomArticleSchema } from "./customArticle.schema";

@Schema()
export class Item {
  @Prop()
  booked: number

  @Prop()
  quantity: number

  @Prop()
  common: boolean

  @Prop({type: CustomArticleSchema})
  customArticle: CustomArticle

  @Prop({type: Types.ObjectId, ref: Article.name})
  article: Types.ObjectId
}

export const ItemSchema = SchemaFactory.createForClass(Item)
export type ItemDocument = HydratedDocument<Item>