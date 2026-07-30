export const BUSINESS_TIMEZONE = 'America/Fortaleza';

/** "2026-08-04" -> Date em UTC-midnight, seguro pra colunas @db.Date do Prisma. */
export function dateStringToUTCDate(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00.000Z`);
}

/** Inverso de dateStringToUTCDate — sempre use getters UTC pra não vazar 1 dia. */
export function dateOnlyToISO(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function weekdayOf(dateStr: string): number {
  return dateStringToUTCDate(dateStr).getUTCDay();
}

export function todayISOInBusinessTZ(): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: BUSINESS_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const y = parts.find((p) => p.type === 'year')!.value;
  const m = parts.find((p) => p.type === 'month')!.value;
  const d = parts.find((p) => p.type === 'day')!.value;
  return `${y}-${m}-${d}`;
}

export function nowMinutesInBusinessTZ(): number {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: BUSINESS_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date());
  const h = Number(parts.find((p) => p.type === 'hour')!.value);
  const m = Number(parts.find((p) => p.type === 'minute')!.value);
  return h * 60 + m;
}

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60)
    .toString()
    .padStart(2, '0');
  const m = (mins % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

export function addMinutesToTime(time: string, add: number): string {
  return minutesToTime(timeToMinutes(time) + add);
}

export function rangesOverlap(
  aStart: number,
  aEnd: number,
  bStart: number,
  bEnd: number,
): boolean {
  return aStart < bEnd && bStart < aEnd;
}

const WEEKDAY_LONG = [
  'domingo',
  'segunda-feira',
  'terça-feira',
  'quarta-feira',
  'quinta-feira',
  'sexta-feira',
  'sábado',
];
const MONTHS = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
];

/** "2026-08-04" -> "terça-feira, 4 de agosto" */
export function formatDateLongPtBR(dateStr: string): string {
  const [, m, d] = dateStr.split('-').map(Number);
  const weekday = dateStringToUTCDate(dateStr).getUTCDay();
  return `${WEEKDAY_LONG[weekday]}, ${d} de ${MONTHS[m - 1]}`;
}

/** "2026-08-04" -> "04/08/2026" */
export function formatDateBR(dateStr: string): string {
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}
