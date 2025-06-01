import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as bcrypt from 'bcryptjs';

// Define the User document interface
export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required: true })
  firstname: string;

  @Prop({ required: true })
  lastname: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

// Create schema from the class
export const UserSchema = SchemaFactory.createForClass(User);

// Add instance methods to the schema
UserSchema.methods.hashPassword = async function () {
  if (this.password) {
    this.password = await bcrypt.hash(this.password, 10);
  }
};

UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

// Pre-save hook to hash the password before storing it
UserSchema.pre('save', async function (this: any, next) {
  if (this.isModified('password')) {
    await this.hashPassword();
  }
  next();
});
