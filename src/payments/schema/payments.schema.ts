import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

@Schema()
export class Payment {
  @Prop()
  amount: Number

  @Prop({type: Types.ObjectId, ref: "clients"})
  client: Types.ObjectId

  @Prop()
  date: Date
}

export const PaymentSchema = SchemaFactory.createForClass(Payment)
export type PaymentDocument = HydratedDocument<Payment>