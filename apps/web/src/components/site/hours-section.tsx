import type { WeeklyDay } from "@simone/shared";
import { formatHoursRange, formatWeeklyRange } from "@/lib/schedule";

interface HoursSectionProps {
  weekly: WeeklyDay[];
}

export function HoursSection({ weekly }: HoursSectionProps) {
  const hours = formatHoursRange(weekly);
  if (!hours) return null;

  return (
    <section className="mx-auto mt-8 max-w-2xl px-6 sm:px-10">
      <div className="bg-primary text-primary-foreground flex items-center justify-between gap-4 px-6 py-5">
        <div>
          <div className="text-[10px] tracking-[0.2em] uppercase opacity-80">Atendimento</div>
          <div className="font-heading mt-0.5 text-xl">{formatWeeklyRange(weekly)}</div>
        </div>
        <div className="font-heading text-2xl text-gold">{hours}</div>
      </div>
    </section>
  );
}
