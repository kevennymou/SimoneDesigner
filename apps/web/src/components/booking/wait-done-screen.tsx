"use client";

import { formatDateLongPtBR, type WaitlistResult } from "@simone/shared";

interface WaitDoneScreenProps {
  entry: WaitlistResult;
  onRestart: () => void;
}

export function WaitDoneScreen({ entry, onRestart }: WaitDoneScreenProps) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-8 py-14 text-center">
      <div className="border-gold-muted text-gold-muted flex h-[78px] w-[78px] items-center justify-center rounded-full border-2 text-4xl">
        ♥
      </div>
      <h1 className="font-heading mt-6 text-3xl text-foreground">Você está na lista!</h1>
      <p className="mt-3.5 max-w-xs text-sm leading-relaxed text-muted-foreground">
        Assim que o horário <b>{entry.time}</b> de <b>{formatDateLongPtBR(entry.date)}</b> for
        liberado, você recebe um aviso no WhatsApp.
      </p>
      <button
        type="button"
        onClick={onRestart}
        className="bg-primary text-primary-foreground mt-7 rounded-xl px-8 py-4 text-sm tracking-wide"
      >
        Voltar ao início
      </button>
    </div>
  );
}
