"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { dateOnlyToISO, formatPriceBRL, todayISOInBusinessTZ, type ReportResult } from "@simone/shared";
import { ApiError, getReport, reportCsvUrl } from "@/lib/api";

type Period = "dia" | "semana" | "mes" | "ano" | "personalizado";

const PERIODS: { key: Period; label: string }[] = [
  { key: "dia", label: "Dia" },
  { key: "semana", label: "Semana" },
  { key: "mes", label: "Mês" },
  { key: "ano", label: "Ano" },
  { key: "personalizado", label: "Personalizado" },
];
const PERIOD_LABEL: Record<Period, string> = {
  dia: "Dia",
  semana: "Semana",
  mes: "Mês",
  ano: "Ano",
  personalizado: "Período",
};
const MONTHS_SHORT = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

function resolvePeriod(
  period: Period,
  customFrom: string,
  customTo: string,
): { from: string; to: string } {
  const today = todayISOInBusinessTZ();
  const [y, m, d] = today.split("-").map(Number);
  const todayDate = new Date(Date.UTC(y, m - 1, d));

  if (period === "dia") return { from: today, to: today };
  if (period === "semana") {
    const dow = todayDate.getUTCDay();
    const start = new Date(todayDate);
    start.setUTCDate(todayDate.getUTCDate() - dow);
    const end = new Date(todayDate);
    end.setUTCDate(todayDate.getUTCDate() + (6 - dow));
    return { from: dateOnlyToISO(start), to: dateOnlyToISO(end) };
  }
  if (period === "mes") {
    const start = new Date(Date.UTC(y, m - 1, 1));
    const end = new Date(Date.UTC(y, m, 0));
    return { from: dateOnlyToISO(start), to: dateOnlyToISO(end) };
  }
  if (period === "ano") return { from: `${y}-01-01`, to: `${y}-12-31` };
  return { from: customFrom || today, to: customTo || today };
}

function formatSeriesLabel(label: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(label)) {
    const [, m, d] = label.split("-");
    return `${d}/${m}`;
  }
  if (/^\d{4}-\d{2}$/.test(label)) {
    const [y, m] = label.split("-");
    return `${MONTHS_SHORT[Number(m) - 1]}/${y.slice(2)}`;
  }
  return label;
}

export default function ReportsPage() {
  const [period, setPeriod] = useState<Period>("mes");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [report, setReport] = useState<ReportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { from, to } = resolvePeriod(period, customFrom, customTo);

  useEffect(() => {
    if (period === "personalizado" && (!customFrom || !customTo)) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await getReport(from, to);
        if (!cancelled) setReport(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiError ? err.message : "Não foi possível carregar.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [period, customFrom, customTo, from, to]);

  const chartData = report?.series.map((s) => ({
    label: formatSeriesLabel(s.label),
    revenue: s.revenue,
  }));

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
        <h1 className="font-heading text-xl text-foreground">Relatórios</h1>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {PERIODS.map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => setPeriod(p.key)}
            className={`rounded-full px-3.5 py-1.5 text-xs ${
              period === p.key
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {period === "personalizado" && (
        <div className="mb-4 flex gap-2 lg:max-w-md">
          <input
            type="date"
            value={customFrom}
            onChange={(e) => setCustomFrom(e.target.value)}
            className="border-border w-full rounded-lg border bg-background px-3 py-2 text-sm"
          />
          <input
            type="date"
            value={customTo}
            onChange={(e) => setCustomTo(e.target.value)}
            className="border-border w-full rounded-lg border bg-background px-3 py-2 text-sm"
          />
        </div>
      )}

      {error && <p className="text-destructive text-sm">{error}</p>}
      {!report && !error && <p className="text-sm text-muted-foreground">Carregando...</p>}

      {report && (
        <>
          <div className="bg-primary text-primary-foreground rounded-2xl px-5 py-5 lg:max-w-2xl">
            <div className="text-xs tracking-wide opacity-85">
              Faturamento — {PERIOD_LABEL[period]}
            </div>
            <div className="font-heading mt-1 text-4xl">{formatPriceBRL(report.revenue)}</div>
            <div className="mt-1 text-xs opacity-85">
              {report.count} atendimentos · ticket médio {formatPriceBRL(report.avgTicket)}
            </div>
          </div>

          {chartData && chartData.length > 1 && (
            <div className="mt-5 h-56 lg:max-w-2xl">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="var(--border)" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                    axisLine={{ stroke: "var(--border)" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                    width={48}
                  />
                  <Tooltip
                    cursor={{ fill: "var(--secondary)" }}
                    contentStyle={{
                      background: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    formatter={(value) => [formatPriceBRL(Number(value)), "Faturamento"]}
                  />
                  <Bar dataKey="revenue" fill="var(--primary)" radius={[4, 4, 0, 0]} maxBarSize={36} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {report.topProcedures.length > 0 && (
            <div className="mt-6 lg:max-w-2xl">
              <h2 className="font-heading mb-2.5 text-lg text-foreground">
                Procedimentos mais realizados
              </h2>
              {report.topProcedures.map((p) => (
                <div key={p.name} className="mb-3">
                  <div className="mb-1 flex justify-between text-sm text-foreground">
                    <span>{p.name}</span>
                    <span className="text-muted-foreground">{p.count}</span>
                  </div>
                  <div className="bg-secondary h-2 overflow-hidden rounded-full">
                    <div className="bg-gold-muted h-full rounded-full" style={{ width: `${p.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 grid grid-cols-2 gap-2.5 lg:max-w-2xl">
            <MiniStat value={String(report.clientsServed)} label="clientes atendidas" />
            <MiniStat value={String(report.noShows)} label="faltas no período" />
            <MiniStat value={String(report.cancellations)} label="cancelamentos" />
            <MiniStat value={report.busiestHour ?? "—"} label="horário mais buscado" />
          </div>

          <a
            href={reportCsvUrl(from, to)}
            target="_blank"
            rel="noreferrer"
            className="border-border mt-6 block w-full max-w-2xl rounded-xl border py-3 text-center text-sm text-foreground"
          >
            Exportar CSV
          </a>
        </>
      )}
    </div>
  );
}

function MiniStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-secondary rounded-xl px-3 py-3.5 text-center">
      <div className="font-heading text-xl text-foreground">{value}</div>
      <div className="mt-0.5 text-[10px] text-muted-foreground">{label}</div>
    </div>
  );
}
