import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  NotFoundException,
  Query,
  Patch,
  Res,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UpdateStatusDto } from './dto/update-status.dto';
import { Parser } from 'json2csv';
import { Response } from 'express';

@Controller('bookings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  /**
   * Creates a new booking.
   * @param createBookingDto - Data transfer object containing booking details.
   * @param user - Current user information.
   * @returns The created booking document.
   */
  @Roles('admin', 'user')
  @Post()
  async create(
    @Body() createBookingDto: CreateBookingDto,
    @CurrentUser() user: { userId: string; role: string },
  ) {
    return this.bookingService.create(createBookingDto, user.userId, user.role === 'admin');
  }

  /**
   * Retrieves all bookings based on provided filters.
   * @param query - Query parameters for filtering bookings.
   * @returns A list of bookings matching the filters.
   */
  @Roles('admin')
  @Get()
  async findAll(@Query() query: any) {
    return this.bookingService.findByFilters(query);
  }

  /**
   * Retrieves a booking by its ID.
   * @param id - The ID of the booking to retrieve.
   * @param user - Current user information.
   * @returns The booking document if found, otherwise throws NotFoundException.
   */
  @Roles('admin', 'user')
  @Get(':id')
  async findById(@Param('id') id: string, @CurrentUser() user: { userId: string; role: string }) {
    const booking = await this.bookingService.findById(id);
    if (!booking) throw new NotFoundException(`Booking ${id} not found`);

    if (user.role !== 'admin' && booking.user.toString() !== user.userId) {
      throw new NotFoundException('You can only view your own bookings');
    }

    return booking;
  }

  /**
   * Retrieves bookings for the currently authenticated user.
   * @param user - Current user information.
   * @returns A list of bookings for the user.
   */
  @Roles('user')
  @Get('my')
  async findMyBookings(@CurrentUser() user: { userId: string }) {
    return this.bookingService.findByFilters({ user: user.userId });
  }

  /**
   * Updates a booking by its ID.
   * @param id - The ID of the booking to update.
   * @param updateBookingDto - Data transfer object containing updated booking details.
   * @param user - Current user information.
   * @returns The updated booking document if successful, otherwise throws NotFoundException.
   */
  @Roles('admin', 'user')
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateBookingDto: UpdateBookingDto,
    @CurrentUser() user: { userId: string; role: string },
  ) {
    const booking = await this.bookingService.findById(id);
    if (!booking) throw new NotFoundException(`Booking ${id} not found`);

    if (user.role !== 'admin' && booking.user.toString() !== user.userId) {
      throw new NotFoundException('You can only update your own bookings');
    }

    const updated = await this.bookingService.update(id, updateBookingDto);
    if (!updated) throw new NotFoundException(`Booking ${id} not found`);
    return updated;
  }

  /**
   * Updates the status of a booking by its ID.
   * @param id - The ID of the booking to update.
   * @param dto - Data transfer object containing the new status.
   * @returns The updated booking document if successful, otherwise throws NotFoundException.
   */
  @Roles('admin')
  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto) {
    const updated = await this.bookingService.updateStatus(id, { status: dto.status });
    if (!updated) throw new NotFoundException(`Booking ${id} not found`);
    return updated;
  }

  /**
   * Deletes a booking by its ID.
   * @param id - The ID of the booking to delete.
   * @param user - Current user information.
   * @returns The deleted booking document if successful, otherwise throws NotFoundException.
   */
  @Roles('admin', 'user')
  @Delete(':id')
  async delete(@Param('id') id: string, @CurrentUser() user: { userId: string; role: string }) {
    const booking = await this.bookingService.findById(id);
    if (!booking) throw new NotFoundException(`Booking ${id} not found`);

    if (user.role !== 'admin' && booking.user.toString() !== user.userId) {
      throw new NotFoundException('You can only delete your own bookings');
    }

    const deleted = await this.bookingService.delete(id);
    if (!deleted) throw new NotFoundException(`Booking ${id} not found`);
    return deleted;
  }

  /**
   * Exports all bookings to a CSV file.
   * @param res - Express response object to send the CSV file.
   */
  @Roles('admin')
  @Get('export/csv')
  async exportCsv(@Res() res: Response) {
    const bookings = await this.bookingService.findAll();
    const fields = ['_id', 'user', 'room', 'startDate', 'endDate', 'status'];
    const parser = new Parser({ fields });
    const csv = parser.parse(bookings);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=bookings.csv');
    res.send(csv);
  }

  /**
   * Retrieves booking analytics relative to peak hours.
   * @returns An object containing booking statistics.
   */
  @Roles('admin')
  @Get('analytics/peak-hours')
  getPeakHours() {
    return this.bookingService.getPeakHours();
  }

  /**
   * Retrieves idle rooms based on the number of days specified.
   * @param days - The number of days to check for idle rooms (default is 30).
   * @returns A list of idle rooms.
   */
  @Roles('admin')
  @Get('analytics/idle-rooms')
  getIdleRooms(@Query('days') days?: string) {
    return this.bookingService.getIdleRooms(Number(days) || 30);
  }
}
