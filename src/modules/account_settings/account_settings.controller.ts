import { Controller, Get, Post, Body, Patch, UseGuards } from '@nestjs/common';
import { AccountSettingsService } from './account_settings.service';
import { CreateAccountSettingDto } from './dto/create-account_setting.dto';
import { UpdateAccountSettingDto } from './dto/update-account_setting.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('account-settings')
@UseGuards(JwtAuthGuard)
export class AccountSettingsController {
  constructor(private readonly accountSettingsService: AccountSettingsService) {}

  /**
   * Retrieves the account settings for the currently authenticated user.
   *
   * @param user - An object containing the authenticated user's unique identifier.
   * @returns A promise that resolves to the account settings associated with the user.
   *
   * @remarks
   * This method uses the `@CurrentUser` decorator to extract the user's information from the request context.
   * It delegates the retrieval of account settings to the `accountSettingsService`.
   */
  @Get('my')
  findMyAccountSettings(@CurrentUser() user: { userId: string }) {
    return this.accountSettingsService.findByUser(user.userId);
  }

  /**
   * Updates the account settings for the currently authenticated user.
   *
   * @param createAccountSettingDto - The data transfer object containing the account settings to be updated.
   * @param user - An object containing the authenticated user's unique identifier.
   * @returns A promise that resolves to the updated account settings.
   *
   * @remarks
   * This method uses the `@CurrentUser` decorator to extract the user's information from the request context.
   * It delegates the creation or update of account settings to the `accountSettingsService`.
   */
  @Patch('my')
  updateMyAccountSettings(
    @Body() updateAccountSettingDto: UpdateAccountSettingDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.accountSettingsService.updateByUser(updateAccountSettingDto, user.userId);
  }
}
