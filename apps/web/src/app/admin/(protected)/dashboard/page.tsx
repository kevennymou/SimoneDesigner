import { formatPriceBRL } from "@simone/shared";
import { getDashboardSummary } from "@/lib/api";
import { getForwardedCookie } from "@/lib/auth";
import { capitalizeFirst } from "@/lib/schedule";
import { StatCard } from "@/components/admin/stat-card";

export default async function DashboardPage() {
  const cookie = await getForwardedCookie();
  const summary = await getDashboardSummary(cookie);

  const todayLabel = capitalizeFirst(
    new Intl.DateTimeFormat("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      timeZone: "America/Fortaleza",
    }).format(new Date()),
  );

  return (
    <div className="px-5 py-6 sm:px-8 lg:px-10 lg:py-8">
      <div className="text-xs text-muted-foreground">{todayLabel}</div>
      <h1 className="font-heading text-2xl text-foreground">Bom dia, Simone</h1>

      <div className="mt-5 grid grid-cols-2 gap-2.5 lg:max-w-2xl lg:grid-cols-4">
        <StatCard label="Hoje" value={String(summary.today.count)} sub="agendamentos" highlight />
        <StatCard
          label="Faturamento hoje"
          value={formatPriceBRL(summary.today.revenue)}
          sub={`ticket médio ${formatPriceBRL(summary.today.avgTicket)}`}
        />
        <StatCard
          label="Semana"
          value={String(summary.week.count)}
          sub={formatPriceBRL(summary.week.revenue)}
        />
        <StatCard
          label="Mês"
          value={String(summary.month.count)}
          sub={formatPriceBRL(summary.month.revenue)}
        />
      </div>

      <div className="border-border bg-background mt-4 flex gap-4 rounded-2xl border px-4 py-4 lg:max-w-2xl">
        <div className="flex-1">
          <div className="font-heading text-primary text-2xl">{summary.newClients}</div>
          <div className="text-[11px] text-muted-foreground">novas clientes</div>
        </div>
        <div className="bg-border w-px" />
        <div className="flex-1">
          <div className="font-heading text-primary text-2xl">{summary.recurringClients}</div>
          <div className="text-[11px] text-muted-foreground">recorrentes</div>
        </div>
      </div>

      <div className="mt-7 flex items-center justify-between lg:max-w-2xl">
        <h2 className="font-heading text-xl text-foreground">Agenda de hoje</h2>
      </div>
      {summary.todayAppointments.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">Nenhum agendamento pra hoje.</p>
      ) : (
        <div className="divide-border mt-1 divide-y lg:max-w-2xl">
          {summary.todayAppointments.map((a) => (
            <div key={a.id} className="flex items-center gap-3.5 py-3.5">
              <div className="font-heading text-primary w-12 text-lg">{a.time}</div>
              <div className="flex-1">
                <div className="text-sm text-foreground">{a.client}</div>
                <div className="text-xs text-muted-foreground">{a.service}</div>
              </div>
              <div className="text-sm text-muted-foreground">{formatPriceBRL(a.price)}</div>
            </div>
          ))}
        </div>
      )}

      {summary.topProcedures.length > 0 && (
        <div className="mt-7 lg:max-w-2xl">
          <h2 className="font-heading mb-2.5 text-xl text-foreground">Procedimentos mais feitos</h2>
          {summary.topProcedures.map((p) => (
            <div key={p.name} className="mb-3">
              <div className="mb-1 flex justify-between text-sm text-foreground">
                <span>{p.name}</span>
                <span className="text-muted-foreground">{p.count}</span>
              </div>
              <div className="bg-secondary h-2 overflow-hidden rounded-full">
                <div className="bg-primary h-full rounded-full" style={{ width: `${p.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
