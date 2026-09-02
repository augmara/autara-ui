"use client";

import { useEffect, useRef } from "react";
import { cn } from "../lib/cn";

/**
 * StepHeader — the one wizard-step header grammar (AUTM-839, brand v3).
 *
 * Every step of a multi-step flow (merchant onboarding wizard, customer
 * booking wizard) opens with the same three-line composition: a plain
 * uppercase tracked eyebrow carrying the step context, a display-register
 * Satoshi title, and an optional one-sentence dek. Promoted here so both
 * wizards share one header instead of the four different treatments the
 * AUTM-839 audit found across five onboarding steps.
 *
 * Focus management: pass `autoFocus` on the step that just became active
 * and the heading receives focus on mount (tabIndex -1, no visible ring),
 * so screen-reader and keyboard users hear the new step announced instead
 * of being left mid-page. Pair with `titleId` + `aria-labelledby` on the
 * step's form region.
 */
export interface StepHeaderProps {
  /** Step context label, e.g. "Step 2 of 5" or "Business details". */
  eyebrow?: string;
  title: string;
  /** One-sentence supporting line under the title. */
  dek?: string;
  /** Heading element. A wizard step is usually the page heading: h1. */
  as?: "h1" | "h2";
  titleId?: string;
  /** Focus the heading on mount — use on step transitions. */
  autoFocus?: boolean;
  className?: string;
}

export function StepHeader({
  eyebrow,
  title,
  dek,
  as: Heading = "h1",
  titleId,
  autoFocus = false,
  className,
}: StepHeaderProps) {
  const headingRef = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    if (autoFocus) headingRef.current?.focus();
  }, [autoFocus]);

  return (
    <div className={cn("mb-8", className)}>
      {eyebrow ? (
        <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-muted)]">
          {eyebrow}
        </p>
      ) : null}
      <Heading
        id={titleId}
        ref={headingRef}
        tabIndex={autoFocus ? -1 : undefined}
        className="font-bold leading-[1.05] tracking-[-0.02em] text-[var(--text-strong)] outline-none"
        style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)" }}
      >
        {title}
      </Heading>
      {dek ? (
        <p className="mt-3 max-w-xl text-base leading-relaxed text-[var(--text-muted)]">
          {dek}
        </p>
      ) : null}
    </div>
  );
}
