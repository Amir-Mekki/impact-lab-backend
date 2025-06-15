import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Room, RoomDocument } from '../../database/schemas/room.schema';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

/**
 * Service responsible for handling business logic related to Room entities.
 */
@Injectable()
export class RoomService {
  constructor(@InjectModel(Room.name) private roomModel: Model<RoomDocument>) {}

  /**
   * Creates a new Room document in the database.
   * @param createRoomDto - Data Transfer Object containing room creation data.
   * @returns The created Room document.
   */
  async createRoom(createRoomDto: CreateRoomDto): Promise<Room> {
    return this.roomModel.create(createRoomDto);
  }

  /**
   * Retrieves all Room documents from the database.
   * @returns An array of Room documents.
   */
  async findAll(): Promise<Room[]> {
    return this.roomModel.find().exec();
  }

  /**
   * Finds a Room document by its unique identifier.
   * @param id - The unique identifier of the Room.
   * @returns The found Room document.
   * @throws NotFoundException if the Room is not found.
   */
  async findById(id: string): Promise<Room> {
    const room = await this.roomModel.findById(id).exec();
    if (!room) throw new NotFoundException('Room not found');
    return room;
  }

  /**
   * Updates an existing Room document by its unique identifier.
   * @param id - The unique identifier of the Room to update.
   * @param updateRoomDto - Data Transfer Object containing updated room data.
   * @returns The updated Room document.
   * @throws NotFoundException if the Room is not found.
   */
  async updateRoom(id: string, updateRoomDto: UpdateRoomDto): Promise<Room> {
    const updated = await this.roomModel.findByIdAndUpdate(id, updateRoomDto, {
      new: true,
    });
    if (!updated) throw new NotFoundException('Room not found');
    return updated;
  }

  /**
   * Deletes a Room document by its unique identifier.
   * @param id - The unique identifier of the Room to delete.
   * @returns void
   * @throws NotFoundException if the Room is not found.
   */
  async deleteRoom(id: string): Promise<void> {
    const result = await this.roomModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException('Room not found');
  }

  /**
   * Retrieves all public rooms that are currently active and available for reservation.
   *
   * @returns {Promise<Room[]>} A promise that resolves to an array of rooms matching the criteria.
   */
  async findPublic(): Promise<Room[]> {
    return this.roomModel.find({ isActive: true, isReservable: true }).exec();
  }

  /**
   * Retrieves a public room by its unique identifier.
   *
   * Searches for a room that matches the provided `id` and is both active and reservable.
   * Returns the room document if found, or `null` if no matching room exists.
   *
   * @param id - The unique identifier of the room to retrieve.
   * @returns A promise that resolves to the matching `Room` object if found, or `null` otherwise.
   */
  async findPublicById(id: string): Promise<Room | null> {
    return this.roomModel.findOne({ _id: id, isActive: true, isReservable: true }).exec();
  }
}
