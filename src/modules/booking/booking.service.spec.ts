import { Test, TestingModule } from '@nestjs/testing';
import { BookingService } from './booking.service';
import { getModelToken } from '@nestjs/mongoose';
import { Booking } from '../../database/schemas/booking.schema';
import { Model } from 'mongoose';
import { CreateBookingDto } from './dto/create-booking.dto';
import { RoomService } from '../rooms/room.service';
import { NotificationsService } from '../notifications/notifications.service';
import { UsersService } from '../users/users.service';

describe('BookingService', () => {
  let service: BookingService;
  let model: Model<Booking>;

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
    aggregate: jest.fn(),
  };

  const mockRoomService = {
    findPublic: jest.fn().mockResolvedValue([{ _id: 'room1' }, { _id: 'room2' }]),
  };

  const mockNotificationsService = {
    notifyUserByPreference: jest.fn(),
    notifyAdmins: jest.fn(),
  };

  const mockUsersService = {
    findAdmins: jest.fn(),
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingService,
        { provide: getModelToken(Booking.name), useValue: mockModel },
        { provide: RoomService, useValue: mockRoomService },
        { provide: NotificationsService, useValue: mockNotificationsService },
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    service = module.get<BookingService>(BookingService);
    model = module.get<Model<Booking>>(getModelToken(Booking.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create booking with requester ID if not admin', async () => {
      const dto: CreateBookingDto = {
        room: 'Room A',
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString(),
      };

      const createReturnMock = {
        populate: jest.fn().mockResolvedValue({
          ...dto,
          user: 'requester-id',
          room: dto.room,
          status: 'pending',
          _id: 'booking-id-1',
        }),
      };
      mockModel.create.mockResolvedValue(createReturnMock);

      const result = await service.create(dto as any, 'requester-id', false);

      expect(model.create).toHaveBeenCalledWith({ ...dto, user: 'requester-id' });
      expect(createReturnMock.populate).toHaveBeenCalledWith(['user', 'room']);
      expect(result).toEqual({
        ...dto,
        user: 'requester-id',
        room: dto.room,
        status: 'pending',
        _id: 'booking-id-1',
      });
    });

    it('should create booking with user from dto if admin', async () => {
      const dto: CreateBookingDto = {
        room: 'Room B',
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString(),
        user: 'some-user-id',
      };

      const createReturnMock = {
        populate: jest.fn().mockResolvedValue({
          ...dto,
          status: 'pending',
          _id: 'booking-id-2',
        }),
      };

      mockModel.create.mockResolvedValue(createReturnMock);

      const result = await service.create(dto, 'admin-id', true);

      expect(model.create).toHaveBeenCalledWith(dto);
      expect(createReturnMock.populate).toHaveBeenCalledWith(['user', 'room']);
      expect(result).toEqual({
        ...dto,
        status: 'pending',
        _id: 'booking-id-2',
      });
    });
  });

  describe('getPeakHours', () => {
    it('should return aggregated peak hours', async () => {
      const mockData = [{ _id: 9, count: 10 }];
      mockModel.aggregate = jest.fn().mockResolvedValue(mockData);

      const result = await service.getPeakHours();
      expect(mockModel.aggregate).toHaveBeenCalledWith([
        { $group: { _id: { $hour: '$startDate' }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $project: { hour: '$_id', count: 1, _id: 0 } },
      ]);
      expect(result).toEqual(mockData);
    });
  });

  describe('getIdleRooms', () => {
    it('should return idle rooms', async () => {
      mockModel.find = jest.fn().mockResolvedValue([{ room: { _id: 'room1' } }]);

      const result = await service.getIdleRooms(30);

      expect(mockRoomService.findPublic).toHaveBeenCalled();
      expect(result).toEqual([{ _id: 'room2' }]);
    });
  });
});
