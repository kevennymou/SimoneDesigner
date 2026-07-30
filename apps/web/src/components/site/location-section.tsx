import type { Settings } from "@simone/shared";
import { PlaceholderPhoto } from "./placeholder-photo";

interface LocationSectionProps {
  settings: Settings;
}

export function LocationSection({ settings }: LocationSectionProps) {
  const mapsUrl =
    settings.mapsUrl ??
    (settings.address
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.address)}`
      : null);

  if (!mapsUrl) return null;

  return (
    <section className="mx-auto mt-10 max-w-2xl px-6 sm:px-10">
      <a href={mapsUrl} target="_blank" rel="noreferrer" className="block">
        <PlaceholderPhoto label="mapa · localização" className="aspect-[3/1.2]" />
        <div className="border-primary text-primary mt-3 border py-4 text-center text-xs tracking-[0.2em] uppercase">
          Ver no Google Maps
        </div>
      </a>
    </section>
  );
}
