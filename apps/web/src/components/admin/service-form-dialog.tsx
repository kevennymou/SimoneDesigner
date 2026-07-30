"use client";

import { useEffect, useState } from "react";
import type { Service, UpsertServicePayload } from "@simone/shared";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ServiceFormDialogProps {
  open: boolean;
  service: Service | null;
  onClose: () => void;
  onSubmit: (payload: UpsertServicePayload) => Promise<void>;
}

export function ServiceFormDialog({ open, service, onClose, onSubmit }: ServiceFormDialogProps) {
  const [name, setName] = useState("");
  const [durationMin, setDurationMin] = useState("60");
  const [price, setPrice] = useState("");
  const [onRequest, setOnRequest] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setName(service?.name ?? "");
    setDurationMin(service ? String(service.durationMin) : "60");
    setPrice(service?.price != null ? String(service.price) : "");
    setOnRequest(service ? service.price === null : false);
    setError(null);
  }, [open, service]);

  async function handleSubmit() {
    const duration = Number(durationMin);
    if (!name.trim() || !duration || duration < 5) return;
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        name: name.trim(),
        durationMin: duration,
        price: onRequest ? null : Number(price) || 0,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível salvar.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{service ? "Editar procedimento" : "Novo procedimento"}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <div>
            <label className="text-[11px] tracking-wide text-muted-foreground uppercase">Nome</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Alongamento em Gel"
              className="border-border mt-1 w-full rounded-lg border bg-background px-3 py-2.5 text-sm"
            />
          </div>

          <div>
            <label className="text-[11px] tracking-wide text-muted-foreground uppercase">
              Duração (minutos)
            </label>
            <input
              type="number"
              min={5}
              step={5}
              value={durationMin}
              onChange={(e) => setDurationMin(e.target.value)}
              className="border-border mt-1 w-full rounded-lg border bg-background px-3 py-2.5 text-sm"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-[11px] tracking-wide text-muted-foreground uppercase">
              <input
                type="checkbox"
                checked={onRequest}
                onChange={(e) => setOnRequest(e.target.checked)}
              />
              Preço sob consulta
            </label>
            {!onRequest && (
              <input
                type="number"
                min={0}
                step={5}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Valor em R$"
                className="border-border mt-1.5 w-full rounded-lg border bg-background px-3 py-2.5 text-sm"
              />
            )}
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
          <Button onClick={handleSubmit} disabled={submitting || !name.trim()}>
            {submitting ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
