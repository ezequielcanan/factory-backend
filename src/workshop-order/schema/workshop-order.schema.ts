import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { Cut } from "src/cuts/schema/cuts.schema";

@Schema()
export class WorkshopOrder {
  @Prop({type: Types.ObjectId, ref: Cut.name})
  cut: Types.ObjectId

  @Prop()
  price: number

  @Prop()
  date: Date

  @Prop()
  deliveryDate: Date
}

export const WorkshopOrderSchema = SchemaFactory.createForClass(WorkshopOrder)
export type WorkshopOrderDocument = HydratedDocument<WorkshopOrder>