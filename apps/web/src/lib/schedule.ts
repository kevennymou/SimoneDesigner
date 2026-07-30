import type { WeeklyDay } from "@simone/shared";

const SHORT_WEEKDAY = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
export const WEEKDAY_LETTERS = ["D", "S", "T", "Q", "Q", "S", "S"];

export function formatWeeklyRange(weekly: WeeklyDay[]): string {
  const open = [...weekly].filter((d) => d.isOpen).sort((a, b) => a.weekday - b.weekday);
  if (open.length === 0) return "Fechado";

  const first = open[0];
  const last = open[open.length - 1];
  const isContiguous = open.length === last.weekday - first.weekday + 1;

  if (isContiguous) {
    return first.weekday === last.weekday
      ? SHORT_WEEKDAY[first.weekday]
      : `${SHORT_WEEKDAY[first.weekday]} – ${SHORT_WEEKDAY[last.weekday]}`;
  }
  return open.map((d) => SHORT_WEEKDAY[d.weekday]).join(", ");
}

export function formatHoursRange(weekly: WeeklyDay[]): string | null {
  const open = weekly.find((d) => d.isOpen && d.startTime && d.endTime);
  if (!open) return null;
  return `${open.startTime} – ${open.endTime}`;
}

/** Só a primeira letra — evita o CSS `capitalize` maiusculizar cada palavra ("Quinta-Feira, 30 De Julho"). */
export function capitalizeFirst(text: string): string {
  return text.length ? text.charAt(0).toUpperCase() + text.slice(1) : text;
}
