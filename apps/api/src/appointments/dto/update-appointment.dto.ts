import { IsDateString, IsEnum, IsOptional, IsString, Matches } from 'class-validator';
import { AppointmentStatus } from '../../../generated/prisma/client';

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export class UpdateAppointmentDto {
  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @Matches(TIME_PATTERN, { message: 'startTime deve estar no formato HH:mm' })
  startTime?: string;

  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @IsOptional()
  @IsString()
  cancelReason?: string;
}
