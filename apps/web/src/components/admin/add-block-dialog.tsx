"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface AddBlockDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (date: string, label: string) => Promise<void>;
}

export function AddBlockDialog({ open, onClose, onConfirm }: AddBlockDialogProps) {
  const [date, setDate] = useState("");
  const [label, setLabel] = useState("Folga");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    if (!date || label.trim().length < 2) return;
    setSubmitting(true);
    setError(null);
    try {
      await onConfirm(date, label.trim());
      setDate("");
      setLabel("Folga");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível adicionar.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Feriado, folga ou bloqueio</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-[11px] tracking-wide text-muted-foreground uppercase">Data</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border-border mt-1 w-full rounded-lg border bg-background px-3 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="text-[11px] tracking-wide text-muted-foreground uppercase">
              Descrição
            </label>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Feriado, folga..."
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
          <Button onClick={handleConfirm} disabled={submitting || !date || label.trim().length < 2}>
            {submitting ? "Salvando..." : "Adicionar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
