import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

@Schema()
export class Activity {
  @Prop()
  date: Date

  @Prop()
  title: string

  @Prop()
  description: string

  @Prop()
  delivered: boolean

  @Prop({default: false, type: Boolean})
  cut: boolean

  @Prop()
  cutId: string
}

export const ActivitySchema = SchemaFactory.createForClass(Activity)

export type ActivityDocument = HydratedDocument<Activity>