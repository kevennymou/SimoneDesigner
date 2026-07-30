"use client";

import { formatPriceBRL, type Service } from "@simone/shared";

interface DetailsStepProps {
  mode: "booking" | "waitlist";
  dateLabel: string;
  time: string;
  service: Service | null;
  name: string;
  whats: string;
  email: string;
  onChangeName: (v: string) => void;
  onChangeWhats: (v: string) => void;
  onChangeEmail: (v: string) => void;
}

export function DetailsStep({
  mode,
  dateLabel,
  time,
  service,
  name,
  whats,
  email,
  onChangeName,
  onChangeWhats,
  onChangeEmail,
}: DetailsStepProps) {
  return (
    <div>
      {mode === "waitlist" && (
        <div className="bg-secondary mb-5 rounded-2xl px-5 py-4 text-sm leading-relaxed text-foreground">
          O horário <b>{time}</b> de <b>{dateLabel}</b> já está ocupado. Entre na lista de espera
          e avisamos assim que ele for liberado.
        </div>
      )}

      <div className="bg-secondary mb-6 rounded-2xl px-5 py-4">
        <SummaryRow label="Procedimento" value={service?.name ?? ""} />
        <SummaryRow label="Data" value={dateLabel} />
        <SummaryRow label="Horário" value={time} />
        {mode === "booking" && (
          <div className="border-border mt-1.5 flex items-center justify-between border-t pt-2.5">
            <span className="text-sm font-medium text-foreground">Valor</span>
            <span className="font-heading text-xl text-primary">
              {formatPriceBRL(service?.price ?? null)}
            </span>
          </div>
        )}
      </div>

      <label className="text-[11px] tracking-[0.15em] text-muted-foreground uppercase">
        Nome completo
      </label>
      <input
        value={name}
        onChange={(e) => onChangeName(e.target.value)}
        placeholder="Seu nome"
        className="border-border mt-1.5 mb-4 w-full rounded-xl border bg-background px-4 py-3.5 text-sm text-foreground"
      />

      <label className="text-[11px] tracking-[0.15em] text-muted-foreground uppercase">
        WhatsApp
      </label>
      <input
        value={whats}
        onChange={(e) => onChangeWhats(e.target.value)}
        placeholder="(83) 90000-0000"
        inputMode="tel"
        className="border-border mt-1.5 mb-4 w-full rounded-xl border bg-background px-4 py-3.5 text-sm text-foreground"
      />

      {mode === "booking" && (
        <>
          <label className="text-[11px] tracking-[0.15em] text-muted-foreground uppercase">
            E-mail (opcional, pra receber lembretes)
          </label>
          <input
            value={email}
            onChange={(e) => onChangeEmail(e.target.value)}
            placeholder="seu@email.com"
            type="email"
            className="border-border mt-1.5 w-full rounded-xl border bg-background px-4 py-3.5 text-sm text-foreground"
          />
        </>
      )}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xs text-foreground">{value}</span>
    </div>
  );
}
