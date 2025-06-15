import { Test, TestingModule } from '@nestjs/testing';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { getModelToken } from '@nestjs/mongoose';
import { Booking } from '../../database/schemas/booking.schema';
import { CreateBookingDto } from './dto/create-booking.dto';
import { Response } from 'express';
import { RoomService } from '../rooms/room.service';
import { NotificationsService } from '../notifications/notifications.service';
import { UsersService } from '../users/users.service';

describe('BookingController', () => {
  let controller: BookingController;
  let service: BookingService;

  const mockBooking = {
    _id: 'booking-id-123',
    room: 'Room 1',
    startDate: new Date('2025-06-01'),
    endDate: new Date('2025-06-05'),
    user: 'user-id-123',
  };

  const mockModel = {
    create: jest.fn(),
    find: jest.fn().mockReturnThis(),
    exec: jest.fn(),
    findById: jest.fn().mockReturnThis(),
    findByIdAndUpdate: jest.fn().mockReturnThis(),
    findByIdAndDelete: jest.fn().mockReturnThis(),
  };

  const mockBookingService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockRoomService = {
    findPublic: jest.fn(),
  };

  const mockNotificationsService = {
    notifyUserByPreference: jest.fn(),
    notifyAdmins: jest.fn(),
  };

  const mockUsersService = {
    findAdmins: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookingController],
      providers: [
        BookingService,
        { provide: getModelToken(Booking.name), useValue: mockModel },
        { provide: RoomService, useValue: mockRoomService },
        { provide: NotificationsService, useValue: mockNotificationsService },
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    controller = module.get<BookingController>(BookingController);
    service = module.get<BookingService>(BookingService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create booking as admin with userId from dto', async () => {
      const dto: CreateBookingDto = {
        room: 'Room 1',
        startDate: new Date('2025-06-01').toISOString(),
        endDate: new Date('2025-06-05').toISOString(),
        user: 'some-user-id',
      };

      const createdBooking = { ...dto, _id: 'booking-id-123' };

      jest.spyOn(service, 'create').mockResolvedValue(createdBooking as any);

      const result = await controller.create(dto, { userId: 'admin-id', role: 'admin' });

      expect(service.create).toHaveBeenCalledWith(dto, 'admin-id', true);
      expect(result).toEqual(createdBooking);
    });
  });

  describe('findMyBookings', () => {
    it('should return bookings for the current user', async () => {
      const user = { userId: 'user-123' };
      const expected = [mockBooking];

      jest.spyOn(service, 'findByFilters').mockResolvedValue(expected as any);

      const result = await controller.findMyBookings(user);
      expect(service.findByFilters).toHaveBeenCalledWith({ user: 'user-123' });
      expect(result).toEqual(expected);
    });
  });

  describe('updateStatus', () => {
    it('should update booking status', async () => {
      const updated = { ...mockBooking, status: 'approved' };
      jest.spyOn(service, 'updateStatus').mockResolvedValue(updated as any);

      const result = await controller.updateStatus('booking-id-123', { status: 'approved' });
      expect(service.updateStatus).toHaveBeenCalledWith('booking-id-123', { status: 'approved' });
      expect(result).toEqual(updated);
    });
  });

  describe('exportCsv', () => {
    it('should return a CSV file', async () => {
      const bookings = [mockBooking];
      jest.spyOn(service, 'findAll').mockResolvedValue(bookings as any);

      const res = {
        setHeader: jest.fn(),
        send: jest.fn(),
      } as unknown as Response;

      await controller.exportCsv(res);

      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'text/csv');
      expect(res.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        'attachment; filename=bookings.csv',
      );
      expect(res.send).toHaveBeenCalled();
    });
  });

  describe('getPeakHours', () => {
    it('should return peak hours', async () => {
      const data = [{ _id: 10, count: 5 }];
      jest.spyOn(service, 'getPeakHours').mockResolvedValue(data);

      const result = await controller.getPeakHours();
      expect(service.getPeakHours).toHaveBeenCalled();
      expect(result).toEqual(data);
    });
  });

  describe('getIdleRooms', () => {
    it('should return idle rooms with default days', async () => {
      const data = [{ _id: 'room1' }];
      jest.spyOn(service, 'getIdleRooms').mockResolvedValue(data);

      const result = await controller.getIdleRooms(undefined);
      expect(service.getIdleRooms).toHaveBeenCalledWith(30);
      expect(result).toEqual(data);
    });

    it('should return idle rooms with provided days', async () => {
      const data = [{ _id: 'room2' }];
      jest.spyOn(service, 'getIdleRooms').mockResolvedValue(data);

      const result = await controller.getIdleRooms('15');
      expect(service.getIdleRooms).toHaveBeenCalledWith(15);
      expect(result).toEqual(data);
    });
  });
});
