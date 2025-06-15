import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Booking, BookingSchema } from '../../database/schemas/booking.schema';
import { RoomModule } from '../rooms/room.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Booking.name, schema: BookingSchema }]),
    RoomModule,
    NotificationsModule,
    UsersModule,
  ],
  controllers: [BookingController],
  providers: [BookingService],
})
export class BookingModule {}
