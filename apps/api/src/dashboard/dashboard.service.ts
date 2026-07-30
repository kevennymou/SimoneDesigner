import { Injectable } from '@nestjs/common';
import { todayISOInBusinessTZ } from '@simone/shared';
import { AppointmentStatus } from '../../generated/prisma/client';
import { getTopProcedures } from '../common/top-procedures';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary() {
    const today = todayISOInBusinessTZ();
    const [y, m, d] = today.split('-').map(Number);
    const todayDate = new Date(Date.UTC(y, m - 1, d));

    const dow = todayDate.getUTCDay();
    const weekStart = new Date(todayDate);
    weekStart.setUTCDate(todayDate.getUTCDate() - dow);
    const weekEnd = new Date(todayDate);
    weekEnd.setUTCDate(todayDate.getUTCDate() + (6 - dow));

    const monthStart = new Date(Date.UTC(y, m - 1, 1));
    const monthEnd = new Date(Date.UTC(y, m, 0));

    const [todayStats, weekStats, monthStats, todayAppointments, topProcedures, clientStats] =
      await Promise.all([
        this.periodStats(todayDate, todayDate),
        this.periodStats(weekStart, weekEnd),
        this.periodStats(monthStart, monthEnd),
        this.prisma.appointment.findMany({
          where: { date: todayDate, status: { not: AppointmentStatus.CANCELLED } },
          include: { client: true, service: true },
          orderBy: { startTime: 'asc' },
        }),
        getTopProcedures(this.prisma, monthStart, monthEnd),
        this.clientStats(monthStart, monthEnd),
      ]);

    return {
      today: todayStats,
      week: weekStats,
      month: monthStats,
      ...clientStats,
      todayAppointments: todayAppointments.map((a) => ({
        id: a.id,
        time: a.startTime,
        client: a.client.name,
        service: a.service.name,
        price: a.priceAtBooking === null ? null : Number(a.priceAtBooking),
        status: a.status,
      })),
      topProcedures,
    };
  }

  private async periodStats(from: Date, to: Date) {
    const [count, completed] = await Promise.all([
      this.prisma.appointment.count({
        where: { date: { gte: from, lte: to }, status: { not: AppointmentStatus.CANCELLED } },
      }),
      this.prisma.appointment.findMany({
        where: { date: { gte: from, lte: to }, status: AppointmentStatus.COMPLETED },
        select: { priceAtBooking: true },
      }),
    ]);
    const revenue = completed.reduce((sum, a) => sum + Number(a.priceAtBooking ?? 0), 0);
    return {
      count,
      revenue,
      avgTicket: completed.length ? Math.round(revenue / completed.length) : 0,
    };
  }

  private async clientStats(from: Date, to: Date) {
    const clients = await this.prisma.client.findMany({
      include: {
        appointments: {
          where: { status: { not: AppointmentStatus.CANCELLED } },
          orderBy: { date: 'asc' },
          select: { date: true },
        },
      },
    });

    let newClients = 0;
    let recurringClients = 0;
    for (const c of clients) {
      if (c.appointments.length === 0) continue;
      const hasInPeriod = c.appointments.some((a) => a.date >= from && a.date <= to);
      if (!hasInPeriod) continue;
      const firstDate = c.appointments[0].date;
      const isNew = firstDate >= from && firstDate <= to;
      if (isNew) newClients++;
      else recurringClients++;
    }
    return { newClients, recurringClients };
  }
}
