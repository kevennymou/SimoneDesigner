export interface CalendarDay {
  date: string;
  day: number;
  disabled: boolean;
}

/** month é 0-indexado (0=janeiro). */
export function buildCalendarDays(
  year: number,
  month: number,
  availableDates: string[],
  todayISO: string,
): (CalendarDay | null)[] {
  const firstDow = new Date(Date.UTC(year, month, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const availableSet = new Set(availableDates);

  const cells: (CalendarDay | null)[] = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);

  for (let day = 1; day <= daysInMonth; day++) {
    const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const disabled = date < todayISO || !availableSet.has(date);
    cells.push({ date, day, disabled });
  }
  return cells;
}

export const MONTH_NAMES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];
