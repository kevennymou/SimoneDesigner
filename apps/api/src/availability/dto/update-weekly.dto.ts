import { Type } from 'class-transformer';
import { ArrayMinSize, ValidateNested } from 'class-validator';
import { WeeklyDayDto } from './weekly-day.dto';

export class UpdateWeeklyDto {
  @ValidateNested({ each: true })
  @Type(() => WeeklyDayDto)
  @ArrayMinSize(7)
  days: WeeklyDayDto[];
}
