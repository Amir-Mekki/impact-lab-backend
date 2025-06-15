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
  Req,
  Patch,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UpdateFcmTokenDto } from './dto/update-fcm-token.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Retrieves the currently authenticated user's information.
   * Protected by JWT authentication guard.
   * @param req Request object containing user information from the JWT token.
   * @returns The user entity of the authenticated user.
   */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Req() req: Request) {
    const userId = (req as any).user['sub'];
    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException(`User with id ${userId} not found`);
    return user;
  }

  /**
   * Updates the currently authenticated user's information.
   * Protected by JWT authentication guard.
   * @param req Request object containing user information from the JWT token.
   * @param updateUserDto Object containing fields to update.
   * @returns The updated user entity.
   */
  @UseGuards(JwtAuthGuard)
  @Put('me')
  async updateMe(@Req() req: Request, @Body() updateUserDto: UpdateUserDto) {
    const userId = (req as any).user['sub'];
    const updatedUser = await this.usersService.updateUser(userId, updateUserDto);
    if (!updatedUser) throw new NotFoundException(`User with id ${userId} not found`);
    return updatedUser;
  }

  /**
   * Creates a new user with the provided username, email, role and password by admin.
   * @param body Object containing username, email, password, role and optional sex, phone.
   * @returns The created user entity.
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
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
  @Roles('admin')
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
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
  @Roles('admin')
  @Delete(':id')
  async delete(@Param('id') id: string) {
    const deletedUser = await this.usersService.deleteUser(id);
    if (!deletedUser) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return deletedUser;
  }

  /**
   * Updates the FCM token for the currently authenticated user.
   * Protected by JWT authentication guard.
   * @param req Request object containing user information from the JWT token.
   * @param body Object containing the new FCM token.
   * @returns A success message upon successful update.
   */
  @Patch('fcm-token')
  @UseGuards(JwtAuthGuard)
  async updateFcmToken(@Req() req, @Body() body: UpdateFcmTokenDto) {
    const userId = (req as any).user['sub'];

    await this.usersService.updateFcmToken(userId, body.token);
    return { message: 'FCM token updated' };
  }
}
