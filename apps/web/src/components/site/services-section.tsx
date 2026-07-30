import { formatPriceBRL, type Service } from "@simone/shared";

interface ServicesSectionProps {
  services: Service[];
}

export function ServicesSection({ services }: ServicesSectionProps) {
  const active = services.filter((s) => s.active);
  if (active.length === 0) return null;

  return (
    <section className="mx-auto max-w-2xl px-6 pt-10 sm:px-10">
      <h2 className="text-[11px] tracking-[0.25em] text-gold-muted uppercase">Serviços</h2>
      <ul className="divide-border mt-4 divide-y">
        {active.map((s) => (
          <li key={s.id} className="flex items-baseline justify-between gap-4 py-4">
            <span className="font-heading text-xl text-foreground sm:text-2xl">{s.name}</span>
            <span
              className={
                s.price === null
                  ? "shrink-0 text-xs text-muted-foreground"
                  : "font-heading shrink-0 text-lg text-primary sm:text-xl"
              }
            >
              {formatPriceBRL(s.price)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
