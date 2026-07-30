import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { AppointmentStatus } from '../../../generated/prisma/client';

export class ListAppointmentsQueryDto {
  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;
}
