import type { ReactNode } from 'react'
import { cn } from '../lib/cn'
import { StatTile, type StatTone } from './StatTile'

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
 * AUTM-726 — this no longer draws the tile. `StatTile` does, and this is
 * the grid around it. Before that they were separate implementations of the
 * same idea, which is how merchant-mobile ended up with a hand-made KPI on
 * Today that looked better than the shared one everywhere else. If you are
 * changing how a stat LOOKS, change StatTile; this file only owns layout.
 *
 * Three stat surfaces still exist: `StatTile` (one stat), `StatsStrip` (a
 * grid of them) and `KpiCard` (a single tile with a trend chip). Use
 * `KpiCard` only when you need the trend chip.
 */

export interface StatItem {
    label: string
    /** Pre-formatted value string. `null` or `undefined` → loading skeleton. */
    value?: string | number | null
    caption?: string
    /** Optional 20 px icon glyph rendered top-right of the tile. */
    icon?: ReactNode
    /** AUTM-726 — semantic accent tick. See StatTile for the mapping. */
    tone?: StatTone
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
                <StatTile
                    key={i}
                    label={s.label}
                    value={s.value}
                    caption={s.caption}
                    icon={s.icon}
                    tone={s.tone}
                    loading={loading}
                />
            ))}
        </div>
    )
}
