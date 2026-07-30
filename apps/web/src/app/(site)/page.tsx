import {
  getGalleryPhotos,
  getServices,
  getSettings,
  getTestimonials,
  getWeeklyAvailability,
} from "@/lib/api";
import { GallerySection } from "@/components/site/gallery-section";
import { Hero } from "@/components/site/hero";
import { HoursSection } from "@/components/site/hours-section";
import { LocationSection } from "@/components/site/location-section";
import { ServicesSection } from "@/components/site/services-section";
import { SiteFooter } from "@/components/site/site-footer";
import { TestimonialsSection } from "@/components/site/testimonials-section";

export default async function HomePage() {
  let data;
  try {
    data = await Promise.all([
      getSettings(),
      getServices(),
      getWeeklyAvailability(),
      getGalleryPhotos(),
      getTestimonials(),
    ]);
  } catch {
    return (
      <main className="flex min-h-svh flex-col items-center justify-center px-6 text-center">
        <p className="font-heading text-2xl text-foreground">
          Estamos ajustando alguns detalhes.
        </p>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Volte em instantes — o site já vai estar pronto pra você agendar.
        </p>
      </main>
    );
  }

  const [settings, services, weekly, gallery, testimonials] = data;

  return (
    <main className="pb-4">
      <Hero settings={settings} />
      <ServicesSection services={services} />
      <HoursSection weekly={weekly} />
      <GallerySection photos={gallery} />
      <TestimonialsSection testimonials={testimonials} />
      <LocationSection settings={settings} />
      <SiteFooter settings={settings} />
    </main>
  );
}
