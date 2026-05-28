import type { ReactNode } from "react";
import { cn } from "../lib/cn";

/**
 * TrustItem — the small icon + title + description card used in the
 * customer-web "Booking guarantees" trust strip (Secure payments,
 * Verified merchants, Free cancellation).
 *
 * Compose three or four of these in a `grid sm:grid-cols-3` layout
 * underneath a primary CTA to surface trust signals without bloating
 * the hero.
 */
export interface TrustItemProps {
  icon: ReactNode;
  title: string;
  description: string;
  className?: string;
}

export function TrustItem({ icon, title, description, className }: TrustItemProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] p-3.5",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[rgba(78,27,189,0.08)] text-[var(--color-autara-purple)]"
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-[var(--text-strong)]">{title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-[var(--text-muted)]">
          {description}
        </p>
      </div>
    </div>
  );
}
