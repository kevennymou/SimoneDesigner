"use client";

import { formatPriceBRL, type Service } from "@simone/shared";

interface ServiceStepProps {
  services: Service[];
  selectedServiceId: string | null;
  onSelect: (serviceId: string) => void;
}

export function ServiceStep({ services, selectedServiceId, onSelect }: ServiceStepProps) {
  return (
    <div className="flex flex-col gap-2.5">
      {services.map((s) => {
        const selected = selectedServiceId === s.id;
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => onSelect(s.id)}
            className={`flex items-center justify-between rounded-2xl border px-5 py-4 text-left ${
              selected ? "border-primary bg-secondary" : "border-border bg-background"
            }`}
          >
            <div>
              <div className="text-sm font-medium text-foreground">{s.name}</div>
              <div className="mt-0.5 text-[11px] text-muted-foreground">
                {formatDuration(s.durationMin)}
              </div>
            </div>
            <span className="font-heading text-lg text-primary">{formatPriceBRL(s.price)}</span>
          </button>
        );
      })}
    </div>
  );
}

function formatDuration(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `± ${m}min`;
  if (m === 0) return `± ${h}h`;
  return `± ${h}h${m}`;
}
