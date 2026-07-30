import Link from "next/link";
import type { Settings } from "@simone/shared";
import { PlaceholderPhoto } from "./placeholder-photo";

interface HeroProps {
  settings: Settings;
}

export function Hero({ settings }: HeroProps) {
  const nameParts = settings.businessName.trim().split(/\s+/);
  const nameDisplay =
    nameParts.length === 2 ? (
      <>
        {nameParts[0]}
        <br />
        {nameParts[1]}
      </>
    ) : (
      settings.businessName
    );

  return (
    <section className="relative">
      <div className="bg-primary px-6 pt-6 pb-10 text-primary-foreground sm:px-10 sm:pt-10 sm:pb-16 lg:px-16 lg:pt-14">
        <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-heading text-2xl italic">Sm</span>
              <span className="text-[10px] tracking-[0.3em] uppercase opacity-85">
                Nail Designer
              </span>
            </div>

            <h1 className="font-heading mt-7 text-[2.75rem] leading-[1.02] font-medium text-balance sm:text-6xl lg:mt-10 lg:text-7xl">
              {nameDisplay}
            </h1>
            <div className="my-4 h-0.5 w-11 bg-gold" />
            <p className="max-w-sm text-sm leading-relaxed opacity-90 sm:text-base">
              {settings.bio}
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center lg:mt-8">
              <Link
                href="/agendar"
                className="bg-background text-primary px-7 py-4 text-center text-sm font-semibold tracking-[0.15em] uppercase transition-opacity hover:opacity-90"
              >
                Agendar horário
              </Link>
              <div className="flex gap-3">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 border border-primary-foreground/40 px-5 py-3.5 text-center text-xs tracking-wide sm:flex-none"
                >
                  Instagram
                </a>
                <a
                  href={`https://wa.me/${settings.whatsapp}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 border border-primary-foreground/40 px-5 py-3.5 text-center text-xs tracking-wide sm:flex-none"
                >
                  WhatsApp
                </a>
              </div>
            </div>
          </div>

          <PlaceholderPhoto
            label="foto · retrato Simone"
            className="hidden aspect-[4/5] lg:flex"
          />
        </div>
      </div>

      <div className="mx-6 -mt-6 sm:mx-10 lg:hidden">
        <PlaceholderPhoto label="foto · trabalho em destaque" className="aspect-[4/3]" />
      </div>
    </section>
  );
}
