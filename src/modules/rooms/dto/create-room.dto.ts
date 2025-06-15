import {
  IsString,
  IsEnum,
  IsOptional,
  IsArray,
  IsNumber,
  IsBoolean,
  IsObject,
  ValidateNested,
  IsMilitaryTime,
} from 'class-validator';
import { Type } from 'class-transformer';

class DailyScheduleDto {
  @IsOptional()
  @IsMilitaryTime()
  open?: string | null;

  @IsOptional()
  @IsMilitaryTime()
  close?: string | null;
}

class AvailabilityScheduleDto {
  @ValidateNested()
  @Type(() => DailyScheduleDto)
  monday: DailyScheduleDto;

  @ValidateNested()
  @Type(() => DailyScheduleDto)
  tuesday: DailyScheduleDto;

  @ValidateNested()
  @Type(() => DailyScheduleDto)
  wednesday: DailyScheduleDto;

  @ValidateNested()
  @Type(() => DailyScheduleDto)
  thursday: DailyScheduleDto;

  @ValidateNested()
  @Type(() => DailyScheduleDto)
  friday: DailyScheduleDto;

  @ValidateNested()
  @Type(() => DailyScheduleDto)
  saturday: DailyScheduleDto;

  @ValidateNested()
  @Type(() => DailyScheduleDto)
  sunday: DailyScheduleDto;
}

export class CreateRoomDto {
  @IsString()
  name: string;

  @IsEnum(['meeting', 'open-space', 'studio', 'relaxation', 'kitchen'])
  type: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenities?: string[];

  @IsOptional()
  @IsNumber()
  capacity?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  pricePerHour?: number;

  @IsOptional()
  @IsNumber()
  pricePerDay?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => AvailabilityScheduleDto)
  availabilitySchedule?: AvailabilityScheduleDto;

  @IsOptional()
  @IsBoolean()
  isReservable?: boolean;

  @IsOptional()
  @IsBoolean()
  showInHomepage?: boolean;
}