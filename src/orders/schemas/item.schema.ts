import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { Article } from "src/articles/schema/articles.schema";

@Schema()
export class Item {
  @Prop()
  booked: number

  @Prop()
  quantity: number

  @Prop({type: Types.ObjectId, ref: Article.name})
  article: Types.ObjectId
}

export const ItemSchema = SchemaFactory.createForClass(Item)
export type ItemDocument = HydratedDocument<Item>