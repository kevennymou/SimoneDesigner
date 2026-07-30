"use client";

import { buildWhatsAppUrl, formatDateLongPtBR, formatPriceBRL, type AppointmentResult } from "@simone/shared";

interface DoneScreenProps {
  appointment: AppointmentResult;
  whatsappNumber: string;
  onRestart: () => void;
}

export function DoneScreen({ appointment, whatsappNumber, onRestart }: DoneScreenProps) {
  const message =
    "Olá Simone! Quero confirmar meu agendamento.\n\n" +
    `Nome: ${appointment.client.name}\n` +
    `WhatsApp: ${appointment.client.whatsapp}\n` +
    `Procedimento: ${appointment.service.name}\n` +
    `Valor: ${formatPriceBRL(appointment.price)}\n` +
    `Data: ${formatDateLongPtBR(appointment.date)}\n` +
    `Horário: ${appointment.startTime}`;

  return (
    <div className="bg-primary text-primary-foreground flex min-h-svh flex-col items-center justify-center px-8 py-14 text-center">
      <div className="border-gold text-gold flex h-[78px] w-[78px] items-center justify-center rounded-full border-2 text-4xl">
        ✓
      </div>
      <h1 className="font-heading mt-6 text-3xl">Agendamento enviado!</h1>
      <p className="mt-3.5 max-w-xs text-sm leading-relaxed opacity-90">
        Toque abaixo para abrir a conversa no WhatsApp da Simone já com todos os seus dados
        preenchidos e confirmar.
      </p>

      <div className="mt-6 w-full max-w-xs rounded-2xl bg-white/10 px-5 py-4 text-left">
        <SummaryRow label="Nome" value={appointment.client.name} />
        <SummaryRow label="Procedimento" value={appointment.service.name} />
        <SummaryRow label="Data" value={formatDateLongPtBR(appointment.date)} />
        <SummaryRow label="Horário" value={appointment.startTime} />
        <SummaryRow label="Valor" value={formatPriceBRL(appointment.price)} highlight />
      </div>

      <a
        href={buildWhatsAppUrl(whatsappNumber, message)}
        target="_blank"
        rel="noreferrer"
        className="bg-whatsapp mt-5 block w-full max-w-xs rounded-xl py-4 text-sm font-semibold text-white"
      >
        Abrir no WhatsApp
      </a>
      <button type="button" onClick={onRestart} className="mt-4 text-sm tracking-wide opacity-80">
        Voltar ao início
      </button>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex justify-between py-1 text-sm">
      <span className="opacity-75">{label}</span>
      <span className={highlight ? "text-gold" : ""}>{value}</span>
    </div>
  );
}
