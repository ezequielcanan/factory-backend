import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

@Schema()
export class Article {
    @Prop()
    stock: number

    @Prop()
    description: string

    @Prop()
    color: string

    @Prop()
    size: string
}

export const ArticleSchema = SchemaFactory.createForClass(Article)
export type ArticleDocument = HydratedDocument<Article>