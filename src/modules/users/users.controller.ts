import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Creates a new user with the provided username, email, and password.
   * @param body Object containing firstname, lastname, email, and password.
   * @returns The created user entity.
   */
  @Post('')
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.createUser(createUserDto);
  }
  
  /**
   * Retrieves a list of all users.
   * Protected by JWT authentication guard.
   * @returns Array of user entities.
   */
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }
  
  /**
   * Retrieves a user by ID.
   * Protected by JWT authentication guard.
   * @param id User ID from the URL.
   * @returns The user entity or null if not found.
   */
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findById(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  /**
   * Updates an existing user with the provided fields.
   * Protected by JWT authentication guard.
   * @param id User ID from the URL.
   * @param body Object containing fields to update.
   * @returns The updated user entity.
   */
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto
  ) {
    const updatedUser = await this.usersService.updateUser(id, updateUserDto);
    if (!updatedUser) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return updatedUser;
  }

  /**
   * Deletes a user by ID.
   * Protected by JWT authentication guard.
   * @param id User ID from the URL.
   * @returns The deleted user entity or null if not found.
   */
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    const deletedUser = await this.usersService.deleteUser(id);
    if (!deletedUser) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return deletedUser;
  }
}