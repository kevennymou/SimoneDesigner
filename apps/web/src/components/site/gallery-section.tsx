import Image from "next/image";
import type { GalleryPhoto } from "@simone/shared";
import { PlaceholderPhoto } from "./placeholder-photo";

interface GallerySectionProps {
  photos: GalleryPhoto[];
}

export function GallerySection({ photos }: GallerySectionProps) {
  return (
    <section className="mx-auto mt-10 max-w-2xl px-6 sm:px-10">
      <h2 className="text-[11px] tracking-[0.25em] text-gold-muted uppercase">Galeria</h2>
      {photos.length === 0 ? (
        <PlaceholderPhoto label="Galeria em breve" className="mt-4 aspect-[3/1.2]" />
      ) : (
        <div className="mt-4 grid grid-cols-3 gap-1.5 sm:gap-2">
          {photos.map((p) => (
            <div key={p.id} className="relative aspect-[4/5] w-full overflow-hidden">
              <Image
                src={p.url}
                alt="Trabalho de nail design"
                fill
                sizes="33vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
