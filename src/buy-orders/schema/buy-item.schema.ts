import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { Article } from "src/articles/schema/articles.schema";
import { CustomArticle } from "src/articles/schema/customArticle.schema";

@Schema()
export class BuyItem {
  @Prop()
  quantity: number

  @Prop({ type: Types.ObjectId, ref: CustomArticle.name })
  customArticle: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: Article.name })
  article: Types.ObjectId

  @Prop()
  price: number

  @Prop({type: Array})
  received: [{
    date: Date,
    quantity: number
  }]
}

export const BuyItemSchema = SchemaFactory.createForClass(BuyItem)
export type BuyItemDocument = HydratedDocument<BuyItem>