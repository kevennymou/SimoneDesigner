import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';

const SINGLETON_ID = 'singleton';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getPublic() {
    const { adminEmail: _adminEmail, ...settings } =
      await this.prisma.settings.findUniqueOrThrow({
        where: { id: SINGLETON_ID },
      });
    return settings;
  }

  getFull() {
    return this.prisma.settings.findUniqueOrThrow({
      where: { id: SINGLETON_ID },
    });
  }

  update(dto: UpdateSettingsDto) {
    return this.prisma.settings.update({
      where: { id: SINGLETON_ID },
      data: dto,
    });
  }
}
