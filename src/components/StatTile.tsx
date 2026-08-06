import type { ReactNode } from 'react'
import { cn } from '../lib/cn'

/**
 * StatTile — a single stat. THE stat treatment; `StatsStrip` is just this
 * tile in a grid.
 *
 * AUTM-726 — this began life as a private `TodayKpi` inside merchant-mobile's
 * TodayScreen. It was a large part of why Today read as designed while every
 * other screen — all of which reached for the plainer `StatsStrip` — read as
 * defaulted. Same design system, two treatments, and the better one was the
 * one that happened to be hand-made. Graduating it here means there is one
 * tile, and `StatsStrip` composes it rather than duplicating it.
 *
 * The device: an optional 3px accent tick, an uppercase tracked micro-label,
 * then the number doing the shouting, then a quiet caption. The tick is the
 * only place the accent palette is spent, which is what keeps it reading as
 * meaning rather than decoration.
 *
 * `tone` is SEMANTIC, not a colour picker:
 *   money-in   lime   — revenue, takings, lifetime earnings
 *   money-out  aqua   — payouts, transfers, anything owed or in flight
 *   brand      purple — counts and non-money stats (customers, services)
 *   none              — no tick at all
 *
 * Keep that mapping. A screen that swaps lime and aqua teaches the merchant
 * the wrong thing at a glance, which is worse than having no tick at all.
 *
 * `brand` is the DEFAULT, not `none` — a tick-less tile in a row of ticked
 * ones starts its label 24px to the left of its neighbours, because the tick
 * is inline with the text. Defaulting to a tick keeps a mixed strip aligned
 * and matches Today, where every tile has one. Reach for `none` only when the
 * whole surface is tick-free.
 */
export type StatTone = 'money-in' | 'money-out' | 'brand' | 'none'

const TICK: Record<Exclude<StatTone, 'none'>, string> = {
    'money-in': 'var(--color-autara-lime-drive)',
    'money-out': 'var(--color-autara-sky-aqua)',
    brand: 'var(--color-autara-purple)',
}

export interface StatTileProps {
    label: string
    /** Pre-formatted. `null`/`undefined` renders the skeleton, not a zero. */
    value?: string | number | null
    caption?: string | null
    tone?: StatTone
    /** Optional glyph, rendered top-right. Kept for StatsStrip compatibility. */
    icon?: ReactNode
    /** Force the skeleton even when a value is present. */
    loading?: boolean
    className?: string
}

export function StatTile({
    label,
    value,
    caption,
    tone = 'brand',
    icon,
    loading = false,
    className,
}: StatTileProps) {
    return (
        <div
            className={cn(
                'rounded-[14px] border border-[var(--border-subtle)] bg-[var(--surface)] px-5 py-[18px]',
                className,
            )}
        >
            <div className="flex items-start justify-between gap-2">
                <p className="mb-3.5 inline-flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                    {tone !== 'none' ? (
                        <span
                            aria-hidden
                            className="block h-[3px] w-4 shrink-0 rounded-sm"
                            style={{ background: TICK[tone] }}
                        />
                    ) : null}
                    {label}
                </p>
                {icon ? (
                    <span
                        aria-hidden
                        className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[rgba(78,27,189,0.06)] text-[var(--color-autara-purple)]"
                    >
                        {icon}
                    </span>
                ) : null}
            </div>
            {loading || value == null ? (
                <span
                    aria-hidden
                    className="block h-8 w-24 animate-pulse rounded-md bg-[var(--surface-elevated)]"
                />
            ) : (
                <p className="text-[2rem] font-bold leading-none tabular-nums tracking-[-0.02em] text-[var(--text-strong)]">
                    {value}
                </p>
            )}
            {caption ? (
                <p className="mt-2 text-[0.875rem] text-[var(--text-muted)]">{caption}</p>
            ) : null}
        </div>
    )
}
