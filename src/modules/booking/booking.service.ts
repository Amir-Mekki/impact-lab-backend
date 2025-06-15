import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Booking } from '../../database/schemas/booking.schema';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { RoomService } from '../rooms/room.service';
import { NotificationsService } from '../notifications/notifications.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class BookingService {
  constructor(
    @InjectModel(Booking.name) private readonly bookingModel: Model<Booking>,
    private readonly roomService: RoomService,
    private readonly notificationsService: NotificationsService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * Creates a new booking.
   * @param createBookingDto - Data transfer object containing booking details.
   * @param requesterId - ID of the user making the request.
   * @param isAdmin - Flag indicating if the requester is an admin.
   * @returns The created booking document.
   */
  async create(
    createBookingDto: CreateBookingDto,
    requesterId: string,
    isAdmin: boolean,
  ): Promise<Booking> {
    const userId = isAdmin && createBookingDto.user ? createBookingDto.user : requesterId;
    const bookingDoc = await this.bookingModel.create({ ...createBookingDto, user: userId });

    const booking = await bookingDoc.populate(['user', 'room']);
    const user = await this.usersService.findById(userId);
    if (user) {
      await this.notificationsService.notifyUserByPreference(
        user,
        'booking',
        'Booking Created',
        'Your booking has been successfully created.',
        'booking-created',
        { booking },
      );
    }

    await this.notificationsService.notifyAdmins(
      'booking',
      'New Booking Created',
      'A new booking has been made.',
      'admin-booking-created',
      { booking },
    );

    return booking;
  }

  /**
   * Retrieves all bookings.
   * @returns An array of booking documents.
   */
  async findAll(): Promise<Booking[]> {
    return this.bookingModel.find().exec();
  }

  /**
   * Finds bookings based on various filters.
   * @param filters - Object containing optional filters for user, room, startDate, and endDate.
   * @returns An array of booking documents matching the filters.
   */
  async findByFilters(filters: {
    user?: string;
    room?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Booking[]> {
    const query: any = {};

    if (filters.user) query.user = filters.user;
    if (filters.room) query.room = filters.room;
    if (filters.startDate && filters.endDate) {
      query.startDate = { $gte: new Date(filters.startDate) };
      query.endDate = { $lte: new Date(filters.endDate) };
    }

    return this.bookingModel.find(query).exec();
  }

  /**
   * Finds a booking by its ID.
   * @param id - The unique identifier of the booking.
   * @returns The booking document if found, otherwise null.
   */
  async findById(id: string): Promise<Booking | null> {
    return this.bookingModel.findById(id).exec();
  }

  /**
   * Updates a booking by its ID.
   * @param id - The unique identifier of the booking.
   * @param updateDto - Data transfer object containing fields to update.
   * @returns The updated booking document if found, otherwise null.
   */
  async update(id: string, updateDto: UpdateBookingDto): Promise<Booking | null> {
    return this.bookingModel.findByIdAndUpdate(id, updateDto, { new: true }).exec();
  }

  /**
   * Updates the status of a booking and sends notifications.
   * @param id - The unique identifier of the booking.
   * @param updateStatusDto - Data transfer object containing the new status.
   * @returns The updated booking document if found, otherwise null.
   */
  async updateStatus(id: string, updateStatusDto: UpdateStatusDto): Promise<Booking | null> {
    await this.bookingModel.findByIdAndUpdate(id, updateStatusDto).exec();
    const booking = await this.bookingModel.findById(id).populate(['user', 'room']);

    if (booking) {
      const user = await this.usersService.findById(booking.user.toString());
      if (user) {
        await this.notificationsService.notifyUserByPreference(
          user,
          'booking',
          `Booking ${updateStatusDto.status}`,
          `Your booking status has been changed to ${updateStatusDto.status}.`,
          `booking-${updateStatusDto.status}`,
          { booking },
        );
      }
    }

    if (updateStatusDto.status === 'canceled') {
      await this.notificationsService.notifyAdmins(
        'booking',
        'Booking Canceled',
        'A booking was canceled.',
        'admin-booking-canceled',
        { booking },
      );
    }
    return booking;
  }

  /**
   * Deletes a booking by its ID.
   * @param id - The unique identifier of the booking.
   * @returns The deleted booking document if found, otherwise null.
   */
  async delete(id: string): Promise<Booking | null> {
    return this.bookingModel.findByIdAndDelete(id).exec();
  }

  /**
   * Analyzes booking data to determine peak booking hours.
   *
   * This method performs an aggregation on the bookings collection,
   * grouping records by the hour extracted from the `startDate` field.
   * It calculates the total number of bookings per hour and returns
   * the results sorted in descending order by booking count.
   *
   * @returns A promise resolving to an array of objects,
   *          each containing an `_id` field (representing the hour of day, 0–23)
   *          and a `count` field (the total number of bookings for that hour).
   */
  async getPeakHours(): Promise<any> {
    return this.bookingModel.aggregate([
      {
        $group: {
          _id: { $hour: '$startDate' },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $project: { hour: '$_id', count: 1, _id: 0 } },
    ]);
  }

  /**
   * Retrieves rooms that have not been booked in the last specified number of days.
   * @param sinceDays - Number of days to look back for bookings.
   * @returns An array of room documents that are idle.
   */
  async getIdleRooms(sinceDays: number = 30): Promise<any[]> {
    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - sinceDays);

    const recentBookings = await this.bookingModel.find({ startDate: { $gte: sinceDate } });
    const activeRooms = [...new Set(recentBookings.map((b) => b.room._id))];

    const allRooms = await this.roomService.findPublic();
    return allRooms.filter((room) => !activeRooms.includes(room._id));
  }
}
