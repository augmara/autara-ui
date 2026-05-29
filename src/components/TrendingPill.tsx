import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../lib/cn'

/**
 * TrendingPill — the corner marker / status capsule with a
 * higgsfield-style parallelogram silhouette.
 *
 * Default shape is the parallelogram: the wrapper is skewed `-12deg`,
 * an inner `<span>` counter-skews `+12deg` so the label sits upright
 * while the background reads as a tilted slab. The `pill` shape is
 * available for surfaces where the slanted edge would crowd adjacent
 * UI (chat composer, very narrow rails).
 *
 * Two tone families, one component:
 *
 *   **Marker tones** (v1.0 — corner markers on hero imagery,
 *   MerchantCard / ServiceCard): `trending` / `new` / `new-light` /
 *   `featured`. Solid fills, white or ink text.
 *
 *   **Status tones** (v1.3+ — booking + availability state on cream
 *   surfaces): `info` / `success` / `warning` / `destructive` /
 *   `neutral`. Soft tonal fills with hairline inset rings — same
 *   editorial vibe, but designed to surface multiple sibling pills on
 *   the same row (booking row, status grid) without overwhelming.
 *
 * Aesthetic invariants honored:
 *   - No drop shadows. Depth via hairline `ring-1 ring-inset` on the
 *     status tones; flat surfaces on the marker tones.
 *   - Brand-aligned tonal fills, not raw Tailwind palette. Soft fill +
 *     darker AA-readable ink (e.g. `#3a6b14` for success-lime on
 *     light surfaces).
 *   - Satoshi `font-medium` (500) — uppercase + 0.16em tracking reads
 *     editorial without needing bold.
 *
 * Tones map to MerchantBadge so card consumers can pass the badge
 * value through unchanged.
 */

export type TrendingPillShape = 'parallelogram' | 'pill'
export type TrendingPillTone =
    // ─── Marker tones (v1.0) — corner markers on hero imagery ─────────
    | 'trending'
    | 'new'
    | 'new-light'
    | 'featured'
    // ─── Status tones (v1.3+) — booking / availability state on cream ─
    | 'info'
    | 'success'
    | 'warning'
    | 'destructive'
    | 'neutral'
export type TrendingPillSize = 'sm' | 'md' | 'lg'

const wrapperVariants = cva(
    'inline-flex items-center justify-center font-medium uppercase tracking-[0.16em] select-none whitespace-nowrap',
    {
        variants: {
            shape: {
                parallelogram: '[transform:skewX(-12deg)] rounded-md',
                pill: 'rounded-full',
            },
            tone: {
                // ─── Marker tones — flat solid fills ─────────────────
                // Markers sit over hero photos and need to read against
                // arbitrary imagery — no ring, no tonal softness.
                trending: 'bg-autara-purple text-white',
                new: 'bg-[#0E0A1A] text-autara-lime-drive',
                'new-light':
                    'bg-[var(--color-autara-lime-bright)] text-[#0E0A1A] ring-1 ring-inset ring-[#0E0A1A]/15',
                featured: 'bg-white/95 text-[#0a0a0a]',

                // ─── Status tones — soft tonal pairs on cream ────────
                // Designed to surface multiple sibling pills (e.g. a
                // booking list with mixed statuses) without each one
                // overwhelming the row. Soft fill + AA-readable
                // accent ink + hairline ring keeps them legible at
                // 9–10 px while reading as one editorial family.
                info: 'bg-[rgba(78,27,189,0.08)] text-[var(--color-autara-purple)] ring-1 ring-inset ring-[rgba(78,27,189,0.22)]',
                success:
                    'bg-[rgba(183,225,73,0.18)] text-[#3a6b14] ring-1 ring-inset ring-[rgba(183,225,73,0.55)]',
                warning:
                    'bg-[rgba(245,166,35,0.12)] text-[var(--color-autara-warning-text)] ring-1 ring-inset ring-[rgba(245,166,35,0.35)]',
                destructive:
                    'bg-[rgba(221,56,56,0.1)] text-[var(--color-autara-error)] ring-1 ring-inset ring-[rgba(221,56,56,0.28)]',
                neutral:
                    'bg-[var(--surface-elevated)] text-[var(--text-muted)] ring-1 ring-inset ring-[var(--border-subtle)]',
            },
            size: {
                sm: 'px-2 py-0.5 text-[9px]',
                md: 'px-3 py-1 text-[10px]',
                lg: 'px-4 py-1.5 text-[12px]',
            },
        },
        defaultVariants: {
            shape: 'parallelogram',
            tone: 'trending',
            size: 'md',
        },
    }
)

export interface TrendingPillProps
    extends React.HTMLAttributes<HTMLDivElement>,
        VariantProps<typeof wrapperVariants> {
    /** Required — the marker has a label, not children. */
    label: string
    /** Optional icon (rendered before the label, inside the upright inner span). */
    icon?: React.ReactNode
}

const TrendingPill = React.forwardRef<HTMLDivElement, TrendingPillProps>(
    ({ className, shape, tone, size, label, icon, ...props }, ref) => {
        const resolvedShape: TrendingPillShape =
            (shape ?? 'parallelogram') as TrendingPillShape
        return (
            <div
                ref={ref}
                className={cn(wrapperVariants({ shape, tone, size }), className)}
                {...props}
            >
                <span
                    className={cn(
                        'inline-flex items-center gap-1',
                        resolvedShape === 'parallelogram' &&
                            '[transform:skewX(12deg)]'
                    )}
                >
                    {icon}
                    {label}
                </span>
            </div>
        )
    }
)
TrendingPill.displayName = 'TrendingPill'

export { TrendingPill, wrapperVariants as trendingPillVariants }
