import type { ReactNode } from "react";
import { cn } from "../lib/cn";
import { Button } from "./Button";

/**
 * ErrorCard — the "we couldn't load this, here's why, try again" surface.
 *
 * Use on every async surface that can fail. Pair with `AsyncSkeleton`
 * (loading) and `EmptyState` (empty) to satisfy the workspace cross-stack
 * rule: every async surface honors success / loading / error / empty.
 *
 * AUTM-936 — this was built out of raw Tailwind `rose-*` / `amber-*`,
 * which are static values on a themed canvas. On the dark canvas the
 * tinted fill composited to a muddy grey and the title landed at 1.82:1,
 * while the retry button (`bg-white text-rose-900`) punched a white slab
 * into a dark page. merchant-mobile renders this inside AppErrorBoundary,
 * so the app-wide crash screen was the surface that failed — the worst
 * possible place for the copy to be unreadable, because the retry control
 * is the only way out.
 *
 * The rebuild follows the house grammar rather than re-tinting: a normal
 * hairline panel on `--surface`, with the tone carried by a SOLID intent
 * disc and a hairline border in the intent colour. Solid, never pastel
 * (the same call AUTM-211 made for Badge). Every value is a token, so
 * both themes track the ladder.
 *
 * Copy guidance — recoverable + specific:
 *   - Bad: "Something went wrong" (Autara house rule: don't ship this)
 *   - Good: "We couldn't load your bookings — check your connection and
 *     tap retry."
 *
 * Tone:
 *   - `error` (default) — real failure, action expected.
 *   - `warning` — soft failure, may recover on its own.
 */
type Tone = "error" | "warning";

export interface ErrorCardProps {
  /** Short headline. Default: "Couldn't load this". */
  title?: string;
  /** Main user-facing copy. */
  message: string;
  /** Optional secondary copy — typically dev info (error.message) shown
   *  only in development builds. */
  detail?: string;
  /** Retry handler. If omitted, no retry button renders. */
  onRetry?: () => void;
  /** Override the retry button label. Default: "Retry". */
  retryLabel?: string;
  tone?: Tone;
  /**
   * Optional icon glyph. Defaults to the Solar Bold alert glyph for the
   * tone — an error surface should not depend on the caller remembering
   * to pass one.
   */
  icon?: ReactNode;
  className?: string;
}

/**
 * Intent FILL tokens are static solids by design (see colors.css) — the
 * same ones Badge's status tones use. They read on cream and on ink, which
 * is exactly what a tone marker has to do.
 */
const TONE: Record<Tone, { fill: string; border: string }> = {
  error: {
    fill: "bg-[var(--color-autara-error)]",
    border: "border-[var(--color-autara-error)]/30",
  },
  warning: {
    fill: "bg-[var(--color-autara-warning)]",
    border: "border-[var(--color-autara-warning)]/35",
  },
};

/** Solar Bold — rounded caps, 2.4 stroke on a 24 viewBox. */
const AlertIcon = () => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    width="18"
    height="18"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.4}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 7.5v5.5" />
    <path d="M12 16.5h.01" />
    <path d="M10.3 3.6 2.5 17.2A2 2 0 0 0 4.2 20.2h15.6a2 2 0 0 0 1.7-3L13.7 3.6a2 2 0 0 0-3.4 0Z" />
  </svg>
);

export function ErrorCard({
  title = "Couldn't load this",
  message,
  detail,
  onRetry,
  retryLabel = "Retry",
  tone = "error",
  icon,
  className,
}: ErrorCardProps) {
  const t = TONE[tone];
  return (
    <div
      role="alert"
      className={cn(
        "rounded-autara-lg border bg-[var(--surface)] p-4",
        t.border,
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className={cn(
            "grid h-8 w-8 shrink-0 place-items-center rounded-full text-white",
            t.fill,
          )}
        >
          {icon ?? <AlertIcon />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-[var(--text-strong)]">{title}</p>
          <p className="mt-0.5 text-sm text-[var(--text-muted)]">{message}</p>
          {detail ? (
            <p className="mt-1 text-xs text-[var(--text-subtle)]">{detail}</p>
          ) : null}
          {onRetry ? (
            /*
             * Rendered through the Button primitive rather than a bare
             * <button>. The hand-rolled one had no focus-visible treatment
             * at all — consumers apply a global outline reset, so a keyboard
             * user tabbing to the only escape from an error state saw
             * nothing. It was also h-9 = 36px, under the 44px minimum, so
             * this is `md`: the one control on the screen is not the place
             * to save 8px.
             */
            <Button
              variant="outline"
              size="md"
              onClick={onRetry}
              className="mt-3"
            >
              {retryLabel}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
