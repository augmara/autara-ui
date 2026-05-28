import type { ReactNode } from "react";
import { cn } from "../lib/cn";

/**
 * ErrorCard — the "we couldn't load this, here's why, try again" surface.
 *
 * Use on every async surface that can fail. Pair with `AsyncSkeleton`
 * (loading) and `EmptyState` (empty) to satisfy the workspace
 * cross-stack rule: every async surface honors success / loading /
 * error / empty.
 *
 * Copy guidance — recoverable + specific:
 *   - Bad: "Something went wrong" (Autara house rule: don't ship this)
 *   - Good: "We couldn't load your bookings — check your connection and
 *     tap retry."
 *
 * Tone:
 *   - `error` (default) — rose. Real failure, action expected.
 *   - `warning` — amber. Soft failure, may recover automatically.
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
  /** Optional icon glyph rendered top-left. */
  icon?: ReactNode;
  className?: string;
}

const TONE_CLASSES: Record<Tone, { container: string; title: string; detail: string; retry: string }> = {
  error: {
    container: "border-rose-200 bg-rose-50/40",
    title: "text-rose-900",
    detail: "text-rose-800/80",
    retry: "border-rose-200 bg-white text-rose-900 hover:bg-rose-50",
  },
  warning: {
    container: "border-amber-200 bg-amber-50/40",
    title: "text-amber-900",
    detail: "text-amber-800/80",
    retry: "border-amber-200 bg-white text-amber-900 hover:bg-amber-50",
  },
};

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
  const t = TONE_CLASSES[tone];
  return (
    <div
      role="alert"
      className={cn(
        "rounded-2xl border p-4",
        t.container,
        className,
      )}
    >
      <div className="flex items-start gap-3">
        {icon ? <span aria-hidden className={cn("shrink-0", t.title)}>{icon}</span> : null}
        <div className="min-w-0 flex-1">
          <p className={cn("text-sm font-semibold", t.title)}>{title}</p>
          <p className={cn("mt-0.5 text-sm", t.detail)}>{message}</p>
          {detail ? (
            <p className={cn("mt-1 text-xs", t.detail)}>{detail}</p>
          ) : null}
          {onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className={cn(
                "mt-3 inline-flex h-9 items-center justify-center rounded-lg border px-3 text-xs font-medium transition-colors",
                t.retry,
              )}
            >
              {retryLabel}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
