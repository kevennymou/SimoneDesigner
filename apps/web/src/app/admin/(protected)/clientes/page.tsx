"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { ClientSummary } from "@simone/shared";
import { formatPhoneBR } from "@/lib/phone";
import { ApiError, searchClients } from "@/lib/api";

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

export default function ClientsPage() {
  const [query, setQuery] = useState("");
  const [clients, setClients] = useState<ClientSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const handle = setTimeout(async () => {
      try {
        const data = await searchClients(query || undefined);
        if (!cancelled) setClients(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : "Não foi possível buscar agora.");
        }
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [query]);

  return (
    <div className="px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
      <h1 className="font-heading mb-4 text-2xl text-foreground">Clientes</h1>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar por nome ou WhatsApp"
        className="border-border mb-4 w-full max-w-lg rounded-xl border bg-background px-4 py-3.5 text-sm text-foreground"
      />

      {error && <p className="text-destructive text-sm">{error}</p>}
      {!error && clients === null && (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      )}
      {clients !== null && clients.length === 0 && (
        <p className="text-sm text-muted-foreground">Nenhuma cliente encontrada.</p>
      )}

      <div className="flex flex-col gap-2.5 lg:max-w-lg">
        {clients?.map((c) => (
          <Link
            key={c.id}
            href={`/admin/clientes/${c.id}`}
            className="border-border bg-background flex items-center gap-3.5 rounded-2xl border px-4 py-3.5"
          >
            <div className="bg-secondary text-primary font-heading flex h-11 w-11 items-center justify-center rounded-full text-lg">
              {initials(c.name)}
            </div>
            <div className="flex-1">
              <div className="text-sm text-foreground">{c.name}</div>
              <div className="text-xs text-muted-foreground">
                {formatPhoneBR(c.whatsapp)} · {c.visits} visitas
              </div>
            </div>
            <span className="text-lg text-border">›</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
