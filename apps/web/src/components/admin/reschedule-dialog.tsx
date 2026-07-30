"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { AppointmentResult } from "@simone/shared";

interface RescheduleDialogProps {
  appointment: AppointmentResult | null;
  onClose: () => void;
  onConfirm: (date: string, startTime: string) => Promise<void>;
}

export function RescheduleDialog({ appointment, onClose, onConfirm }: RescheduleDialogProps) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!appointment) return null;

  async function handleConfirm() {
    if (!date || !time) return;
    setSubmitting(true);
    setError(null);
    try {
      await onConfirm(date, time);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível reagendar.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reagendar {appointment.client.name}</DialogTitle>
          <DialogDescription>
            Horário atual: {appointment.date.split("-").reverse().join("/")} às{" "}
            {appointment.startTime}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <div>
            <label className="text-[11px] tracking-wide text-muted-foreground uppercase">
              Nova data
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border-border mt-1 w-full rounded-lg border bg-background px-3 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="text-[11px] tracking-wide text-muted-foreground uppercase">
              Novo horário
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="border-border mt-1 w-full rounded-lg border bg-background px-3 py-2.5 text-sm"
            />
          </div>
          {error && (
            <p className="text-destructive text-xs" role="alert">
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={submitting || !date || !time}>
            {submitting ? "Salvando..." : "Confirmar novo horário"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
