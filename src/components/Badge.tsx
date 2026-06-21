import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../lib/cn'

/**
 * Badge — the inline pill used for status, category, and credibility
 * markers on cards, headers, and hero surfaces.
 *
 * v1.2.0 (AUTAA-UI-006): the standalone `TrendingPill` was folded in.
 * Badge now exposes a `shape` variant:
 *
 *   - `parallelogram` (default) — the editorial tilted slab and the
 *     unique Autara silhouette. The wrapper is skewed `-12deg`; children
 *     get wrapped in a counter-skewed `<span>` so the label sits upright
 *     while the fill reads as a slanted ribbon.
 *   - `pill` — `rounded-full` capsule. Opt in with `shape="pill"` for
 *     dense rows / data tables where the tilt would crowd.
 *
 * AUTM-211 (Don 2026-06-21): parallelogram + solid colour is the house
 * style everywhere — the default flipped from `pill` to `parallelogram`.
 *
 * Variants come in three families, all unified into the single
 * `variant` prop:
 *
 *   - **Marker tones** — `purple` / `aqua` / `lime`. One per Autara
 *     accent. Solid fills, white or ink text. Designed to sit over
 *     hero imagery (MerchantCard, ServiceCard). The label is a free
 *     string the consumer passes (FEATURED / NEW / TRENDING / etc.) —
 *     the tone carries no semantic meaning on its own. Per Don
 *     2026-05-30: collapsed from the previous semantic set
 *     (`featured` / `new` / `new-light` / `trending`) — the harsh
 *     lime-drive `trending` is gone; `lime` is the lime-bright one.
 *   - **Status tones** — `info` / `success` / `warning` /
 *     `destructive` / `neutral`. SOLID semantic fills (blue / green /
 *     amber / red / slate) with white-or-ink text — no soft tints, no
 *     rings (AUTM-211; Don wants solid, never the pastel Tailwind look).
 *     Used for booking + availability state. Reads in both shapes.
 *   - **Legacy palette** — the original Badge variants (`default`,
 *     `primary`, `dark-aqua`, `dark-lime`, `live`, `light-*`). Kept
 *     for backward compatibility; prefer the marker + status tones
 *     above. The dark-theme `aqua` / `lime` were renamed to
 *     `dark-aqua` / `dark-lime` to free the bare color names for the
 *     marker family.
 */

