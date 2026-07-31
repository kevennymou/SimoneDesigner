import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import {
  dateOnlyToISO,
  dateStringToUTCDate,
  minutesToTime,
  nowMinutesInBusinessTZ,
  rangesOverlap,
  timeToMinutes,
  todayISOInBusinessTZ,
  weekdayOf,
} from '@simone/shared';
import { Prisma, WeeklyAvailability } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBlockDto } from './dto/create-block.dto';
import { WeeklyDayDto } from './dto/weekly-day.dto';

interface DayStatus {
  open: boolean;
  reason: string | null;
  weekly: WeeklyAvailability | null;
}

@Injectable()
export class AvailabilityService {
  constructor(private readonly prisma: PrismaService) {}

  getWeekly() {
    return this.prisma.weeklyAvailability.findMany({
      orderBy: { weekday: 'asc' },
    });
  }

  async updateWeekly(days: WeeklyDayDto[]) {
    await this.prisma.$transaction(
      days.map((d) =>
        this.prisma.weeklyAvailability.upsert({
          where: { weekday: d.weekday },
          update: {
            isOpen: d.isOpen,
            startTime: d.isOpen ? (d.startTime ?? null) : null,
            endTime: d.isOpen ? (d.endTime ?? null) : null,
            breakStart: d.isOpen ? (d.breakStart ?? null) : null,
            breakEnd: d.isOpen ? (d.breakEnd ?? null) : null,
            slotMinutes: d.slotMinutes ?? 30,
          },
          create: {
            weekday: d.weekday,
            isOpen: d.isOpen,
            startTime: d.isOpen ? (d.startTime ?? null) : null,
            endTime: d.isOpen ? (d.endTime ?? null) : null,
            breakStart: d.isOpen ? (d.breakStart ?? null) : null,
            breakEnd: d.isOpen ? (d.breakEnd ?? null) : null,
            slotMinutes: d.slotMinutes ?? 30,
          },
        }),
      ),
    );
    return this.getWeekly();
  }

  async getBlocks() {
    const blocks = await this.prisma.blockedDate.findMany({
      orderBy: { date: 'asc' },
    });
    return blocks.map((b) => ({
      id: b.id,
      date: dateOnlyToISO(b.date),
      label: b.label,
    }));
  }

  async createBlock(dto: CreateBlockDto) {
    try {
      const block = await this.prisma.blockedDate.create({
        data: { date: dateStringToUTCDate(dto.date), label: dto.label },
      });
      return { id: block.id, date: dateOnlyToISO(block.date), label: block.label };
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        throw new ConflictException('Já existe um bloqueio nessa data.');
      }
      throw err;
    }
  }

  async removeBlock(id: string) {
    try {
      await this.prisma.blockedDate.delete({ where: { id } });
    } catch {
      throw new NotFoundException('Bloqueio não encontrado.');
    }
    return { ok: true };
  }

  async getSlots(dateStr: string, serviceId?: string) {
    const status = await this.getDayStatus(dateStr);
    if (!status.open || !status.weekly) {
      return { date: dateStr, open: false, reason: status.reason, slots: [] };
    }

    const duration = await this.resolveDuration(serviceId);
    const candidates = this.buildCandidates(status.weekly, duration);
    const busy = await this.fetchBusyRanges(dateStr);

    const today = todayISOInBusinessTZ();
    const isToday = dateStr === today;
    const nowMinutes = isToday ? nowMinutesInBusinessTZ() : -1;

    const slots = candidates
      .filter((startMin) => !isToday || startMin > nowMinutes)
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
    if (!status.open || !status.weekly) {
      return { free: false, reason: status.reason ?? undefined };
    }

    const startMin = timeToMinutes(startTime);
    const endMin = startMin + durationMin;

    const today = todayISOInBusinessTZ();
    if (dateStr === today && startMin <= nowMinutesInBusinessTZ()) {
      return { free: false, reason: 'Esse horário já passou.' };
    }

    const openStart = timeToMinutes(status.weekly.startTime!);
    const openEnd = timeToMinutes(status.weekly.endTime!);
    if (startMin < openStart || endMin > openEnd) {
      return { free: false, reason: 'Fora do horário de atendimento.' };
    }

    if (status.weekly.breakStart && status.weekly.breakEnd) {
      const breakStart = timeToMinutes(status.weekly.breakStart);
      const breakEnd = timeToMinutes(status.weekly.breakEnd);
      if (rangesOverlap(startMin, endMin, breakStart, breakEnd)) {
        return { free: false, reason: 'Esse horário cai no intervalo.' };
      }
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
    const weekday = weekdayOf(dateStr);
    const weekly = await this.prisma.weeklyAvailability.findUnique({
      where: { weekday },
    });
    if (!weekly?.isOpen || !weekly.startTime || !weekly.endTime) {
      return { open: false, reason: 'Fechado neste dia da semana.', weekly: null };
    }

    const blocked = await this.prisma.blockedDate.findUnique({
      where: { date: dateStringToUTCDate(dateStr) },
    });
    if (blocked) {
      return { open: false, reason: blocked.label, weekly: null };
    }

    const today = todayISOInBusinessTZ();
    if (dateStr < today) {
      return { open: false, reason: 'Data no passado.', weekly: null };
    }

    return { open: true, reason: null, weekly };
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

  private buildCandidates(weekly: WeeklyAvailability, duration: number): number[] {
    const start = timeToMinutes(weekly.startTime!);
    const end = timeToMinutes(weekly.endTime!);
    const breakStart = weekly.breakStart ? timeToMinutes(weekly.breakStart) : null;
    const breakEnd = weekly.breakEnd ? timeToMinutes(weekly.breakEnd) : null;
    const step = weekly.slotMinutes || 30;

    const out: number[] = [];
    for (let t = start; t + duration <= end; t += step) {
      if (
        breakStart !== null &&
        breakEnd !== null &&
        rangesOverlap(t, t + duration, breakStart, breakEnd)
      ) {
        continue;
      }
      out.push(t);
    }
    return out;
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
