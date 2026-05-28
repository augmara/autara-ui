import type { ReactNode } from "react";
import { cn } from "../lib/cn";

/**
 * SectionBand — full-bleed accent section wrapper.
 *
 * Autara uses tonal full-width bands to anchor key narrative moments:
 *   - "How it works" lives on **lime** (`--color-autara-lime-drive`).
 *   - "Why merchants pick us" / accent rails live on **aqua**
 *     (`--color-autara-sky-aqua`).
 *   - Warm-cream is the default surface so this isn't usually needed.
 *
 * `withNoise` adds the editorial paper-grain texture (requires
 * `/noise.png` in the consumer's `public/`).
 *
 * Compose with `SectionHeading editorial` + `StepCard` for the
 * canonical "How it works in three steps." marquee — see
 * `StepCard.stories.tsx` `LimeBand` for the full pattern.
 */
export interface SectionBandProps {
  tone: "lime" | "aqua" | "cream";
  /** Add the paper-grain texture overlay. Requires /noise.png in consumer public/. */
  withNoise?: boolean;
  /** Vertical padding tier. `lg` matches customer-web "How it works" (24/36 py). */
  spacing?: "md" | "lg";
  className?: string;
  children: ReactNode;
}

const TONE: Record<SectionBandProps["tone"], string> = {
  lime: "section-lime",
  aqua: "section-aqua",
  cream: "bg-[var(--background)]",
};

export function SectionBand({
  tone,
  withNoise,
  spacing = "lg",
  className,
  children,
}: SectionBandProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden",
        TONE[tone],
        withNoise && "noise-overlay",
        spacing === "lg" ? "py-24 lg:py-36" : "py-16 lg:py-24",
        className,
      )}
    >
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
    </section>
  );
}
