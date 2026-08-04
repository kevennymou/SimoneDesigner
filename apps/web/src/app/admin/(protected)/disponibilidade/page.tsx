"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDateLongPtBR, todayISOInBusinessTZ } from "@simone/shared";
import { ApiError, getAvailableDates, getDayTimes, setDayTimes } from "@/lib/api";
import { MONTH_NAMES } from "@/lib/calendar";
import { capitalizeFirst } from "@/lib/schedule";

const WEEKDAY_LETTERS = ["D", "S", "T", "Q", "Q", "S", "S"];

function buildTimeOptions(): string[] {
  const out: string[] = [];
  for (let m = 7 * 60; m <= 21 * 60; m += 30) {
    const h = Math.floor(m / 60)
      .toString()
      .padStart(2, "0");
    const min = (m % 60).toString().padStart(2, "0");
    out.push(`${h}:${min}`);
  }
  return out;
}
const TIME_OPTIONS = buildTimeOptions();

interface CalendarCell {
  date: string;
  day: number;
  disabled: boolean;
  hasData: boolean;
}

function buildAdminCalendar(
  year: number,
  month: number,
  datesWithData: Set<string>,
  todayISO: string,
): (CalendarCell | null)[] {
  const firstDow = new Date(Date.UTC(year, month, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const cells: (CalendarCell | null)[] = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) {
    const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    cells.push({ date, day, disabled: date < todayISO, hasData: datesWithData.has(date) });
  }
  return cells;
}

export default function AvailabilityPage() {
  const today = todayISOInBusinessTZ();
  const [monthOffset, setMonthOffset] = useState(0);
  const [datesWithData, setDatesWithData] = useState<Set<string> | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedJustNow, setSavedJustNow] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAvailableDates().then((dates) => setDatesWithData(new Set(dates)));
  }, []);

  async function handleSelectDate(date: string) {
    setSelectedDate(date);
    setSavedJustNow(false);
    setError(null);
    setLoadingTimes(true);
    try {
      const times = await getDayTimes(date);
      setChecked(new Set(times));
    } catch {
      setChecked(new Set());
      setError("Não foi possível carregar os horários dessa data.");
    } finally {
      setLoadingTimes(false);
    }
  }

  function toggleTime(time: string) {
    setSavedJustNow(false);
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(time)) next.delete(time);
      else next.add(time);
      return next;
    });
  }

  async function handleSave() {
    if (!selectedDate) return;
    setSaving(true);
    setError(null);
    try {
      const times = [...checked];
      await setDayTimes(selectedDate, times);
      setDatesWithData((prev) => {
        const next = new Set(prev ?? []);
        if (times.length > 0) next.add(selectedDate);
        else next.delete(selectedDate);
        return next;
      });
      setSavedJustNow(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível salvar.");
    } finally {
      setSaving(false);
    }
  }

  const [todayYear, todayMonth] = today.split("-").map(Number);
  const base = new Date(Date.UTC(todayYear, todayMonth - 1 + monthOffset, 1));
  const year = base.getUTCFullYear();
  const month = base.getUTCMonth();
  const cells = datesWithData ? buildAdminCalendar(year, month, datesWithData, today) : null;

  return (
    <div className="px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
      <div className="mb-4 flex items-center gap-3">
        <Link
          href="/admin/mais"
          aria-label="Voltar"
          className="border-border text-primary flex h-9 w-9 items-center justify-center rounded-full border text-lg"
        >
          ‹
        </Link>
        <h1 className="font-heading text-xl text-foreground">Disponibilidade</h1>
      </div>

      <p className="mb-4 text-sm text-muted-foreground">
        Toque numa data pra escolher quais horários ficam disponíveis pra agendamento nela.
      </p>

      {!cells ? (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      ) : (
        <div className="lg:max-w-md">
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setMonthOffset((o) => Math.max(0, o - 1))}
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
              onClick={() => setMonthOffset((o) => o + 1)}
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
            {cells.map((cell, i) =>
              cell === null ? (
                <div key={`empty-${i}`} />
              ) : (
                <button
                  key={cell.date}
                  type="button"
                  disabled={cell.disabled}
                  onClick={() => handleSelectDate(cell.date)}
                  className={`relative aspect-square rounded-lg text-sm ${
                    selectedDate === cell.date
                      ? "bg-primary text-primary-foreground"
                      : cell.disabled
                        ? "text-muted-foreground/50"
                        : "bg-secondary text-foreground hover:opacity-80"
                  }`}
                >
                  {cell.day}
                  {cell.hasData && selectedDate !== cell.date && (
                    <span className="bg-gold absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full" />
                  )}
                </button>
              ),
            )}
          </div>
        </div>
      )}

      {selectedDate && (
        <div className="border-border bg-background mt-6 rounded-2xl border px-4 py-4 lg:max-w-md">
          <p className="font-heading text-base text-foreground">
            {capitalizeFirst(formatDateLongPtBR(selectedDate))}
          </p>

          {loadingTimes ? (
            <p className="mt-3 text-sm text-muted-foreground">Carregando horários...</p>
          ) : (
            <>
              <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-5">
                {TIME_OPTIONS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleTime(t)}
                    className={`rounded-lg py-2 text-xs ${
                      checked.has(t)
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-foreground hover:opacity-80"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {error && (
                <p className="text-destructive mt-3 text-sm" role="alert">
                  {error}
                </p>
              )}

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="bg-primary text-primary-foreground mt-4 w-full rounded-xl py-3.5 text-sm font-medium disabled:opacity-60"
              >
                {saving ? "Salvando..." : savedJustNow ? "Salvo ✓" : "Salvar horários"}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
