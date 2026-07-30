import type { Testimonial } from "@simone/shared";

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
}

export function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
  if (testimonials.length === 0) return null;

  return (
    <section className="mt-10">
      {testimonials.map((t) => (
        <div key={t.id} className="bg-secondary px-6 py-9 text-center sm:px-10">
          <div className="text-gold-muted text-sm tracking-[0.2em]">
            {"★".repeat(t.rating)}
            <span className="text-border">{"★".repeat(Math.max(0, 5 - t.rating))}</span>
          </div>
          <p className="font-heading mx-auto mt-3 max-w-md text-xl leading-relaxed text-balance italic sm:text-2xl">
            “{t.text}”
          </p>
          <div className="mt-3 text-xs tracking-wide text-muted-foreground">{t.author}</div>
        </div>
      ))}
    </section>
  );
}
