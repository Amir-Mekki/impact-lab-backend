import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { RoomService } from './room.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('rooms')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  /**
   * Retrieves all public rooms that are currently active and available for reservation.
   *
   * @returns An array of public room entities.
   */
  @Get('public')
  async getPublicRooms() {
    return this.roomService.findPublic();
  }

  /**
   * Retrieves a public room by its unique identifier.
   *
   * @param id - The unique identifier of the public room to retrieve.
   * @returns The public room entity if found, otherwise throws a NotFoundException.
   */
  @Get('public/:id')
  async getPublicRoomById(@Param('id') id: string) {
    const room = await this.roomService.findPublicById(id);
    if (!room) {
      throw new NotFoundException(`Room with id ${id} not found or not public`);
    }
    return room;
  }

  /**
   * Handles the creation of a new room.
   *
   * @param createRoomDto - Data Transfer Object containing the details required to create a room.
   * @returns The newly created room entity.
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  create(@Body() createRoomDto: CreateRoomDto) {
    return this.roomService.createRoom(createRoomDto);
  }

  /**
   * Retrieves all rooms from the database.
   *
   * @returns An array of all room entities.
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get()
  findAll() {
    return this.roomService.findAll();
  }

  /**
   * Retrieves a room by its unique identifier.
   *
   * @param id - The unique identifier of the room to retrieve.
   * @returns The room entity if found, otherwise throws a NotFoundException.
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roomService.findById(id);
  }

  /**
   * Updates an existing room by its unique identifier.
   *
   * @param id - The unique identifier of the room to update.
   * @param updateRoomDto - Data Transfer Object containing the updated details for the room.
   * @returns The updated room entity if successful, otherwise throws a NotFoundException.
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRoomDto: UpdateRoomDto) {
    return this.roomService.updateRoom(id, updateRoomDto);
  }

  /**
   * Deletes a room by its unique identifier.
   *
   * @param id - The unique identifier of the room to delete.
   * @returns A confirmation message if successful, otherwise throws a NotFoundException.
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.roomService.deleteRoom(id);
  }
}
