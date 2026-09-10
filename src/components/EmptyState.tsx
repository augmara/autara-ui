import type { ReactNode } from "react";

/**
 * EmptyState — the "nothing-here-yet" surface. Every list, table, and
 * results area should render this when length === 0 (per the workspace
 * cross-stack non-negotiable: "Every list (e.g. uploaded documents) has
 * a designed empty state with icon, headline, body, primary action").
 *
 * Layout:
 *   - Dashed hairline border (signals "this is a placeholder")
 *   - Optional purple-tinted icon disc
 *   - Bold title + muted description
 *   - Optional action button (compose with BrandButton)
 *
 * Copy guidance — recoverable + specific:
 *   - Bad: "No data"
 *   - Good: "No bookings yet — new requests will appear here as
 *     customers find your services."
 */
export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  /** Typically a BrandButton or BrandButton-asChild link. */
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      /* AUTM-1221: a solid hairline on the ladder. The dashed border read
         as a drop zone, and the panel is not one. */
      className={`flex flex-col items-center justify-center rounded-autara-lg border border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-6 py-10 text-center ${className}`}
    >
      {icon ? (
        <div
          aria-hidden="true"
          /* AUTM-1221: a solid purple tile on the ladder. Rules 3 and 4:
             round is for avatars and status dots, and emphasis is a fill,
             never an 8% tint. */
          className="mb-4 grid h-12 w-12 place-items-center rounded-autara bg-[var(--color-autara-purple-static)] text-white"
        >
          {icon}
        </div>
      ) : null}
      <p className="text-sm font-bold text-[var(--text-strong)]">{title}</p>
      {description ? (
        <p className="mt-1.5 max-w-xs text-sm text-[var(--text-muted)]">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
