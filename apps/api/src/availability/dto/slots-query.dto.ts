import { IsDateString, IsOptional, IsString } from 'class-validator';

export class SlotsQueryDto {
  @IsDateString()
  date: string;

  @IsOptional()
  @IsString()
  serviceId?: string;
}