const badgeVariants = cva(
    'inline-flex items-center font-medium transition-colors',
    {
        variants: {
            variant: {
                // ─── Marker tones — three Autara accents ─────────────────
                // Markers sit over hero photos and need to read against
                // arbitrary imagery — no ring (except lime, which needs
                // a hairline against light heros), no tonal softness.
                // Color names only — the label comes from the consumer:
                //   purple → autara purple   (brand stamp)
                //   aqua   → sky aqua        (cool / fresh)
                //   lime   → lime bright     (warm / "hot" — replaces
                //                             the old trending + new-light
                //                             pair; lime-drive was dropped)
                purple:
                    'bg-autara-purple text-white px-3 py-1 text-[10px] uppercase tracking-[0.16em]',
                aqua:
                    'bg-autara-sky-aqua text-[#062436] px-3 py-1 text-[10px] uppercase tracking-[0.16em]',
                lime:
                    'bg-[var(--color-autara-lime-bright)] text-[#0E0A1A] ring-1 ring-inset ring-[#0E0A1A]/15 px-3 py-1 text-[10px] uppercase tracking-[0.16em]',

                // ─── Status tones — SOLID (AUTM-211) ─────────────────────
                // Don 2026-06-21: Autara reads as SOLID color, never the
                // pastel "light tint + colored text + ring" look (that's
                // generic Tailwind). Each status tone is a solid fill in a
                // semantic colour with white/dark text for AA contrast — no
                // rgba soft fills, no inset rings. Works in both pill and
                // parallelogram shapes. See memory `feedback-solid-badges`.
                //   info → solid blue · success → solid green ·
                //   warning → solid amber (dark ink) · destructive → solid red ·
                //   neutral → solid slate
                info:
                    'bg-[var(--color-autara-info)] text-white px-3 py-1 text-[10px] uppercase tracking-[0.16em]',
                success:
                    'bg-[var(--color-autara-success)] text-white px-3 py-1 text-[10px] uppercase tracking-[0.16em]',
                warning:
                    'bg-[var(--color-autara-warning)] text-[#3a2a06] px-3 py-1 text-[10px] uppercase tracking-[0.16em]',
                destructive:
                    'bg-[var(--color-autara-error)] text-white px-3 py-1 text-[10px] uppercase tracking-[0.16em]',
                neutral:
                    'bg-[#46414f] text-white px-3 py-1 text-[10px] uppercase tracking-[0.16em]',

                // ─── Legacy dark-theme palette (pre-v1.2.0) ─────────────
                // Kept for backward compatibility — prefer the marker
                // and status tones above for new code.
                default:
                    'border border-white/[0.08] bg-white/[0.04] text-white/60 px-3 py-1 text-xs',
                primary:
                    'border border-autara-purple/30 bg-autara-purple/10 text-autara-purple-lighter px-3 py-1 text-xs',
                // Renamed from `aqua` / `lime` (2026-05-30) so the bare
                // color names belong to the marker family above.
                'dark-aqua':
                    'border border-autara-sky-aqua/30 bg-autara-sky-aqua/10 text-autara-sky-aqua px-3 py-1 text-xs',
                'dark-lime':
                    'border border-autara-lime-drive/30 bg-autara-lime-drive/10 text-autara-lime-drive px-3 py-1 text-xs',
                live:
                    'border border-autara-lime-drive/20 bg-autara-lime-drive/10 text-autara-lime-drive px-4 py-1.5 text-xs tracking-wide gap-2',

                // ─── Legacy light-theme palette (pre-v1.2.0) ────────────
                'light-default':
                    'border border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-[var(--text-muted)] px-3 py-1 text-xs',
                'light-primary':
                    'border border-[rgba(78,27,189,0.22)] bg-[rgba(78,27,189,0.08)] text-[var(--color-autara-purple)] px-3 py-1 text-xs',
                'light-success':
                    'border border-[rgba(183,225,73,0.55)] bg-[rgba(183,225,73,0.18)] text-[#3a6b14] px-3 py-1 text-xs',
                'light-warning':
                    'border border-[rgba(245,166,35,0.35)] bg-[rgba(245,166,35,0.12)] text-[var(--color-autara-warning-text)] px-3 py-1 text-xs',
                'light-destructive':
                    'border border-[rgba(221,56,56,0.28)] bg-[rgba(221,56,56,0.1)] text-[var(--color-autara-error)] px-3 py-1 text-xs',
            },
            shape: {
                // Rounded capsule — still available, opt in with
                // `shape="pill"`. Use for dense rows where the tilt would
                // crowd (data tables, tight chips).
                pill: 'rounded-full',
                // Editorial tilted slab — the unique Autara silhouette and
                // now the DEFAULT (AUTM-211; Don wants parallelogram +
                // solid as the house style, not generic pills). `!rounded-md`
                // overrides legacy variants' rounded-full so the slanted edge
                // reads straight; the inner counter-skew is applied in the
                // component render below so the label sits upright.
                parallelogram:
                    '[transform:skewX(-12deg)] !rounded-md select-none whitespace-nowrap',
            },
        },
        defaultVariants: {
            variant: 'default',
            // AUTM-211: parallelogram is the Autara default silhouette. Pass
            // `shape="pill"` to opt back into the rounded capsule.
            shape: 'parallelogram',
        },
    }
)

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
        VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
    ({ className, variant, shape, children, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(badgeVariants({ variant, shape }), className)}
            {...props}
        >
            {shape === 'parallelogram' ? (
                /* Counter-skew so the label sits upright while the slab
                   reads as a tilted ribbon. Inline-flex preserves icon
                   alignment if a consumer passes an icon + label. */
                <span className="inline-flex items-center gap-1 [transform:skewX(12deg)]">
                    {children}
                </span>
            ) : (
                children
            )}
        </div>
    )
)
Badge.displayName = 'Badge'

export { Badge, badgeVariants }
