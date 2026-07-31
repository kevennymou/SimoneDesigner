import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

type ServiceRow = {
  id: string;
  name: string;
  durationMin: number;
  price: Prisma.Decimal | null;
  active: boolean;
  order: number;
};

function toServiceDto(service: ServiceRow) {
  return {
    id: service.id,
    name: service.name,
    durationMin: service.durationMin,
    price: service.price === null ? null : Number(service.price),
    active: service.active,
    order: service.order,
  };
}

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  async findActive() {
    const services = await this.prisma.service.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
    });
    return services.map(toServiceDto);
  }

  async findAll() {
    const services = await this.prisma.service.findMany({
      orderBy: { order: 'asc' },
    });
    return services.map(toServiceDto);
  }

  async create(dto: CreateServiceDto) {
    const service = await this.prisma.service.create({ data: dto });
    return toServiceDto(service);
  }

  async update(id: string, dto: UpdateServiceDto) {
    await this.ensureExists(id);
    const service = await this.prisma.service.update({
      where: { id },
      data: dto,
    });
    return toServiceDto(service);
  }

  async remove(id: string) {
    await this.ensureExists(id);
    try {
      await this.prisma.service.delete({ where: { id } });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2003'
      ) {
        throw new ConflictException(
          'Este procedimento já tem agendamentos vinculados. Desative-o em vez de remover.',
        );
      }
      throw err;
    }
    return { ok: true };
  }

  private async ensureExists(id: string) {
    const found = await this.prisma.service.findUnique({ where: { id } });
    if (!found) throw new NotFoundException('Procedimento não encontrado.');
  }
}
