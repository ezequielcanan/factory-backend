import { Prop, Schema } from "@nestjs/mongoose";

@Schema()
export class Activity {
  @Prop()
  date: Date

  @Prop()
  title: string

  @Prop()
  description: string

  @Prop()
  finished: boolean
}