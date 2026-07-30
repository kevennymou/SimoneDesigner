import { cn } from "@/lib/utils";

interface PlaceholderPhotoProps {
  label: string;
  className?: string;
}

export function PlaceholderPhoto({ label, className }: PlaceholderPhotoProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center bg-[repeating-linear-gradient(45deg,rgba(184,149,106,0.14)_0,rgba(184,149,106,0.14)_8px,rgba(184,149,106,0.05)_8px,rgba(184,149,106,0.05)_16px)] px-3 text-center font-sans text-[10px] tracking-[0.15em] text-gold-muted uppercase",
        className,
      )}
    >
      {label}
    </div>
  );
}
