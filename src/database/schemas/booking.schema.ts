import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from './user.schema';
import { Room } from './room.schema';

export const BookingStatuses = ['pending', 'approved', 'canceled', 'refused'] as const;
export type BookingStatus = (typeof BookingStatuses)[number];

@Schema({ timestamps: true })
export class Booking extends Document {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  user: Types.ObjectId | User;

  @Prop({ type: Types.ObjectId, ref: Room.name, required: true })
  room: Types.ObjectId | Room;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ default: 'pending', enum: BookingStatuses })
  status: BookingStatus;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);
