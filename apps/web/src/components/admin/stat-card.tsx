interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
}

export function StatCard({ label, value, sub, highlight }: StatCardProps) {
  return (
    <div
      className={
        highlight
          ? "bg-primary text-primary-foreground rounded-2xl px-4 py-4"
          : "bg-secondary rounded-2xl px-4 py-4"
      }
    >
      <div className={`text-[11px] tracking-wide ${highlight ? "opacity-85" : "text-muted-foreground"}`}>
        {label}
      </div>
      <div className="font-heading mt-1 text-3xl leading-tight">{value}</div>
      {sub && (
        <div className={`mt-0.5 text-[11px] ${highlight ? "opacity-80" : "text-muted-foreground"}`}>
          {sub}
        </div>
      )}
    </div>
  );
}
