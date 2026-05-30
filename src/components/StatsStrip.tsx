import type { ReactNode } from 'react'
import { cn } from '../lib/cn'

/**
 * StatsStrip — horizontal row of compact stat tiles. One pattern,
 * many consumers (merchant Bookings stats, Customers stats, Services
 * stats, Earnings KPIs; admin overview).
 *
 * Aesthetic:
 *   - Hairline-bordered tiles on the cream canvas
 *   - Tiny uppercase editorial label (`text-[10px] tracking-[0.14em]`)
 *   - Bold tabular-nums value
 *   - No drop shadow (Autara house rule)
 *   - 2 columns on phone (always); collapses neatly into 1×N rows on
 *     wider surfaces by accepting a `columns` prop
 *
 * `value={null}` (or `loading`) renders a pulse-skeleton bar where the
 * value would go — preserves the tile's shape so the layout doesn't
 * reflow when data arrives.
 *
 * Sibling primitive to `KpiCard` — the difference is that `StatsStrip`
 * is a *strip* of tiles meant to be rendered as a row, while
 * `KpiCard` is a single tile with optional trend chip + icon. Use
 * `KpiCard` standalone, `StatsStrip` when you have 2–4 stats.
 */

export interface StatItem {
    label: string
    /** Pre-formatted value string. `null` or `undefined` → loading skeleton. */
    value?: string | number | null
    caption?: string
    /** Optional 20 px icon glyph rendered top-right of the tile. */
    icon?: ReactNode
}

export interface StatsStripProps {
    stats: StatItem[]
    /** Force the loading state across every tile. */
    loading?: boolean
    /** Override the column count at the `sm` breakpoint and up.
     *  Defaults to `min(stats.length, 4)`. */
    columns?: 2 | 3 | 4
    className?: string
}

const COLUMN_CLASS: Record<2 | 3 | 4, string> = {
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-3',
    4: 'sm:grid-cols-4',
}

export function StatsStrip({
    stats,
    loading = false,
    columns,
    className,
}: StatsStripProps) {
    const cols: 2 | 3 | 4 = columns ?? (Math.min(stats.length, 4) as 2 | 3 | 4)
    return (
        <div className={cn('grid grid-cols-2 gap-3', COLUMN_CLASS[cols], className)}>
            {stats.map((s, i) => (
                <div
                    key={i}
                    className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] p-4"
                >
                    <div className="flex items-start justify-between gap-2">
                        <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--text-subtle)]">
                            {s.label}
                        </p>
                        {s.icon ? (
                            <span
                                aria-hidden
                                className="grid h-7 w-7 place-items-center rounded-lg bg-[rgba(78,27,189,0.06)] text-[var(--color-autara-purple)]"
                            >
                                {s.icon}
                            </span>
                        ) : null}
                    </div>
                    {loading || s.value == null ? (
                        <span
                            aria-hidden
                            className="mt-2 block h-7 w-16 animate-pulse rounded-md bg-[var(--surface-elevated)]"
                        />
                    ) : (
                        <p className="mt-1 text-2xl font-bold tabular-nums tracking-tight text-[var(--text-strong)]">
                            {s.value}
                        </p>
                    )}
                    {s.caption ? (
                        <p className="mt-1 text-[11px] text-[var(--text-muted)]">
                            {s.caption}
                        </p>
                    ) : null}
                </div>
            ))}
        </div>
    )
}
