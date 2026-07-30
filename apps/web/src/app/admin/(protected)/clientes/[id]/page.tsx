import Link from "next/link";
import { formatDateBR, formatPriceBRL } from "@simone/shared";
import { getClientDetail } from "@/lib/api";
import { getForwardedCookie } from "@/lib/auth";
import { formatPhoneBR } from "@/lib/phone";
import { StatusBadge } from "@/components/admin/status-badge";

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cookie = await getForwardedCookie();
  const client = await getClientDetail(id, cookie);

  return (
    <div className="px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
      <div className="mb-4.5 flex items-center gap-3">
        <Link
          href="/admin/clientes"
          aria-label="Voltar"
          className="border-border text-primary flex h-9 w-9 items-center justify-center rounded-full border text-lg"
        >
          ‹
        </Link>
        <h1 className="font-heading text-xl text-foreground">Histórico</h1>
      </div>

      <div className="mb-4.5 flex items-center gap-3.5">
        <div className="bg-primary text-primary-foreground font-heading flex h-14 w-14 items-center justify-center rounded-full text-xl">
          {initials(client.name)}
        </div>
        <div>
          <div className="text-lg font-medium text-foreground">{client.name}</div>
          <div className="text-sm text-muted-foreground">{formatPhoneBR(client.whatsapp)}</div>
          {client.email && <div className="text-xs text-muted-foreground">{client.email}</div>}
        </div>
      </div>

      <div className="mb-5 grid grid-cols-4 gap-2 lg:max-w-lg">
        <MiniStat value={String(client.visits)} label="visitas" />
        <MiniStat value={formatPriceBRL(client.total)} label="total gasto" />
        <MiniStat value={String(client.noShows)} label="faltas" />
        <MiniStat value={String(client.cancellations)} label="cancelou" />
      </div>

      <h2 className="font-heading mb-2.5 text-lg text-foreground">Atendimentos</h2>
      {client.history.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum atendimento ainda.</p>
      ) : (
        <div className="divide-border divide-y lg:max-w-lg">
          {client.history.map((h) => (
            <div key={h.id} className="flex items-center justify-between gap-3 py-3">
              <div>
                <div className="text-sm text-foreground">{h.service}</div>
                <div className="text-xs text-muted-foreground">
                  {formatDateBR(h.date)} · {h.startTime}
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-primary text-sm">{formatPriceBRL(h.price)}</span>
                <StatusBadge status={h.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MiniStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-secondary rounded-xl px-2 py-3 text-center">
      <div className="font-heading text-primary text-lg leading-tight">{value}</div>
      <div className="text-muted-foreground mt-0.5 text-[9px] tracking-wide">{label}</div>
    </div>
  );
}
