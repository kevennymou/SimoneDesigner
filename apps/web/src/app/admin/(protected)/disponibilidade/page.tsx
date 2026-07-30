"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDateBR, type BlockedDate, type WeeklyDay } from "@simone/shared";
import {
  ApiError,
  createBlock,
  getBlocks,
  getWeeklyAvailability,
  removeBlock,
  updateWeeklyAvailability,
} from "@/lib/api";
import { AddBlockDialog } from "@/components/admin/add-block-dialog";
import { Switch } from "@/components/ui/switch";

const WEEKDAY_NAMES = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];
const SLOT_OPTIONS = [15, 30, 45, 60];

export default function AvailabilityPage() {
  const [weekly, setWeekly] = useState<WeeklyDay[] | null>(null);
  const [blocks, setBlocks] = useState<BlockedDate[] | null>(null);
  const [slotMinutes, setSlotMinutes] = useState(30);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedJustNow, setSavedJustNow] = useState(false);
  const [addingBlock, setAddingBlock] = useState(false);

  useEffect(() => {
    (async () => {
      const [w, b] = await Promise.all([getWeeklyAvailability(), getBlocks()]);
      const sorted = [...w].sort((a, b2) => a.weekday - b2.weekday);
      setWeekly(sorted);
      setBlocks(b);
      const anyOpen = sorted.find((d) => d.isOpen);
      if (anyOpen) setSlotMinutes(anyOpen.slotMinutes);
    })();
  }, []);

  function updateDay(weekday: number, patch: Partial<WeeklyDay>) {
    setWeekly((prev) => prev?.map((d) => (d.weekday === weekday ? { ...d, ...patch } : d)) ?? null);
    setSavedJustNow(false);
  }

  async function handleSave() {
    if (!weekly) return;
    setSaving(true);
    setError(null);
    try {
      const payload = weekly.map((d) => ({ ...d, slotMinutes }));
      const updated = await updateWeeklyAvailability(payload);
      setWeekly([...updated].sort((a, b) => a.weekday - b.weekday));
      setSavedJustNow(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível salvar.");
    } finally {
      setSaving(false);
    }
  }

  async function handleAddBlock(date: string, label: string) {
    const block = await createBlock(date, label);
    setBlocks((prev) => [...(prev ?? []), block].sort((a, b) => a.date.localeCompare(b.date)));
    setAddingBlock(false);
  }

  async function handleRemoveBlock(id: string) {
    await removeBlock(id);
    setBlocks((prev) => prev?.filter((b) => b.id !== id) ?? null);
  }

  if (!weekly || !blocks) {
    return (
      <div className="px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
        <p className="text-sm text-muted-foreground">Carregando...</p>
      </div>
    );
  }

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

      <div className="mb-2.5 text-[11px] tracking-wide text-muted-foreground uppercase">
        Dias de atendimento
      </div>
      <div className="flex flex-col gap-2 lg:max-w-lg">
        {weekly.map((d) => (
          <div key={d.weekday} className="border-border bg-background rounded-2xl border px-4 py-3.5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">{WEEKDAY_NAMES[d.weekday]}</span>
              <Switch
                checked={d.isOpen}
                onCheckedChange={(checked: boolean) =>
                  updateDay(d.weekday, {
                    isOpen: checked,
                    startTime: checked ? (d.startTime ?? "09:00") : null,
                    endTime: checked ? (d.endTime ?? "18:00") : null,
                    breakStart: checked ? d.breakStart : null,
                    breakEnd: checked ? d.breakEnd : null,
                  })
                }
              />
            </div>
            {d.isOpen && (
              <div className="mt-3 grid grid-cols-2 gap-2.5">
                <TimeField
                  label="Abre"
                  value={d.startTime ?? ""}
                  onChange={(v) => updateDay(d.weekday, { startTime: v })}
                />
                <TimeField
                  label="Fecha"
                  value={d.endTime ?? ""}
                  onChange={(v) => updateDay(d.weekday, { endTime: v })}
                />
                <TimeField
                  label="Intervalo início"
                  value={d.breakStart ?? ""}
                  onChange={(v) => updateDay(d.weekday, { breakStart: v || null })}
                  optional
                />
                <TimeField
                  label="Intervalo fim"
                  value={d.breakEnd ?? ""}
                  onChange={(v) => updateDay(d.weekday, { breakEnd: v || null })}
                  optional
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-5 lg:max-w-lg">
        <label className="text-[11px] tracking-wide text-muted-foreground uppercase">
          Duração de cada horário
        </label>
        <select
          value={slotMinutes}
          onChange={(e) => {
            setSlotMinutes(Number(e.target.value));
            setSavedJustNow(false);
          }}
          className="border-border mt-1.5 w-full rounded-xl border bg-background px-4 py-3 text-sm text-foreground"
        >
          {SLOT_OPTIONS.map((m) => (
            <option key={m} value={m}>
              {m} minutos
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p className="text-destructive mt-4 text-sm" role="alert">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="bg-primary text-primary-foreground mt-5 w-full max-w-lg rounded-xl py-3.5 text-sm font-medium disabled:opacity-60"
      >
        {saving ? "Salvando..." : savedJustNow ? "Salvo ✓" : "Salvar horários"}
      </button>

      <div className="mt-8 mb-2.5 text-[11px] tracking-wide text-muted-foreground uppercase">
        Feriados e bloqueios
      </div>
      <div className="flex flex-col gap-2 lg:max-w-lg">
        {blocks.map((b) => (
          <div
            key={b.id}
            className="bg-secondary flex items-center justify-between rounded-xl px-4 py-3"
          >
            <span className="text-sm text-foreground">
              {b.label} · {formatDateBR(b.date)}
            </span>
            <button
              type="button"
              onClick={() => handleRemoveBlock(b.id)}
              className="text-destructive text-xs"
            >
              remover
            </button>
          </div>
        ))}
        {blocks.length === 0 && (
          <p className="text-sm text-muted-foreground">Nenhum bloqueio cadastrado.</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => setAddingBlock(true)}
        className="border-border mt-3 w-full max-w-lg rounded-xl border py-3 text-sm text-foreground"
      >
        + Feriado / folga / bloqueio
      </button>

      <AddBlockDialog
        open={addingBlock}
        onClose={() => setAddingBlock(false)}
        onConfirm={handleAddBlock}
      />
    </div>
  );
}

function TimeField({
  label,
  value,
  onChange,
  optional,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  optional?: boolean;
}) {
  return (
    <div>
      <label className="text-[10px] text-muted-foreground">
        {label}
        {optional ? " (opcional)" : ""}
      </label>
      <input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border-border mt-0.5 w-full rounded-lg border bg-background px-2.5 py-2 text-xs"
      />
    </div>
  );
}
