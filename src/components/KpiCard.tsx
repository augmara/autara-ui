import type { ReactNode } from "react";
import { cn } from "../lib/cn";

/**
 * KpiCard — the metric tile used across merchant dashboards
 * (Bookings tab KPI strip, Earnings overview, customer counts).
 *
 * Anatomy:
 *   - Tone tick (optional, hairline 20×1 px before the label) — keys
 *     the metric to a semantic role: money in, money out, needs action,
 *     status live, or brand. Purple was doing too much work on the
 *     merchant Today screen (every label, every CTA, every check) —
 *     `tone` reserves brand-purple for the brand mark and gives
 *     finance metrics a glanceable lime / sky / amber differentiation.
 *   - Tiny uppercase label
 *   - Big tabular-nums value
 *   - Optional sublabel (single line, muted) — preferred over `trend`
 *     for "Through 30 May" / "Awaiting first booking" copy where a
 *     direction arrow would read as broken.
 *   - Optional `trend` chip (▲ +12% / ▼ −3%)
 *   - Optional icon glyph top-right
 *
 * Loading state: pass `value={null}` (or `loading={true}`) to render a
 * pulse-skeleton bar where the value would go — preserves the card's
 * shape so the layout doesn't reflow when data arrives. Sublabel +
 * trend are suppressed while loading.
 */

/**
 * Semantic role for the tile. Drives the hairline tick colour before
 * the eyebrow label. See `autara-aesthetic` skill — purple is an
 * accent, not a default; financial metrics deserve role-keyed colour.
 *
 *   - `brand`         — autara-purple. Default. Use for non-financial
 *                       KPIs (rating, count, status) where the tick
 *                       should read as quiet brand chrome.
 *   - `money-in`      — lime-drive. Revenue, earnings, payouts received.
 *   - `money-out`     — sky-aqua. Pending payouts, next payout, escrow.
 *   - `needs-action`  — warning-amber. Outstanding bookings, expiring
 *                       requests, action queue depth.
 *   - `status-live`   — success-green. Currently active / accepting.
 *   - `none`          — no tick rendered. Use for legacy call sites
 *                       that pre-date `tone`.
 */
export type KpiTone =
  | "brand"
  | "money-in"
  | "money-out"
  | "needs-action"
  | "status-live"
  | "none";

const TONE_TICK: Record<KpiTone, string | null> = {
  brand: "var(--color-autara-purple)",
  "money-in": "var(--color-autara-lime-drive)",
  "money-out": "var(--color-autara-sky-aqua)",
  "needs-action": "var(--color-autara-warning)",
  "status-live": "var(--color-autara-success)",
  none: null,
};

export interface KpiCardProps {
  label: string;
  /** Pre-formatted value string. `null` or `undefined` → loading skeleton. */
  value?: string | number | null;
  /**
   * Single-line muted caption rendered under the value. Prefer this
   * over `trend` for non-directional copy ("Through 30 May",
   * "Awaiting first booking", "5 jobs"). Suppressed while loading.
   */
  sublabel?: string | null;
  /** Optional directional trend chip. Coexists with `sublabel`. */
  trend?: {
    value: string; // e.g. "+12%"
    direction: "up" | "down" | "flat";
  };
  /**
   * Semantic role for the tile. Defaults to `"none"` for backward
   * compatibility — existing call sites render unchanged.
   */
  tone?: KpiTone;
  /** Force the loading state regardless of value. */
  loading?: boolean;
  /** Optional 20px icon glyph rendered top-right. */
  icon?: ReactNode;
  className?: string;
}

export function KpiCard({
  label,
  value,
  sublabel,
  trend,
  tone = "none",
  loading,
  icon,
  className,
}: KpiCardProps) {
  const isLoading = loading || value == null;
  const tickColor = TONE_TICK[tone];
  return (
    <div
      className={cn(
        "rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] p-4",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-subtle)]">
          {tickColor != null ? (
            <span
              aria-hidden
              className="block h-px w-5"
              style={{ background: tickColor }}
            />
          ) : null}
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

      {sublabel != null && !isLoading ? (
        <p className="mt-1 text-[12px] text-[var(--text-muted)]">{sublabel}</p>
      ) : null}

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
