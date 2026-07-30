import { Injectable, NotFoundException } from '@nestjs/common';
import { dateOnlyToISO } from '@simone/shared';
import { AppointmentStatus } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  async search(query?: string) {
    const q = query?.trim();
    const digits = q?.replace(/\D/g, '');

    const clients = await this.prisma.client.findMany({
      where: q
        ? {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              ...(digits ? [{ whatsapp: { contains: digits } }] : []),
            ],
          }
        : undefined,
      orderBy: { name: 'asc' },
    });

    return Promise.all(
      clients.map(async (c) => {
        const [visits, noShows] = await Promise.all([
          this.prisma.appointment.count({
            where: { clientId: c.id, status: AppointmentStatus.COMPLETED },
          }),
          this.prisma.appointment.count({
            where: { clientId: c.id, status: AppointmentStatus.NO_SHOW },
          }),
        ]);
        return {
          id: c.id,
          name: c.name,
          whatsapp: c.whatsapp,
          visits,
          noShows,
        };
      }),
    );
  }

  async findOne(id: string) {
    const client = await this.prisma.client.findUnique({
      where: { id },
      include: {
        appointments: {
          include: { service: true },
          orderBy: [{ date: 'desc' }, { startTime: 'desc' }],
        },
      },
    });
    if (!client) throw new NotFoundException('Cliente não encontrada.');

    const completed = client.appointments.filter(
      (a) => a.status === AppointmentStatus.COMPLETED,
    );
    const noShows = client.appointments.filter(
      (a) => a.status === AppointmentStatus.NO_SHOW,
    ).length;
    const cancellations = client.appointments.filter(
      (a) => a.status === AppointmentStatus.CANCELLED,
    ).length;
    const total = completed.reduce(
      (sum, a) => sum + Number(a.priceAtBooking ?? 0),
      0,
    );

    return {
      id: client.id,
      name: client.name,
      whatsapp: client.whatsapp,
      email: client.email,
      visits: completed.length,
      noShows,
      cancellations,
      total,
      history: client.appointments.map((a) => ({
        id: a.id,
        date: dateOnlyToISO(a.date),
        startTime: a.startTime,
        service: a.service.name,
        price: a.priceAtBooking === null ? null : Number(a.priceAtBooking),
        status: a.status,
      })),
    };
  }
}
