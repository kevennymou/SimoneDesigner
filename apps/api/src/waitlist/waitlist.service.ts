import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  buildWhatsAppUrl,
  dateOnlyToISO,
  dateStringToUTCDate,
  formatDateBR,
  normalizeWhatsApp,
} from '@simone/shared';
import { Client, Service, WaitlistEntry, WaitlistStatus } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWaitlistDto } from './dto/create-waitlist.dto';

type WaitlistWithRelations = WaitlistEntry & { client: Client; service: Service };

function toWaitlistDto(w: WaitlistWithRelations) {
  return {
    id: w.id,
    date: dateOnlyToISO(w.date),
    time: w.time,
    status: w.status,
    createdAt: w.createdAt,
    client: { id: w.client.id, name: w.client.name, whatsapp: w.client.whatsapp },
    service: { id: w.service.id, name: w.service.name },
  };
}

const INCLUDE_RELATIONS = { client: true, service: true } as const;

@Injectable()
export class WaitlistService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateWaitlistDto) {
    const service = await this.prisma.service.findUnique({
      where: { id: dto.serviceId },
    });
    if (!service) throw new BadRequestException('Procedimento inválido.');

    const whatsapp = normalizeWhatsApp(dto.clientWhatsapp);
    const client = await this.prisma.client.upsert({
      where: { whatsapp },
      update: { name: dto.clientName },
      create: { name: dto.clientName, whatsapp },
    });

    const entry = await this.prisma.waitlistEntry.create({
      data: {
        clientId: client.id,
        serviceId: service.id,
        date: dateStringToUTCDate(dto.date),
        time: dto.time,
        status: WaitlistStatus.WAITING,
      },
      include: INCLUDE_RELATIONS,
    });
    return toWaitlistDto(entry);
  }

  async findAll() {
    const entries = await this.prisma.waitlistEntry.findMany({
      where: { status: WaitlistStatus.WAITING },
      include: INCLUDE_RELATIONS,
      orderBy: { createdAt: 'asc' },
    });
    return entries.map(toWaitlistDto);
  }

  async buildNotifyLink(id: string) {
    const entry = await this.prisma.waitlistEntry.findUnique({
      where: { id },
      include: INCLUDE_RELATIONS,
    });
    if (!entry) throw new NotFoundException('Item da lista de espera não encontrado.');

    await this.prisma.waitlistEntry.update({
      where: { id },
      data: { status: WaitlistStatus.NOTIFIED },
    });

    const message =
      `Olá ${entry.client.name}! O horário ${entry.time} de ${formatDateBR(dateOnlyToISO(entry.date))} ` +
      `para ${entry.service.name} foi liberado. Ainda tem interesse em agendar?`;

    return { whatsappUrl: buildWhatsAppUrl(entry.client.whatsapp, message) };
  }

  async remove(id: string) {
    try {
      await this.prisma.waitlistEntry.delete({ where: { id } });
    } catch {
      throw new NotFoundException('Item da lista de espera não encontrado.');
    }
    return { ok: true };
  }
}
