import type { ReactNode } from "react";
import { cn } from "../lib/cn";

/**
 * KpiCard — the metric tile used across merchant dashboards
 * (Bookings tab KPI strip, Earnings overview, customer counts).
 *
 * Anatomy:
 *   - Tiny uppercase label (text-subtle)
 *   - Big tabular-nums value (text-strong)
 *   - Optional trend chip (▲ +12% / ▼ −3%)
 *   - Optional icon glyph top-right
 *
 * Loading state: pass `value={null}` (or `loading={true}`) to render a
 * pulse-skeleton bar where the value would go — preserves the card's
 * shape so the layout doesn't reflow when data arrives.
 */
export interface KpiCardProps {
  label: string;
  /** Pre-formatted value string. `null` or `undefined` → loading skeleton. */
  value?: string | number | null;
  /** Optional trend indicator. */
  trend?: {
    value: string; // e.g. "+12%"
    direction: "up" | "down" | "flat";
  };
  /** Force the loading state regardless of value. */
  loading?: boolean;
  /** Optional 20px icon glyph rendered top-right. */
  icon?: ReactNode;
  className?: string;
}

export function KpiCard({
  label,
  value,
  trend,
  loading,
  icon,
  className,
}: KpiCardProps) {
  const isLoading = loading || value == null;
  return (
    <div
      className={cn(
        "rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] p-4",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-subtle)]">
          {label}
        </p>
        {icon ? (
          <span
            aria-hidden
            className="grid h-7 w-7 place-items-center rounded-lg bg-[rgba(78,27,189,0.06)] text-[var(--color-autara-purple)]"
          >
            {icon}
          </span>
        ) : null}
      </div>

      {isLoading ? (
        <span
          aria-hidden
          className="mt-1 block h-7 w-12 animate-pulse rounded-md bg-[var(--surface-elevated)]"
        />
      ) : (
        <p className="mt-1 text-2xl font-bold tabular-nums text-[var(--text-strong)]">
          {value}
        </p>
      )}

      {trend && !isLoading ? (
        <p
          className={cn(
            "mt-1 inline-flex items-center gap-1 text-[11px] font-medium tabular-nums",
            trend.direction === "up" && "text-emerald-700",
            trend.direction === "down" && "text-rose-700",
            trend.direction === "flat" && "text-[var(--text-muted)]",
          )}
        >
          <span aria-hidden>
            {trend.direction === "up"
              ? "▲"
              : trend.direction === "down"
                ? "▼"
                : "—"}
          </span>
          {trend.value}
        </p>
      ) : null}
    </div>
  );
}
