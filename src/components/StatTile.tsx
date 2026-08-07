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
    /**
     * Fill the tile with the brand accent. AUTM-713 — "one hero per screen":
     * a strip of identical white cards gives four numbers equal weight when
     * only one of them answers the question the merchant came with.
     *
     * Measured on merchant-mobile before this existed: Today spends 2.8% of
     * its pixels on brand purple and Customers 0.4%, and the whole difference
     * is Today's one solid quick-action tile. Everything else is white cards
     * on the canvas, which is why light mode read as "fully white". The tick
     * cannot carry that on its own — it is 3px.
     *
     * Use it on AT MOST ONE tile per surface. Two heroes is no hero, and the
     * emphasis stops meaning "start here".
     *
     * And only when the value is worth the emphasis — pass an expression,
     * not a bare `true`. A hero is an answer, so a tile with nothing to say
     * should not wear one: Invoices showing a full-bleed purple **$0
     * outstanding** was the first thing this variant produced, and it drew
     * the eye to the one number that was not news (the $343 collected was).
     * Zero owed, zero pending, no reviews yet — those are calm states, and a
     * screen with no hero is the correct rendering of a calm state.
     *
     * Do NOT make the fill migrate to whichever tile happens to be non-empty.
     * Emphasis that moves between surfaces teaches nothing; it just makes the
     * layout unstable. Hero that tile, or hero nothing.
     *
     * The tone tick is deliberately dropped when hero — the fill already
     * spends the accent, and a lime tick on a purple field reads as a bug.
     * Semantics are preserved by which tile you promote, not by its tick.
     *
     * Consequence, and it is intentional: without the tick the hero's label
     * starts at the padding edge, ~27px left of its ticked neighbours', so a
     * mixed strip's labels do not share a left edge. That is the very
     * misalignment `tone` defaults to `brand` to avoid (see above) — the
     * exception holds because the fill gives the hero its own frame, and
     * inside that frame the label lines up with its own value instead. Don't
     * "fix" it by re-adding an invisible tick.
     */
    hero?: boolean
    className?: string
}

export function StatTile({
    label,
    value,
    caption,
    tone = 'brand',
    icon,
    loading = false,
    hero = false,
    className,
}: StatTileProps) {
    return (
        <div
            className={cn(
                'rounded-[14px] px-5 py-[18px]',
                hero
                    ? // No border: the fill IS the edge. A hairline on a filled
                      // tile reads as a seam against its own colour.
                      'bg-[var(--accent-fill)]'
                    : 'border border-[var(--border-subtle)] bg-[var(--surface)]',
                className,
            )}
        >
            <div className="flex items-start justify-between gap-2">
                <p
                    className={cn(
                        'mb-3.5 inline-flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.14em]',
                        hero
                            ? // Slightly held back from full on-accent so the
                              // number still out-shouts its own label.
                              'text-[var(--on-accent)]/75'
                            : 'text-[var(--text-muted)]',
                    )}
                >
                    {!hero && tone !== 'none' ? (
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
                        className={cn(
                            'grid h-7 w-7 shrink-0 place-items-center rounded-lg',
                            hero
                                ? 'bg-[var(--on-accent)]/15 text-[var(--on-accent)]'
                                : 'bg-[var(--accent-tint)] text-[var(--accent)]',
                        )}
                    >
                        {icon}
                    </span>
                ) : null}
            </div>
            {loading || value == null ? (
                <span
                    aria-hidden
                    className={cn(
                        'block h-8 w-24 animate-pulse rounded-md',
                        hero
                            ? 'bg-[var(--on-accent)]/20'
                            : 'bg-[var(--surface-elevated)]',
                    )}
                />
            ) : (
                <p
                    className={cn(
                        'text-[2rem] font-bold leading-none tabular-nums tracking-[-0.02em]',
                        hero ? 'text-[var(--on-accent)]' : 'text-[var(--text-strong)]',
                    )}
                >
                    {value}
                </p>
            )}
            {caption ? (
                <p
                    className={cn(
                        'mt-2 text-[0.875rem]',
                        hero ? 'text-[var(--on-accent)]/75' : 'text-[var(--text-muted)]',
                    )}
                >
                    {caption}
                </p>
            ) : null}
        </div>
    )
}
