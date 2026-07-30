import { Injectable } from '@nestjs/common';
import { dateOnlyToISO } from '@simone/shared';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BackupService {
  constructor(private readonly prisma: PrismaService) {}

  async build() {
    const [clients, appointments, services, waitlist] = await Promise.all([
      this.prisma.client.findMany({ orderBy: { createdAt: 'asc' } }),
      this.prisma.appointment.findMany({
        include: { client: true, service: true },
        orderBy: { date: 'asc' },
      }),
      this.prisma.service.findMany({ orderBy: { order: 'asc' } }),
      this.prisma.waitlistEntry.findMany({
        include: { client: true, service: true },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    return {
      exportedAt: new Date().toISOString(),
      clients: clients.map((c) => ({
        id: c.id,
        name: c.name,
        whatsapp: c.whatsapp,
        email: c.email,
        notes: c.notes,
        createdAt: c.createdAt,
      })),
      services: services.map((s) => ({
        id: s.id,
        name: s.name,
        durationMin: s.durationMin,
        price: s.price === null ? null : Number(s.price),
        active: s.active,
      })),
      appointments: appointments.map((a) => ({
        id: a.id,
        date: dateOnlyToISO(a.date),
        startTime: a.startTime,
        endTime: a.endTime,
        status: a.status,
        price: a.priceAtBooking === null ? null : Number(a.priceAtBooking),
        client: a.client.name,
        clientWhatsapp: a.client.whatsapp,
        service: a.service.name,
        createdAt: a.createdAt,
      })),
      waitlist: waitlist.map((w) => ({
        id: w.id,
        date: dateOnlyToISO(w.date),
        time: w.time,
        status: w.status,
        client: w.client.name,
        clientWhatsapp: w.client.whatsapp,
        service: w.service.name,
      })),
    };
  }
}
