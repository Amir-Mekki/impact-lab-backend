import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RoomDocument = Room & Document;

@Schema({ timestamps: true })
export class Room {
  _id?: string;

  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  type: 'meeting' | 'open-space' | 'studio' | 'relaxation' | 'kitchen';

  @Prop()
  description: string;

  @Prop([String])
  amenities: string[]; // e.g. ['TV', 'Whiteboard', 'AC']

  @Prop({ default: 1 })
  capacity: number;

  @Prop([String])
  images: string[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  pricePerHour: number;

  @Prop({ default: 0 })
  pricePerDay: number;

  @Prop({
    type: Object,
    default: {
      monday: { open: '08:00', close: '18:00' },
      tuesday: { open: '08:00', close: '18:00' },
      wednesday: { open: '08:00', close: '18:00' },
      thursday: { open: '08:00', close: '18:00' },
      friday: { open: '08:00', close: '18:00' },
      saturday: { open: null, close: null },
      sunday: { open: null, close: null },
    },
  })
  availabilitySchedule: {
    [key in 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday']: {
      open: string | null;
      close: string | null;
    };
  };

  @Prop({ default: false })
  isReservable: boolean;

  @Prop({ default: false })
  showInHomepage: boolean;
}

export const RoomSchema = SchemaFactory.createForClass(Room);
