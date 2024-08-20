import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { Item, ItemSchema } from "src/orders/schemas/item.schema";

@Schema()
export class Cuts {
  @Prop()
  priority: number

  @Prop()
  detail: string

  @Prop({type: [ItemSchema]})
  items: Item[]
}

export const CutsSchema = SchemaFactory.createForClass(Cuts)
export type CutsDocument = HydratedDocument<Cuts>