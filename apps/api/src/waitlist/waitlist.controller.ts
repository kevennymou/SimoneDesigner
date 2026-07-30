import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateWaitlistDto } from './dto/create-waitlist.dto';
import { WaitlistService } from './waitlist.service';

@Controller('waitlist')
export class WaitlistController {
  constructor(private readonly waitlist: WaitlistService) {}

  @Post()
  create(@Body() dto: CreateWaitlistDto) {
    return this.waitlist.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.waitlist.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/notify')
  notify(@Param('id') id: string) {
    return this.waitlist.buildNotifyLink(id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.waitlist.remove(id);
  }
}
