import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { Society } from "../enums/society.enum";

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

    @Prop()
    category: string

    @Prop({type: String, enum: Society})
    society: Society

    @Prop()
    price: number

    @Prop({default: false, type: Boolean})
    material: boolean

    @Prop()
    measurement: string
}

export const ArticleSchema = SchemaFactory.createForClass(Article)
export type ArticleDocument = HydratedDocument<Article>