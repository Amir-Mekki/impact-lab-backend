import { Injectable } from '@nestjs/common';
import { CreateAccountSettingDto } from './dto/create-account_setting.dto';
import { UpdateAccountSettingDto } from './dto/update-account_setting.dto';
import { InjectModel } from '@nestjs/mongoose';
import { AccountSetting } from '../../database/schemas/account_setting.schema';
import { Model } from 'mongoose';

@Injectable()
export class AccountSettingsService {
  constructor(
    @InjectModel(AccountSetting.name) private readonly accountSettingModel: Model<AccountSetting>,
  ) {}

  /**
   * Creates a new account setting for a user.
   * @param createAccountSettingDto - The DTO containing account setting data.
   * @param userId - The ID of the user for whom the account setting is being created.
   * @returns The created account setting document.
   */
  async create(createAccountSettingDto: CreateAccountSettingDto, userId: string) {
    return this.accountSettingModel.create({ ...createAccountSettingDto, user: userId });
  }

  /**
   * Finds the account setting for a specific user.
   * @param userId - The ID of the user whose account setting is being retrieved.
   * @returns The account setting document if found, otherwise null.
   */
  findByUser(userId: string) {
    return this.accountSettingModel.findOne({ user: userId }).exec();
  }

  /**
   * Updates the account setting for a specific user.
   * @param updateAccountSettingDto - The DTO containing updated account setting data.
   * @param userId - The ID of the user whose account setting is being updated.
   * @returns The updated account setting document.
   */
  updateByUser(updateAccountSettingDto: UpdateAccountSettingDto, userId: string) {
    return this.accountSettingModel
      .findOneAndUpdate({ user: userId }, { $set: updateAccountSettingDto }, { new: true })
      .exec();
  }
}
