"use client";

import { useCallback, useEffect, useState } from "react";
import {
  formatDateLongPtBR,
  formatPriceBRL,
  todayISOInBusinessTZ,
  type AppointmentResult,
} from "@simone/shared";
import { ApiError, getAppointments, updateAppointment } from "@/lib/api";
import { capitalizeFirst } from "@/lib/schedule";
import { RescheduleDialog } from "@/components/admin/reschedule-dialog";
import { StatusBadge } from "@/components/admin/status-badge";

function addDays(iso: string, delta: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + delta);
  return dt.toISOString().slice(0, 10);
}

export default function AgendaPage() {
  const today = todayISOInBusinessTZ();
  const [date, setDate] = useState(today);
  const [appointments, setAppointments] = useState<AppointmentResult[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [rescheduling, setRescheduling] = useState<AppointmentResult | null>(null);

  const load = useCallback(async () => {
    setAppointments(null);
    setLoadError(null);
    try {
      setAppointments(await getAppointments({ date }));
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : "Não foi possível carregar a agenda.");
    }
  }, [date]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleComplete(a: AppointmentResult) {
    setActionError(null);
    try {
      await updateAppointment(a.id, { status: "COMPLETED" });
      load();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Não foi possível concluir.");
    }
  }

  async function handleCancel(a: AppointmentResult) {
    if (!confirm(`Cancelar o horário de ${a.client.name}?`)) return;
    setActionError(null);
    try {
      await updateAppointment(a.id, { status: "CANCELLED" });
      load();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Não foi possível cancelar.");
    }
  }

  async function handleReschedule(newDate: string, newTime: string) {
    if (!rescheduling) return;
    await updateAppointment(rescheduling.id, { date: newDate, startTime: newTime });
    setRescheduling(null);
    load();
  }

  return (
    <div className="px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
      <h1 className="font-heading text-2xl text-foreground">Agenda</h1>

      <div className="mt-3 mb-5 flex items-center gap-3">
        <button
          type="button"
          onClick={() => setDate((d) => addDays(d, -1))}
          aria-label="Dia anterior"
          className="bg-secondary text-primary flex h-8 w-8 items-center justify-center rounded-full"
        >
          ‹
        </button>
        <span className="text-sm text-foreground">{capitalizeFirst(formatDateLongPtBR(date))}</span>
        <button
          type="button"
          onClick={() => setDate((d) => addDays(d, 1))}
          aria-label="Próximo dia"
          className="bg-secondary text-primary flex h-8 w-8 items-center justify-center rounded-full"
        >
          ›
        </button>
        {date !== today && (
          <button
            type="button"
            onClick={() => setDate(today)}
            className="text-primary text-xs underline"
          >
            hoje
          </button>
        )}
      </div>

      {actionError && (
        <p className="text-destructive mb-4 text-sm" role="alert">
          {actionError}
        </p>
      )}
      {loadError && <p className="text-destructive text-sm">{loadError}</p>}
      {!loadError && appointments === null && (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      )}
      {appointments !== null && appointments.length === 0 && (
        <p className="text-sm text-muted-foreground">Nenhum agendamento para este dia.</p>
      )}

      <div className="flex flex-col gap-3 lg:max-w-2xl">
        {appointments?.map((a) => (
          <div key={a.id} className="border-border bg-background rounded-2xl border px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="font-heading text-primary text-xl">{a.startTime}</span>
                <div>
                  <div className="text-sm font-medium text-foreground">{a.client.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {a.service.name} · {formatPriceBRL(a.price)}
                  </div>
                </div>
              </div>
              <StatusBadge status={a.status} />
            </div>
            <div className="mt-3.5 flex flex-wrap gap-2">
              <a
                href={`https://wa.me/${a.client.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="border-border flex-1 rounded-lg border px-3 py-2 text-center text-xs text-foreground"
              >
                WhatsApp
              </a>
              {(a.status === "PENDING" || a.status === "CONFIRMED") && (
                <>
                  <button
                    type="button"
                    onClick={() => handleComplete(a)}
                    className="bg-success text-success-foreground flex-1 rounded-lg px-3 py-2 text-xs"
                  >
                    Concluir
                  </button>
                  <button
                    type="button"
                    onClick={() => setRescheduling(a)}
                    className="border-border flex-1 rounded-lg border px-3 py-2 text-xs text-foreground"
                  >
                    Reagendar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCancel(a)}
                    className="border-destructive/40 text-destructive flex-1 rounded-lg border px-3 py-2 text-xs"
                  >
                    Cancelar
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <RescheduleDialog
        appointment={rescheduling}
        onClose={() => setRescheduling(null)}
        onConfirm={handleReschedule}
      />
    </div>
  );
}
