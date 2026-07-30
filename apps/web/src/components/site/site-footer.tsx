import type { Settings } from "@simone/shared";
import { formatPhoneBR } from "@/lib/phone";

interface SiteFooterProps {
  settings: Settings;
}

export function SiteFooter({ settings }: SiteFooterProps) {
  return (
    <footer className="bg-foreground text-secondary mt-12 px-6 py-11 text-center sm:px-10">
      <div className="font-heading text-2xl text-background italic">{settings.businessName}</div>
      <div className="mt-2 text-xs tracking-wide">
        WhatsApp {formatPhoneBR(settings.whatsapp)}
      </div>
      <div className="mt-1 text-[11px] tracking-[0.2em] opacity-60">@{settings.instagram}</div>
    </footer>
  );
}
