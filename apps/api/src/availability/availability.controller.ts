import { Body, Controller, Get, Param, Put, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AvailabilityService } from './availability.service';
import { SetDayAvailabilityDto } from './dto/set-day-availability.dto';
import { SlotsQueryDto } from './dto/slots-query.dto';

@Controller('availability')
export class AvailabilityController {
  constructor(private readonly availability: AvailabilityService) {}

  @Get('dates')
  getAvailableDates() {
    return this.availability.getAvailableDates();
  }

  @UseGuards(JwtAuthGuard)
  @Get('dates/:date')
  getDayTimes(@Param('date') date: string) {
    return this.availability.getDayTimes(date);
  }

  @UseGuards(JwtAuthGuard)
  @Put('dates/:date')
  setDayTimes(@Param('date') date: string, @Body() dto: SetDayAvailabilityDto) {
    return this.availability.setDayTimes(date, dto);
  }

  @Get('slots')
  getSlots(@Query() query: SlotsQueryDto) {
    return this.availability.getSlots(query.date, query.serviceId);
  }
}
