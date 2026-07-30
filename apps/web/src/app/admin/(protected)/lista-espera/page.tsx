"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { formatDateBR, type WaitlistResult } from "@simone/shared";
import { ApiError, getWaitlistAdmin, notifyWaitlist, removeWaitlistEntry } from "@/lib/api";
import { formatPhoneBR } from "@/lib/phone";

export default function WaitlistAdminPage() {
  const [entries, setEntries] = useState<WaitlistResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setEntries(await getWaitlistAdmin());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível carregar.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleNotify(entry: WaitlistResult) {
    const { whatsappUrl } = await notifyWaitlist(entry.id);
    window.open(whatsappUrl, "_blank");
    load();
  }

  async function handleRemove(entry: WaitlistResult) {
    if (!confirm(`Remover ${entry.client.name} da lista de espera?`)) return;
    await removeWaitlistEntry(entry.id);
    load();
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
        <h1 className="font-heading text-xl text-foreground">Lista de espera</h1>
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}
      {entries !== null && entries.length === 0 && (
        <p className="text-sm text-muted-foreground">Ninguém na lista de espera.</p>
      )}

      <div className="flex flex-col gap-3 lg:max-w-lg">
        {entries?.map((w) => (
          <div key={w.id} className="border-border bg-background rounded-2xl border px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-medium text-foreground">{w.client.name}</div>
                <div className="text-xs text-muted-foreground">
                  {w.service.name} · {formatDateBR(w.date)} {w.time}
                </div>
              </div>
              <div className="text-xs text-muted-foreground">{formatPhoneBR(w.client.whatsapp)}</div>
            </div>
            <div className="mt-3.5 flex gap-2">
              <button
                type="button"
                onClick={() => handleNotify(w)}
                className="bg-primary text-primary-foreground flex-1 rounded-lg py-2 text-xs"
              >
                Avisar vaga liberada
              </button>
              <button
                type="button"
                onClick={() => handleRemove(w)}
                className="border-border rounded-lg border px-3.5 py-2 text-xs text-foreground"
              >
                Remover
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
