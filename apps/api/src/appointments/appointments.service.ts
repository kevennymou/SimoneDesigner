import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { normalizeWhatsApp } from '@simone/shared';
import { randomBytes } from 'node:crypto';
import { AvailabilityService } from '../availability/availability.service';
import { addMinutesToTime, dateOnlyToISO, dateStringToUTCDate } from '../common/date-utils';
import {
  Appointment,
  AppointmentStatus,
  Client,
  Prisma,
  Service,
} from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { ListAppointmentsQueryDto } from './dto/list-appointments-query.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

type AppointmentWithRelations = Appointment & { client: Client; service: Service };

function toAppointmentDto(a: AppointmentWithRelations) {
  return {
    id: a.id,
    date: dateOnlyToISO(a.date),
    startTime: a.startTime,
    endTime: a.endTime,
    status: a.status,
    price: a.priceAtBooking === null ? null : Number(a.priceAtBooking),
    source: a.source,
    confirmedAt: a.confirmedAt,
    cancelledAt: a.cancelledAt,
    cancelReason: a.cancelReason,
    createdAt: a.createdAt,
    client: { id: a.client.id, name: a.client.name, whatsapp: a.client.whatsapp },
    service: { id: a.service.id, name: a.service.name },
  };
}

const INCLUDE_RELATIONS = { client: true, service: true } as const;

@Injectable()
export class AppointmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly availability: AvailabilityService,
  ) {}

  async create(dto: CreateAppointmentDto) {
    const service = await this.prisma.service.findUnique({
      where: { id: dto.serviceId },
    });
    if (!service || !service.active) {
      throw new BadRequestException('Procedimento inválido.');
    }

    const check = await this.availability.checkSlotFree(
      dto.date,
      dto.startTime,
      service.durationMin,
    );
    if (!check.free) {
      throw new ConflictException(check.reason ?? 'Esse horário não está mais disponível.');
    }

    const whatsapp = normalizeWhatsApp(dto.clientWhatsapp);
    const endTime = addMinutesToTime(dto.startTime, service.durationMin);
    const confirmToken = randomBytes(24).toString('hex');

    try {
      const appointment = await this.prisma.$transaction(async (tx) => {
        const client = await tx.client.upsert({
          where: { whatsapp },
          update: {
            name: dto.clientName,
            ...(dto.clientEmail ? { email: dto.clientEmail } : {}),
          },
          create: { name: dto.clientName, whatsapp, email: dto.clientEmail },
        });

        return tx.appointment.create({
          data: {
            clientId: client.id,
            serviceId: service.id,
            date: dateStringToUTCDate(dto.date),
            startTime: dto.startTime,
            endTime,
            priceAtBooking: service.price,
            confirmToken,
            status: AppointmentStatus.PENDING,
            source: 'site',
          },
          include: INCLUDE_RELATIONS,
        });
      });

      return toAppointmentDto(appointment);
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        throw new ConflictException('Esse horário não está mais disponível.');
      }
      throw err;
    }
  }

  async findMany(filters: ListAppointmentsQueryDto) {
    const where: Prisma.AppointmentWhereInput = {};

    if (filters.date) {
      where.date = dateStringToUTCDate(filters.date);
    } else if (filters.from || filters.to) {
      where.date = {
        ...(filters.from ? { gte: dateStringToUTCDate(filters.from) } : {}),
        ...(filters.to ? { lte: dateStringToUTCDate(filters.to) } : {}),
      };
    }
    if (filters.status) where.status = filters.status;

    const appointments = await this.prisma.appointment.findMany({
      where,
      include: INCLUDE_RELATIONS,
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });
    return appointments.map(toAppointmentDto);
  }

  async update(id: string, dto: UpdateAppointmentDto) {
    const existing = await this.prisma.appointment.findUnique({
      where: { id },
      include: INCLUDE_RELATIONS,
    });
    if (!existing) throw new NotFoundException('Agendamento não encontrado.');

    const data: Prisma.AppointmentUpdateInput = {};

    const currentDate = dateOnlyToISO(existing.date);
    const newDate = dto.date ?? currentDate;
    const newStart = dto.startTime ?? existing.startTime;
    const isRescheduling = newDate !== currentDate || newStart !== existing.startTime;

    if (isRescheduling) {
      const check = await this.availability.checkSlotFree(
        newDate,
        newStart,
        existing.service.durationMin,
        existing.id,
      );
      if (!check.free) {
        throw new ConflictException(check.reason ?? 'Esse horário não está disponível.');
      }
      data.date = dateStringToUTCDate(newDate);
      data.startTime = newStart;
      data.endTime = addMinutesToTime(newStart, existing.service.durationMin);
      if (!dto.status) data.status = AppointmentStatus.PENDING;
    }

    if (dto.status) {
      data.status = dto.status;
      if (dto.status === AppointmentStatus.CANCELLED) {
        data.cancelledAt = new Date();
        if (dto.cancelReason) data.cancelReason = dto.cancelReason;
      }
      if (dto.status === AppointmentStatus.CONFIRMED) {
        data.confirmedAt = new Date();
      }
    }

    const updated = await this.prisma.appointment.update({
      where: { id },
      data,
      include: INCLUDE_RELATIONS,
    });
    return toAppointmentDto(updated);
  }

  async confirmByToken(token: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { confirmToken: token },
      include: INCLUDE_RELATIONS,
    });
    if (!appointment) throw new NotFoundException('Link inválido.');
    if (appointment.status === AppointmentStatus.CANCELLED) {
      throw new BadRequestException('Este agendamento foi cancelado.');
    }

    const updated = await this.prisma.appointment.update({
      where: { id: appointment.id },
      data: { status: AppointmentStatus.CONFIRMED, confirmedAt: new Date() },
      include: INCLUDE_RELATIONS,
    });
    return toAppointmentDto(updated);
  }
}
