import { ArrayUnique, IsArray, IsString, Matches } from 'class-validator';

export class SetDayAvailabilityDto {
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { each: true })
  times: string[];
}
