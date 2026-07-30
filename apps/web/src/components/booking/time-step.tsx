"use client";

import type { Slot } from "@simone/shared";

interface TimeStepProps {
  dateLabel: string;
  slots: Slot[] | null;
  loading: boolean;
  dayOpen: { open: boolean; reason: string | null } | null;
  selectedTime: string | null;
  onSelectTime: (time: string, available: boolean) => void;
}

export function TimeStep({
  dateLabel,
  slots,
  loading,
  dayOpen,
  selectedTime,
  onSelectTime,
}: TimeStepProps) {
  if (loading || slots === null) {
    return <p className="text-sm text-muted-foreground">Carregando horários...</p>;
  }

  if (dayOpen && !dayOpen.open) {
    return (
      <p className="text-sm text-muted-foreground">
        {dayOpen.reason ?? "Não há horários disponíveis nesse dia."}
      </p>
    );
  }

  if (slots.length === 0) {
    return <p className="text-sm text-muted-foreground">Não há horários livres nesse dia.</p>;
  }

  return (
    <div>
      <p className="mb-4 text-sm text-muted-foreground">{dateLabel} · horários</p>
      <div className="grid grid-cols-3 gap-2.5">
        {slots.map((s) => {
          const selected = selectedTime === s.time;
          return (
            <button
              key={s.time}
              type="button"
              onClick={() => onSelectTime(s.time, s.available)}
              className={`rounded-xl border py-3.5 text-center text-sm ${
                selected
                  ? "bg-primary border-primary text-primary-foreground"
                  : s.available
                    ? "border-border bg-background text-foreground"
                    : "border-border bg-secondary text-muted-foreground line-through"
              }`}
            >
              {s.time}
            </button>
          );
        })}
      </div>
      <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
        <span className="bg-secondary inline-block h-3 w-3 rounded-sm" />
        ocupado — toque para entrar na lista de espera
      </div>
    </div>
  );
}
