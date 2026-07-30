import type { AppointmentStatus } from "@simone/shared";

const STATUS_MAP: Record<AppointmentStatus, { label: string; className: string }> = {
  PENDING: { label: "a confirmar", className: "bg-secondary text-muted-foreground" },
  CONFIRMED: { label: "confirmado", className: "bg-success text-success-foreground" },
  COMPLETED: { label: "concluído", className: "bg-success text-success-foreground" },
  CANCELLED: { label: "cancelado", className: "bg-secondary text-muted-foreground line-through" },
  NO_SHOW: { label: "faltou", className: "bg-destructive/15 text-destructive" },
};

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  const { label, className } = STATUS_MAP[status];
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[10px] tracking-wide uppercase ${className}`}
    >
      {label}
    </span>
  );
}
