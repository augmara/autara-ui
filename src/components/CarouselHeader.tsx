import type { ReactNode } from "react";
import { cn } from "../lib/cn";

/**
 * CarouselHeader — the eyebrow + heading + arrow-nav + "See all" pattern
 * used above every homepage rail ("Top-rated pros near you", "Just joined",
 * "Trending in your city").
 *
 * Composition:
 *   - Left block: editorial eyebrow + bold heading + muted subhead
 *   - Right block: prev/next circular buttons + optional "See all ↗"
 *
 * Heading on the bookmark-style rails uses the SectionHeading non-editorial
 * treatment (smaller). The lime "How it works" surface uses
 * `SectionHeading editorial`. This component is for the smaller carousel
 * rails — for the marquee section, compose SectionHeading + the rail
 * separately.
 */

export interface CarouselHeaderProps {
  /** Uppercase tracked label, e.g. "RECOMMENDED", "NEW ON AUTARA". */
  eyebrow: string;
  title: string;
  description?: string;
  /** Handler for the left arrow. If omitted, the button is hidden. */
  onPrev?: () => void;
  /** Handler for the right arrow. If omitted, the button is hidden. */
  onNext?: () => void;
  /** Disable the prev arrow (e.g. at the start of the rail). */
  prevDisabled?: boolean;
  /** Disable the next arrow (e.g. at the end). */
  nextDisabled?: boolean;
  /** "See all" link slot — pass an `<a>` or framework `<Link>` element. */
  seeAll?: ReactNode;
  className?: string;
}

export function CarouselHeader({
  eyebrow,
  title,
  description,
  onPrev,
  onNext,
  prevDisabled,
  nextDisabled,
  seeAll,
  className,
}: CarouselHeaderProps) {
  return (
    <div
      className={cn(
        "mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        <p className="inline-flex items-center gap-3 text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--text-muted)]">
          <span aria-hidden className="h-px w-8 bg-[var(--text-subtle)]" />
          {eyebrow}
        </p>
        <h2 className="mt-2 text-[28px] font-bold leading-tight tracking-[-0.025em] text-[var(--text-strong)] sm:text-[34px]">
          {title}
        </h2>
        {description ? (
          <p className="mt-1.5 max-w-xl text-sm text-[var(--text-muted)] sm:text-[15px]">
            {description}
          </p>
        ) : null}
      </div>

      <div className="flex items-center gap-3">
        {(onPrev || onNext) && (
          <div className="flex items-center gap-2">
            <NavArrow
              direction="left"
              onClick={onPrev}
              disabled={prevDisabled}
            />
            <NavArrow
              direction="right"
              onClick={onNext}
              disabled={nextDisabled}
            />
          </div>
        )}
        {seeAll ? (
          <div className="text-[13px] font-medium text-[var(--text-strong)]">
            {seeAll}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function NavArrow({
  direction,
  onClick,
  disabled,
}: {
  direction: "left" | "right";
  onClick?: () => void;
  disabled?: boolean;
}) {
  if (!onClick) return null;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === "left" ? "Previous" : "Next"}
      className="grid h-10 w-10 place-items-center rounded-full border border-[var(--border-subtle)] bg-[var(--surface)] text-[var(--text-strong)] transition-colors hover:border-[rgba(78,27,189,0.35)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[var(--border-subtle)]"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        {direction === "left" ? (
          <path d="M15 18l-6-6 6-6" />
        ) : (
          <path d="M9 18l6-6-6-6" />
        )}
      </svg>
    </button>
  );
}
