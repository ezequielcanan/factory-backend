import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class CustomArticle {
  @Prop()
  detail: string
}

export const CustomArticleSchema = SchemaFactory.createForClass(CustomArticle)