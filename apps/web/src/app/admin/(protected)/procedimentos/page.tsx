"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatPriceBRL, type Service, type UpsertServicePayload } from "@simone/shared";
import {
  ApiError,
  createService,
  deleteService,
  getServicesAdmin,
  updateService,
} from "@/lib/api";
import { ServiceFormDialog } from "@/components/admin/service-form-dialog";

export default function ProceduresPage() {
  const [services, setServices] = useState<Service[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Service | null | undefined>(undefined);

  async function load() {
    try {
      setServices(await getServicesAdmin());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível carregar.");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(payload: UpsertServicePayload) {
    if (editing) {
      await updateService(editing.id, payload);
    } else {
      await createService({ ...payload, order: services?.length ?? 0 });
    }
    setEditing(undefined);
    load();
  }

  async function handleToggleActive(s: Service) {
    await updateService(s.id, { active: !s.active });
    load();
  }

  async function handleDelete(s: Service) {
    if (!confirm(`Remover "${s.name}"?`)) return;
    try {
      await deleteService(s.id);
      load();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Não foi possível remover.");
    }
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
        <h1 className="font-heading text-xl text-foreground">Procedimentos</h1>
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}

      <div className="flex flex-col gap-2.5 lg:max-w-lg">
        {services?.map((s) => (
          <div
            key={s.id}
            className={`border-border bg-background flex items-center justify-between gap-3 rounded-2xl border px-4 py-3.5 ${
              s.active ? "" : "opacity-50"
            }`}
          >
            <div>
              <div className="text-sm font-medium text-foreground">{s.name}</div>
              <div className="text-xs text-muted-foreground">
                {s.durationMin} min · {formatPriceBRL(s.price)}
                {!s.active && " · inativo"}
              </div>
            </div>
            <div className="flex shrink-0 gap-1.5">
              <button
                type="button"
                onClick={() => setEditing(s)}
                className="border-border rounded-lg border px-2.5 py-1.5 text-xs text-foreground"
              >
                Editar
              </button>
              <button
                type="button"
                onClick={() => handleToggleActive(s)}
                className="border-border rounded-lg border px-2.5 py-1.5 text-xs text-foreground"
              >
                {s.active ? "Desativar" : "Ativar"}
              </button>
              <button
                type="button"
                onClick={() => handleDelete(s)}
                className="border-destructive/40 text-destructive rounded-lg border px-2.5 py-1.5 text-xs"
              >
                Remover
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setEditing(null)}
        className="bg-primary text-primary-foreground mt-3 w-full max-w-lg rounded-xl py-3.5 text-sm tracking-wide"
      >
        + Novo procedimento
      </button>

      <ServiceFormDialog
        open={editing !== undefined}
        service={editing ?? null}
        onClose={() => setEditing(undefined)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
