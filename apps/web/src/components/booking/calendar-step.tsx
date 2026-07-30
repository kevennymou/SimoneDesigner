"use client";

import type { BlockedDate, WeeklyDay } from "@simone/shared";
import { todayISOInBusinessTZ } from "@simone/shared";
import { buildCalendarDays, MONTH_NAMES } from "@/lib/calendar";

const WEEKDAY_LETTERS = ["D", "S", "T", "Q", "Q", "S", "S"];

interface CalendarStepProps {
  weekly: WeeklyDay[];
  blocks: BlockedDate[];
  monthOffset: number;
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
  onMonthOffsetChange: (offset: number) => void;
}

export function CalendarStep({
  weekly,
  blocks,
  monthOffset,
  selectedDate,
  onSelectDate,
  onMonthOffsetChange,
}: CalendarStepProps) {
  const today = todayISOInBusinessTZ();
  const [todayYear, todayMonth] = today.split("-").map(Number);
  const base = new Date(Date.UTC(todayYear, todayMonth - 1 + monthOffset, 1));
  const year = base.getUTCFullYear();
  const month = base.getUTCMonth();

  const days = buildCalendarDays(year, month, weekly, blocks, today);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => onMonthOffsetChange(Math.max(0, monthOffset - 1))}
          disabled={monthOffset === 0}
          aria-label="Mês anterior"
          className="bg-secondary text-primary flex h-8 w-8 items-center justify-center rounded-full disabled:opacity-30"
        >
          ‹
        </button>
        <span className="font-heading text-lg text-foreground">
          {MONTH_NAMES[month]} {year}
        </span>
        <button
          type="button"
          onClick={() => onMonthOffsetChange(monthOffset + 1)}
          aria-label="Próximo mês"
          className="bg-secondary text-primary flex h-8 w-8 items-center justify-center rounded-full"
        >
          ›
        </button>
      </div>

      <div className="mb-1.5 grid grid-cols-7 gap-1">
        {WEEKDAY_LETTERS.map((l, i) => (
          <div key={i} className="text-center text-[10px] tracking-wide text-muted-foreground">
            {l}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((cell, i) =>
          cell === null ? (
            <div key={`empty-${i}`} />
          ) : (
            <button
              key={cell.date}
              type="button"
              disabled={cell.disabled}
              onClick={() => onSelectDate(cell.date)}
              className={`aspect-square rounded-lg text-sm ${
                selectedDate === cell.date
                  ? "bg-primary text-primary-foreground"
                  : cell.disabled
                    ? "text-muted-foreground/50"
                    : "bg-secondary text-foreground hover:opacity-80"
              }`}
            >
              {cell.day}
            </button>
          ),
        )}
      </div>

      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
        Atendimento presencial. Dias em cinza estão indisponíveis.
      </p>
    </div>
  );
}
