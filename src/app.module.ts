import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseDatabaseModule } from './database/mongoose.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { RoomModule } from './modules/rooms/room.module';
import { BookingModule } from './modules/booking/booking.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AccountSettingsModule } from './modules/account_settings/account_settings.module';

@Module({
  imports: [
    MongooseDatabaseModule,
    AuthModule,
    UsersModule,
    RoomModule,
    BookingModule,
    NotificationsModule,
    AccountSettingsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
