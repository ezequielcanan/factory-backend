import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

@Schema()
export class CustomArticle {
  @Prop()
  detail: string

  @Prop()
  details: string
  
  @Prop()
  size: string
  
  @Prop()
  ubicacion: string
  
  @Prop()
  bordado: string

  @Prop()
  bordadoType: string
}

export const CustomArticleSchema = SchemaFactory.createForClass(CustomArticle)
export type CustomArticleDocument = HydratedDocument<CustomArticle>