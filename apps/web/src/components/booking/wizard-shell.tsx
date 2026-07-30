"use client";

import type { ReactNode } from "react";

interface WizardShellProps {
  title: string;
  stepIndex: number;
  stepCount: number;
  onBack: () => void;
  primaryLabel: string;
  primaryDisabled: boolean;
  submitting: boolean;
  onPrimary: () => void;
  error: string | null;
  children: ReactNode;
}

export function WizardShell({
  title,
  stepIndex,
  stepCount,
  onBack,
  primaryLabel,
  primaryDisabled,
  submitting,
  onPrimary,
  error,
  children,
}: WizardShellProps) {
  return (
    <div className="mx-auto flex min-h-svh max-w-lg flex-col">
      <div className="flex items-center gap-4 px-5 py-4 sm:px-8">
        <button
          type="button"
          onClick={onBack}
          aria-label="Voltar"
          className="border-border text-primary flex h-9 w-9 items-center justify-center rounded-full border text-lg"
        >
          ‹
        </button>
        <h1 className="font-heading text-xl text-foreground sm:text-2xl">{title}</h1>
      </div>

      <div className="flex gap-1.5 px-5 pb-3 sm:px-8">
        {Array.from({ length: stepCount }).map((_, i) => (
          <div
            key={i}
            className={`h-[3px] flex-1 rounded-full ${i <= stepIndex ? "bg-primary" : "bg-border"}`}
          />
        ))}
      </div>

      <div className="flex-1 px-5 pb-6 sm:px-8">{children}</div>

      <div className="px-5 pt-2 pb-8 sm:px-8">
        {error && (
          <p className="text-destructive mb-3 text-sm" role="alert">
            {error}
          </p>
        )}
        <button
          type="button"
          onClick={onPrimary}
          disabled={primaryDisabled}
          className="bg-primary text-primary-foreground disabled:bg-muted disabled:text-muted-foreground w-full py-4 text-sm font-medium tracking-wide disabled:cursor-not-allowed"
        >
          {submitting ? "Enviando..." : primaryLabel}
        </button>
      </div>
    </div>
  );
}
