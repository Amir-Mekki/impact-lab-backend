import { Test, TestingModule } from '@nestjs/testing';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';
import { NotFoundException } from '@nestjs/common';

describe('RoomController', () => {
  let controller: RoomController;
  let service: RoomService;

  const mockRoomService = {
    createRoom: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    updateRoom: jest.fn(),
    deleteRoom: jest.fn(),
    findPublic: jest.fn(),
    findPublicById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoomController],
      providers: [{ provide: RoomService, useValue: mockRoomService }],
    }).compile();

    controller = module.get<RoomController>(RoomController);
    service = module.get<RoomService>(RoomService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get public rooms', async () => {
    const rooms = [{ name: 'Public Room' }];
    mockRoomService.findPublic.mockResolvedValue(rooms);
    expect(await controller.getPublicRooms()).toEqual(rooms);
  });

  it('should get public room by ID', async () => {
    const room = { name: 'Public Room' };
    mockRoomService.findPublicById.mockResolvedValue(room);
    expect(await controller.getPublicRoomById('123')).toEqual(room);
  });

  it('should throw if public room not found', async () => {
    mockRoomService.findPublicById.mockResolvedValue(null);
    await expect(controller.getPublicRoomById('123')).rejects.toThrow(NotFoundException);
  });

  it('should create a room', async () => {
    const dto = { name: 'New Room' };
    mockRoomService.createRoom.mockResolvedValue(dto);
    expect(await controller.create(dto as any)).toEqual(dto);
  });

  it('should find all rooms', async () => {
    const rooms = [{ name: 'Room A' }];
    mockRoomService.findAll.mockResolvedValue(rooms);
    expect(await controller.findAll()).toEqual(rooms);
  });

  it('should get one room', async () => {
    const room = { name: 'Room X' };
    mockRoomService.findById.mockResolvedValue(room);
    expect(await controller.findOne('123')).toEqual(room);
  });

  it('should update a room', async () => {
    const updated = { name: 'Updated Room' };
    mockRoomService.updateRoom.mockResolvedValue(updated);
    expect(await controller.update('123', {} as any)).toEqual(updated);
  });

  it('should delete a room', async () => {
    mockRoomService.deleteRoom.mockResolvedValue(undefined);
    expect(await controller.remove('123')).toBeUndefined();
  });
});
