import { AppointmentStatus } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export async function getTopProcedures(
  prisma: PrismaService,
  from: Date,
  to: Date,
  limit = 5,
) {
  const grouped = await prisma.appointment.groupBy({
    by: ['serviceId'],
    where: { date: { gte: from, lte: to }, status: { not: AppointmentStatus.CANCELLED } },
    _count: { serviceId: true },
  });
  if (grouped.length === 0) return [];

  const services = await prisma.service.findMany({
    where: { id: { in: grouped.map((g) => g.serviceId) } },
  });
  const sorted = [...grouped]
    .sort((a, b) => b._count.serviceId - a._count.serviceId)
    .slice(0, limit);
  const max = sorted[0]._count.serviceId;

  return sorted.map((g) => ({
    name: services.find((s) => s.id === g.serviceId)?.name ?? 'Procedimento removido',
    count: g._count.serviceId,
    pct: Math.round((g._count.serviceId / max) * 100),
  }));
}
