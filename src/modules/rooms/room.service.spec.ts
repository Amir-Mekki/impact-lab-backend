import { Test, TestingModule } from '@nestjs/testing';
import { RoomService } from './room.service';
import { getModelToken } from '@nestjs/mongoose';
import { Room } from '../../database/schemas/room.schema';
import { NotFoundException } from '@nestjs/common';

const mockRoomModel = {
  create: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
  findOne: jest.fn(),
};

describe('RoomService', () => {
  let service: RoomService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoomService,
        {
          provide: getModelToken(Room.name),
          useValue: mockRoomModel,
        },
      ],
    }).compile();

    service = module.get<RoomService>(RoomService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a room', async () => {
    const dto = { name: 'Test Room' };
    mockRoomModel.create.mockResolvedValue(dto);
    expect(await service.createRoom(dto as any)).toEqual(dto);
  });

  it('should return all rooms', async () => {
    const rooms = [{ name: 'Room A' }, { name: 'Room B' }];
    mockRoomModel.find.mockReturnValue({ exec: () => Promise.resolve(rooms) });
    expect(await service.findAll()).toEqual(rooms);
  });

  it('should find a room by ID', async () => {
    const room = { name: 'Test Room' };
    mockRoomModel.findById.mockReturnValue({ exec: () => Promise.resolve(room) });
    expect(await service.findById('123')).toEqual(room);
  });

  it('should throw if room not found by ID', async () => {
    mockRoomModel.findById.mockReturnValue({ exec: () => Promise.resolve(null) });
    await expect(service.findById('123')).rejects.toThrow(NotFoundException);
  });

  it('should update a room', async () => {
    const updatedRoom = { name: 'Updated Room' };
    mockRoomModel.findByIdAndUpdate.mockResolvedValue(updatedRoom);
    expect(await service.updateRoom('123', {} as any)).toEqual(updatedRoom);
  });

  it('should throw if room to update is not found', async () => {
    mockRoomModel.findByIdAndUpdate.mockResolvedValue(null);
    await expect(service.updateRoom('123', {} as any)).rejects.toThrow(NotFoundException);
  });

  it('should delete a room', async () => {
    mockRoomModel.findByIdAndDelete.mockResolvedValue({ name: 'Deleted Room' });
    await expect(service.deleteRoom('123')).resolves.toBeUndefined();
  });

  it('should throw if room to delete is not found', async () => {
    mockRoomModel.findByIdAndDelete.mockResolvedValue(null);
    await expect(service.deleteRoom('123')).rejects.toThrow(NotFoundException);
  });

  it('should return public rooms', async () => {
    const rooms = [{ name: 'Public Room' }];
    mockRoomModel.find.mockReturnValue({ exec: () => Promise.resolve(rooms) });
    expect(await service.findPublic()).toEqual(rooms);
  });

  it('should return public room by ID', async () => {
    const room = { name: 'Public Room' };
    mockRoomModel.findOne.mockReturnValue({ exec: () => Promise.resolve(room) });
    expect(await service.findPublicById('123')).toEqual(room);
  });
});
