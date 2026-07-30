import { IsDateString, IsString, Matches, MinLength } from 'class-validator';

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export class CreateWaitlistDto {
  @IsDateString()
  date: string;

  @Matches(TIME_PATTERN, { message: 'time deve estar no formato HH:mm' })
  time: string;

  @IsString()
  serviceId: string;

  @IsString()
  @MinLength(2)
  clientName: string;

  @IsString()
  @MinLength(8)
  clientWhatsapp: string;
}
