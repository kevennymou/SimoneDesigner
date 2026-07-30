import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AvailabilityService } from './availability.service';
import { CreateBlockDto } from './dto/create-block.dto';
import { SlotsQueryDto } from './dto/slots-query.dto';
import { UpdateWeeklyDto } from './dto/update-weekly.dto';

@Controller('availability')
export class AvailabilityController {
  constructor(private readonly availability: AvailabilityService) {}

  @Get('weekly')
  getWeekly() {
    return this.availability.getWeekly();
  }

  @UseGuards(JwtAuthGuard)
  @Put('weekly')
  updateWeekly(@Body() dto: UpdateWeeklyDto) {
    return this.availability.updateWeekly(dto.days);
  }

  @Get('blocks')
  getBlocks() {
    return this.availability.getBlocks();
  }

  @UseGuards(JwtAuthGuard)
  @Post('blocks')
  createBlock(@Body() dto: CreateBlockDto) {
    return this.availability.createBlock(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('blocks/:id')
  removeBlock(@Param('id') id: string) {
    return this.availability.removeBlock(id);
  }

  @Get('slots')
  getSlots(@Query() query: SlotsQueryDto) {
    return this.availability.getSlots(query.date, query.serviceId);
  }
}
