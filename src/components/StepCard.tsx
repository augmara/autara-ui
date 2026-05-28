import type { ElementType, ReactNode } from "react";
import { cn } from "../lib/cn";

/**
 * StepCard — the editorial step card with massive numeral, small "Step N/total"
 * eyebrow, heading, body, and bottom chips. Compose 3 of these inside a
 * `.hairline-grid` (from autara-ui/utilities) for the canonical "How it
 * works in three steps." marquee.
 *
 * Visual:
 *   - Massive numeral (~4–4.5rem, clamp-scaled) top-left in `text-strong`
 *   - "STEP X / TOTAL" top-right, uppercase tracked-out
 *   - Heading (24/28px), body copy (15px)
 *   - Bullet chips at the bottom — small purple bullet + label
 *   - Hover: bottom-left purple wash + bottom border sweep + numeral
 *     turns purple + corner arrow nudges out. All CSS transitions —
 *     no motion lib required (matches the customer-web pattern but
 *     without the motion v12 flakiness).
 *
 * Used with `SectionBand tone="lime"` for the homepage hero section.
 */

export interface StepCardProps {
  /** 1-based step index (renders as "01", "02", etc.). */
  step: number;
  /** Total steps (for the "STEP X / TOTAL" eyebrow). Default 3. */
  total?: number;
  title: string;
  description: string;
  /** Bullet chip labels rendered at the bottom of the card. */
  chips?: string[];
  /** Make the whole card a link via `as={Link}` + `href`. */
  as?: ElementType;
  href?: string;
  className?: string;
  /** Optional content slot rendered above the chips (e.g. a small inline asset). */
  children?: ReactNode;
}

export function StepCard({
  step,
  total = 3,
  title,
  description,
  chips,
  as,
  href,
  className,
  children,
}: StepCardProps) {
  const Comp = (as ?? "div") as ElementType;
  const interactive = Boolean(as && href);

  return (
    <Comp
      href={href}
      className={cn(
        "group relative block h-full overflow-hidden bg-[#FBFAF5] p-8 lg:p-10",
        "transition-colors duration-300",
        interactive && "cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-autara-purple)]",
        className,
      )}
    >
      {/* Bottom border sweep on hover (replaces the motion lib variant) */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 h-[2px] w-0 bg-[var(--color-autara-purple)] transition-[width] duration-[550ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:w-full"
      />

      <div className="relative z-10">
        <div className="mb-10 flex items-baseline justify-between lg:mb-14">
          <span
            className="inline-block font-bold leading-none tracking-[-0.04em] text-[#111827] transition-colors duration-300 group-hover:text-[var(--color-autara-purple)]"
            style={{ fontSize: "clamp(3rem, 5vw, 4rem)" }}
          >
            {String(step).padStart(2, "0")}
          </span>
          <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-[#111827]/40">
            Step {step} / {String(total).padStart(2, "0")}
          </span>
        </div>

        <h3 className="mb-4 text-2xl font-bold tracking-[-0.02em] text-[#111827] lg:text-[1.75rem]">
          {title}
        </h3>
        <p className="max-w-sm text-[15px] leading-[1.65] text-[#111827]/70">
          {description}
        </p>

        {children}

        {chips && chips.length > 0 ? (
          <div className="mt-8 flex flex-wrap gap-2">
            {chips.map((chip) => (
              <span
                key={chip}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#111827]/[0.05] px-2.5 py-1 text-[11px] font-medium text-[#111827]/75"
              >
                <span
                  aria-hidden="true"
                  className="h-1 w-1 rounded-full bg-[var(--color-autara-purple)]"
                />
                {chip}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      {interactive ? (
        <svg
          aria-hidden="true"
          viewBox="0 0 16 16"
          className="absolute right-6 top-6 z-10 h-3.5 w-3.5 text-[var(--color-autara-purple)] opacity-25 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-90"
        >
          <path
            d="M3 13 L13 3 M5 3 h8 v8"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      ) : null}
    </Comp>
  );
}
