import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../database/schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AccountSettingsService } from '../account_settings/account_settings.service';

/**
 * Service responsible for handling business logic related to User entities.
 */
@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly accountSettingsService: AccountSettingsService,
  ) {}

  /**
   * Creates a new user document in the database.
   * @param createUserDto Object containing user details to be created.
   * @returns The created user document.
   */
  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const user = await this.userModel.create(createUserDto);

    await this.accountSettingsService.create(
      {
        language: 'fr',
        mode: 'light',
        notificationPreferences: {
          booking: {
            email: true,
            push: true,
            sms: !!createUserDto.phone,
          },
        },
      },
      user._id.toString(),
    );
    return user;
  }

  /**
   * Retrieves all user documents from the database.
   * @returns An array of user documents.
   */
  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  /**
   * Finds a user document by its unique identifier.
   * @param id The unique identifier of the user.
   * @returns The user document if found, otherwise null.
   */
  async findById(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }

  /**
   * Finds a user document by email.
   * @param email The email address of the user.
   * @returns The user document if found, otherwise null.
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  /**
   * Updates a user document by its unique identifier.
   * @param id The unique identifier of the user.
   * @param updateData Object containing fields to update.
   * @returns The updated user document if found, otherwise null.
   */
  async updateUser(id: string, updateData: UpdateUserDto): Promise<User | null> {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, { $set: updateData }, { new: true })
      .exec();
    return updatedUser;
  }

  /**
   * Updates the FCM token for a user.
   * @param userId The unique identifier of the user.
   * @param token The new FCM token to be set.
   */
  async updateFcmToken(userId: string, token: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, { fcmToken: token });
  }

  /**
   * Deletes a user document by its unique identifier.
   * @param id The unique identifier of the user.
   * @returns The deleted user document if found, otherwise null.
   */
  async deleteUser(id: string): Promise<User | null> {
    return this.userModel.findByIdAndDelete(id).exec();
  }

  /**
   * Retrieves all users with the 'admin' role from the database.
   * @returns {Promise<User[]>} A promise that resolves to an array of users who have the 'admin' role.
   */
  async findAdmins(): Promise<User[]> {
    return this.userModel.find({ role: 'admin' }).exec();
  }
}
