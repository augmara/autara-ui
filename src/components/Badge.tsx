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
 *   - `pill` (default) — `rounded-full` capsule. The original Badge
 *     behaviour. Children render straight into the wrapper.
 *   - `parallelogram` — the editorial higgsfield-style tilted slab.
 *     The wrapper is skewed `-12deg`; children get wrapped in a
 *     counter-skewed `<span>` so the label sits upright while the
 *     fill reads as a slanted ribbon.
 *
 * Marketing surfaces (customer-web, merchant-web) standardise on the
 * `parallelogram` shape; status pills on the cream canvas keep the
 * `pill` default.
 *
 * Variants come in three families, all unified into the single
 * `variant` prop:
 *
 *   - **Marker tones** — `trending` / `new` / `new-light` / `featured`.
 *     Solid fills, white or ink text. Designed to sit over hero
 *     imagery (MerchantCard, ServiceCard).
 *   - **Status tones** — `info` / `success` / `warning` /
 *     `destructive` / `neutral`. Soft tonal fills with hairline inset
 *     rings — designed to surface multiple sibling pills on the same
 *     row (booking row, status grid) without overwhelming.
 *   - **Legacy palette** — the original Badge variants (`default`,
 *     `primary`, `aqua`, `lime`, `success`, `warning`, `destructive`,
 *     `pill`, `live`, `light-*`). Kept for backward compatibility;
 *     prefer the marker + status tones above.
 */

const badgeVariants = cva(
    'inline-flex items-center font-medium transition-colors',
    {
        variants: {
            variant: {
                // ─── Marker tones (v1.2.0 — ex-TrendingPill) ─────────────
                // Markers sit over hero photos and need to read against
                // arbitrary imagery — no ring, no tonal softness.
                trending:
                    'bg-autara-purple text-white px-3 py-1 text-[10px] uppercase tracking-[0.16em]',
                new:
                    'bg-[#0E0A1A] text-autara-lime-drive px-3 py-1 text-[10px] uppercase tracking-[0.16em]',
                'new-light':
                    'bg-[var(--color-autara-lime-bright)] text-[#0E0A1A] ring-1 ring-inset ring-[#0E0A1A]/15 px-3 py-1 text-[10px] uppercase tracking-[0.16em]',
                featured:
                    'bg-white/95 text-[#0a0a0a] px-3 py-1 text-[10px] uppercase tracking-[0.16em]',

                // ─── Status tones (v1.2.0 — ex-TrendingPill) ─────────────
                // Soft fill + AA-readable accent ink + hairline ring —
                // legible at 9-10 px and reads as one editorial family.
                info:
                    'bg-[rgba(78,27,189,0.08)] text-[var(--color-autara-purple)] ring-1 ring-inset ring-[rgba(78,27,189,0.22)] px-3 py-1 text-[10px] uppercase tracking-[0.16em]',
                success:
                    'bg-[rgba(183,225,73,0.18)] text-[#3a6b14] ring-1 ring-inset ring-[rgba(183,225,73,0.55)] px-3 py-1 text-[10px] uppercase tracking-[0.16em]',
                warning:
                    'bg-[rgba(245,166,35,0.12)] text-[var(--color-autara-warning-text)] ring-1 ring-inset ring-[rgba(245,166,35,0.35)] px-3 py-1 text-[10px] uppercase tracking-[0.16em]',
                destructive:
                    'bg-[rgba(221,56,56,0.1)] text-[var(--color-autara-error)] ring-1 ring-inset ring-[rgba(221,56,56,0.28)] px-3 py-1 text-[10px] uppercase tracking-[0.16em]',
                neutral:
                    'bg-[var(--surface-elevated)] text-[var(--text-muted)] ring-1 ring-inset ring-[var(--border-subtle)] px-3 py-1 text-[10px] uppercase tracking-[0.16em]',

                // ─── Legacy dark-theme palette (pre-v1.2.0) ─────────────
                // Kept for backward compatibility — prefer the marker
                // and status tones above for new code.
                default:
                    'border border-white/[0.08] bg-white/[0.04] text-white/60 px-3 py-1 text-xs',
                primary:
                    'border border-autara-purple/30 bg-autara-purple/10 text-autara-purple-lighter px-3 py-1 text-xs',
                aqua:
                    'border border-autara-sky-aqua/30 bg-autara-sky-aqua/10 text-autara-sky-aqua px-3 py-1 text-xs',
                lime:
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
                // Default capsule — preserves the original Badge look so
                // every existing consumer renders identically without
                // opting in to a shape.
                pill: 'rounded-full',
                // Editorial tilted slab — the silhouette ex-TrendingPill
                // contributed. `!rounded-md` overrides the legacy
                // variants' rounded-full so the slanted edge reads
                // straight. The inner counter-skew is applied in the
                // component render below.
                parallelogram:
                    '[transform:skewX(-12deg)] !rounded-md select-none whitespace-nowrap',
            },
        },
        defaultVariants: {
            variant: 'default',
            shape: 'pill',
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
