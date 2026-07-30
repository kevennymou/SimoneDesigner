import { Injectable } from '@nestjs/common';
import { dateOnlyToISO, dateStringToUTCDate } from '@simone/shared';
import { AppointmentStatus, Prisma } from '../../generated/prisma/client';
import { getTopProcedures } from '../common/top-procedures';
import { PrismaService } from '../prisma/prisma.service';

type Granularity = 'day' | 'week' | 'month';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getReport(fromStr: string, toStr: string) {
    const from = dateStringToUTCDate(fromStr);
    const to = dateStringToUTCDate(toStr);

    const [completed, allInRange, topProcedures] = await Promise.all([
      this.prisma.appointment.findMany({
        where: { date: { gte: from, lte: to }, status: AppointmentStatus.COMPLETED },
        select: { priceAtBooking: true, date: true, clientId: true, startTime: true },
      }),
      this.prisma.appointment.findMany({
        where: { date: { gte: from, lte: to } },
        select: { status: true },
      }),
      getTopProcedures(this.prisma, from, to),
    ]);

    const revenue = completed.reduce((sum, a) => sum + Number(a.priceAtBooking ?? 0), 0);
    const count = allInRange.filter((a) => a.status !== AppointmentStatus.CANCELLED).length;
    const avgTicket = completed.length ? Math.round(revenue / completed.length) : 0;
    const noShows = allInRange.filter((a) => a.status === AppointmentStatus.NO_SHOW).length;
    const cancellations = allInRange.filter(
      (a) => a.status === AppointmentStatus.CANCELLED,
    ).length;
    const clientsServed = new Set(completed.map((a) => a.clientId)).size;
    const busiestHour = this.mostFrequent(completed.map((a) => a.startTime));

    return {
      from: fromStr,
      to: toStr,
      revenue,
      count,
      avgTicket,
      clientsServed,
      noShows,
      cancellations,
      busiestHour,
      topProcedures,
      series: this.buildSeries(completed, from, to),
    };
  }

  async exportCsv(fromStr: string, toStr: string): Promise<string> {
    const appointments = await this.prisma.appointment.findMany({
      where: {
        date: { gte: dateStringToUTCDate(fromStr), lte: dateStringToUTCDate(toStr) },
      },
      include: { client: true, service: true },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });

    const header = ['Data', 'Horário', 'Cliente', 'WhatsApp', 'Procedimento', 'Valor', 'Status'];
    const rows = appointments.map((a) => [
      dateOnlyToISO(a.date),
      a.startTime,
      a.client.name,
      a.client.whatsapp,
      a.service.name,
      a.priceAtBooking === null ? '' : Number(a.priceAtBooking).toFixed(2),
      a.status,
    ]);
    return [header, ...rows].map((row) => row.map(csvEscape).join(',')).join('\r\n');
  }

  private mostFrequent(values: string[]): string | null {
    if (values.length === 0) return null;
    const counts = new Map<string, number>();
    for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
    let best: string | null = null;
    let bestCount = 0;
    for (const [v, c] of counts) {
      if (c > bestCount) {
        best = v;
        bestCount = c;
      }
    }
    return best;
  }

  private buildSeries(
    completed: { priceAtBooking: Prisma.Decimal | null; date: Date }[],
    from: Date,
    to: Date,
  ) {
    const days = Math.round((to.getTime() - from.getTime()) / 86_400_000) + 1;
    const granularity: Granularity = days <= 14 ? 'day' : days <= 60 ? 'week' : 'month';

    const buckets = new Map<string, { revenue: number; count: number }>();
    for (const a of completed) {
      const key = this.bucketKey(a.date, granularity);
      const cur = buckets.get(key) ?? { revenue: 0, count: 0 };
      cur.revenue += Number(a.priceAtBooking ?? 0);
      cur.count += 1;
      buckets.set(key, cur);
    }
    return Array.from(buckets.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([label, v]) => ({ label, ...v }));
  }

  private bucketKey(date: Date, granularity: Granularity): string {
    if (granularity === 'day') return dateOnlyToISO(date);
    if (granularity === 'month') return dateOnlyToISO(date).slice(0, 7);
    // início da semana no domingo, mesma convenção usada no resto do projeto
    const weekStart = new Date(date);
    const dow = weekStart.getUTCDay();
    weekStart.setUTCDate(weekStart.getUTCDate() - dow);
    return dateOnlyToISO(weekStart);
  }
}

function csvEscape(value: string): string {
  if (/[",\r\n]/.test(value)) return '"' + value.replace(/"/g, '""') + '"';
  return value;
}
