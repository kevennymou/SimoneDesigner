import { IsDateString, IsString, MinLength } from 'class-validator';

export class CreateBlockDto {
  @IsDateString()
  date: string;

  @IsString()
  @MinLength(2)
  label: string;
}
