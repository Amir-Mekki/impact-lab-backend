import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../database/schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  // Create a new user
  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const { firstname, lastname, email, password } = createUserDto;

    const user = new this.userModel({
      firstname,
      lastname,
      email,
      password
    });

    return user.save();
  }

    // Find all users
  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  // Find a user by ID
  async findById(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }

  // Find user by email (for login or authentication)
  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  // Update a user by ID
  async updateUser(
      id: string,
      updateData: UpdateUserDto
  ): Promise<User | null> {
      const updatedUser = await this.userModel.findByIdAndUpdate(
          id,
          { $set: updateData },
          { new: true }
      ).exec();
      return updatedUser;
  }

  // Delete a user by ID
  async deleteUser(id: string): Promise<User | null> {
    return this.userModel.findByIdAndDelete(id).exec();
  }
}
