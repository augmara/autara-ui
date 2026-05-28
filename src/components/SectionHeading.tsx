import type { ReactNode } from "react";
import { cn } from "../lib/cn";

/**
 * SectionHeading — eyebrow + title + optional description + optional
 * trailing slot (nav arrows, "See all" link, etc.).
 *
 * Used heavily on customer-web's homepage carousels ("Top-rated pros near
 * you", "Just joined") and merchant profile sections (Services, Reviews,
 * Hours, etc.).
 *
 * `tone="lime" | "aqua"` adjusts the eyebrow color so the heading reads
 * correctly on the lime/aqua section bands. Default tone uses brand purple.
 */
export interface SectionHeadingProps {
  id?: string;
  /** Uppercase tracked-out label above the title. */
  eyebrow?: string;
  title: string;
  description?: string;
  /** Right-aligned slot — nav arrows, "See all" link, badge. */
  trailing?: ReactNode;
  /** Eyebrow color tone. Defaults to brand purple. */
  tone?: "brand" | "lime" | "aqua" | "muted";
  /**
   * Use the "editorial" treatment — hairline tick before the eyebrow,
   * larger heading, more vertical breathing room. Matches the customer-web
   * "How it works" + hero patterns.
   */
  editorial?: boolean;
  className?: string;
}

const EYEBROW_TONE = {
  brand: "text-[var(--color-autara-purple)]",
  lime: "text-[#111827]/70",
  aqua: "text-[#111827]/70",
  muted: "text-[var(--text-muted)]",
} as const;

export function SectionHeading({
  id,
  eyebrow,
  title,
  description,
  trailing,
  tone = "brand",
  editorial,
  className,
}: SectionHeadingProps) {
  if (editorial) {
    return (
      <div className={cn("mb-12 lg:mb-16", className)}>
        <div className="grid gap-6 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-3">
            {eyebrow ? (
              <p
                className={cn(
                  "inline-flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.22em]",
                  EYEBROW_TONE[tone],
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "h-px w-8",
                    tone === "brand"
                      ? "bg-[var(--text-subtle)]"
                      : "bg-[#111827]/40",
                  )}
                />
                {eyebrow}
              </p>
            ) : null}
          </div>
          <div className="lg:col-span-9">
            <h2
              id={id}
              className="font-bold leading-[0.95] tracking-[-0.03em] text-[var(--text-strong)]"
              style={{ fontSize: "clamp(2.25rem, 5.5vw, 4.5rem)" }}
            >
              {title}
            </h2>
            {description ? (
              <p className="mt-6 max-w-xl text-base leading-relaxed text-[var(--text-muted)]">
                {description}
              </p>
            ) : null}
            {trailing ? <div className="mt-6">{trailing}</div> : null}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("mb-4 flex items-end justify-between gap-3", className)}>
      <div className="min-w-0">
        {eyebrow ? (
          <p
            className={cn(
              "text-[10px] font-semibold uppercase tracking-[0.18em]",
              EYEBROW_TONE[tone],
            )}
          >
            {eyebrow}
          </p>
        ) : null}
        <h2
          id={id}
          className="text-lg font-semibold tracking-tight text-[var(--text-strong)] sm:text-xl"
        >
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-sm text-[var(--text-muted)]">{description}</p>
        ) : null}
      </div>
      {trailing}
    </div>
  );
}
