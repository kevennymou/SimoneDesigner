import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class WeeklyDayDto {
  @IsInt()
  @Min(0)
  @Max(6)
  weekday: number;

  @IsBoolean()
  isOpen: boolean;

  @IsOptional()
  @IsString()
  startTime?: string | null;

  @IsOptional()
  @IsString()
  endTime?: string | null;

  @IsOptional()
  @IsString()
  breakStart?: string | null;

  @IsOptional()
  @IsString()
  breakEnd?: string | null;

  @IsOptional()
  @IsInt()
  @Min(5)
  slotMinutes?: number;
}
