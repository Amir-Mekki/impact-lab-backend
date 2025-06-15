import { IsIn } from 'class-validator';
import { BookingStatus, BookingStatuses } from '../../../database/schemas/booking.schema';

export class UpdateStatusDto {
  @IsIn(BookingStatuses)
  status: BookingStatus;
}
