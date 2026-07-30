import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GalleryService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.galleryPhoto.findMany({ orderBy: { order: 'asc' } });
  }
}
