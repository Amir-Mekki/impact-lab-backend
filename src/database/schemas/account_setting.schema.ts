import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from './user.schema';

export const Languages = {
  fr: 'French',
  en: 'English',
} as const;
export type Language = keyof typeof Languages;

export const Modes = {
  dark: 'Dark',
  light: 'Light',
} as const;
export type Mode = keyof typeof Modes;

export const NotificationModules = ['booking'] as const;
export type NotificationModule = (typeof NotificationModules)[number];

@Schema({ timestamps: true })
export class AccountSetting extends Document {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  user: Types.ObjectId | User;

  @Prop({
    type: String,
    enum: Object.keys(Languages),
    default: 'fr',
  })
  language: Language;

  @Prop({
    type: String,
    enum: Object.keys(Modes),
    default: 'light',
  })
  mode: Mode;

  @Prop({
    type: Object,
    default: {},
  })
  notificationPreferences: {
    [module in NotificationModule]: {
      email: boolean;
      push: boolean;
      sms?: boolean;
    };
  };
}

export const AccountSettingSchema = SchemaFactory.createForClass(AccountSetting);
