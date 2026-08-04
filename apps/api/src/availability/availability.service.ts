import { Injectable } from '@nestjs/common';
import {
  dateOnlyToISO,
  dateStringToUTCDate,
  minutesToTime,
  nowMinutesInBusinessTZ,
  rangesOverlap,
  timeToMinutes,
  todayISOInBusinessTZ,
} from '@simone/shared';
import { PrismaService } from '../prisma/prisma.service';
import { SetDayAvailabilityDto } from './dto/set-day-availability.dto';

interface DayStatus {
  open: boolean;
  reason: string | null;
  times: string[];
}

@Injectable()
export class AvailabilityService {
  constructor(private readonly prisma: PrismaService) {}

  /** Datas (>= hoje) que têm pelo menos um horário disponível — pro calendário público e pra visão geral do admin. */
  async getAvailableDates(): Promise<string[]> {
    const rows = await this.prisma.dayAvailability.findMany({
      where: { date: { gte: dateStringToUTCDate(todayISOInBusinessTZ()) } },
      select: { date: true, times: true },
      orderBy: { date: 'asc' },
    });
    return rows.filter((r) => r.times.length > 0).map((r) => dateOnlyToISO(r.date));
  }

  async getDayTimes(dateStr: string): Promise<string[]> {
    const row = await this.prisma.dayAvailability.findUnique({
      where: { date: dateStringToUTCDate(dateStr) },
    });
    return row?.times.sort() ?? [];
  }

  async setDayTimes(dateStr: string, dto: SetDayAvailabilityDto): Promise<string[]> {
    const times = [...new Set(dto.times)].sort();
    if (times.length === 0) {
      await this.prisma.dayAvailability.deleteMany({
        where: { date: dateStringToUTCDate(dateStr) },
      });
      return [];
    }
    const row = await this.prisma.dayAvailability.upsert({
      where: { date: dateStringToUTCDate(dateStr) },
      update: { times },
      create: { date: dateStringToUTCDate(dateStr), times },
    });
    return row.times.sort();
  }

  async getSlots(dateStr: string, serviceId?: string) {
    const status = await this.getDayStatus(dateStr);
    if (!status.open) {
      return { date: dateStr, open: false, reason: status.reason, slots: [] };
    }

    const duration = await this.resolveDuration(serviceId);
    const busy = await this.fetchBusyRanges(dateStr);

    const today = todayISOInBusinessTZ();
    const isToday = dateStr === today;
    const nowMinutes = isToday ? nowMinutesInBusinessTZ() : -1;

    const slots = status.times
      .map(timeToMinutes)
      .filter((startMin) => !isToday || startMin > nowMinutes)
      .sort((a, b) => a - b)
      .map((startMin) => ({
        time: minutesToTime(startMin),
        available: !busy.some(([bStart, bEnd]) =>
          rangesOverlap(startMin, startMin + duration, bStart, bEnd),
        ),
      }));

    return { date: dateStr, open: true, reason: null, slots };
  }

  async checkSlotFree(
    dateStr: string,
    startTime: string,
    durationMin: number,
    excludeAppointmentId?: string,
  ): Promise<{ free: boolean; reason?: string }> {
    const status = await this.getDayStatus(dateStr);
    if (!status.open || !status.times.includes(startTime)) {
      return { free: false, reason: status.reason ?? 'Esse horário não está disponível.' };
    }

    const startMin = timeToMinutes(startTime);
    const endMin = startMin + durationMin;

    const today = todayISOInBusinessTZ();
    if (dateStr === today && startMin <= nowMinutesInBusinessTZ()) {
      return { free: false, reason: 'Esse horário já passou.' };
    }

    const busy = await this.fetchBusyRanges(dateStr, excludeAppointmentId);
    const conflict = busy.some(([bStart, bEnd]) =>
      rangesOverlap(startMin, endMin, bStart, bEnd),
    );
    if (conflict) {
      return { free: false, reason: 'Esse horário já está ocupado.' };
    }

    return { free: true };
  }

  private async getDayStatus(dateStr: string): Promise<DayStatus> {
    const today = todayISOInBusinessTZ();
    if (dateStr < today) {
      return { open: false, reason: 'Data no passado.', times: [] };
    }

    const row = await this.prisma.dayAvailability.findUnique({
      where: { date: dateStringToUTCDate(dateStr) },
    });
    if (!row || row.times.length === 0) {
      return { open: false, reason: 'Sem horários disponíveis nesta data.', times: [] };
    }

    return { open: true, reason: null, times: row.times };
  }

  private async fetchBusyRanges(
    dateStr: string,
    excludeAppointmentId?: string,
  ): Promise<Array<readonly [number, number]>> {
    const appointments = await this.prisma.appointment.findMany({
      where: {
        date: dateStringToUTCDate(dateStr),
        status: { not: 'CANCELLED' },
        ...(excludeAppointmentId ? { id: { not: excludeAppointmentId } } : {}),
      },
      select: { startTime: true, endTime: true },
    });
    return appointments.map(
      (a) => [timeToMinutes(a.startTime), timeToMinutes(a.endTime)] as const,
    );
  }

  private async resolveDuration(serviceId?: string): Promise<number> {
    if (serviceId) {
      const service = await this.prisma.service.findUnique({
        where: { id: serviceId },
      });
      if (service) return service.durationMin;
    }
    const services = await this.prisma.service.findMany({
      where: { active: true },
      select: { durationMin: true },
    });
    if (services.length === 0) return 30;
    return Math.max(...services.map((s) => s.durationMin));
  }
}
