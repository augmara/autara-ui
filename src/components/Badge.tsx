import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../lib/cn'

/**
 * Badge — the inline pill used for status, category, and credibility
 * markers on cards, headers, and hero surfaces.
 *
 * Variants come in **dark** and **light** pairs so the same semantic
 * intent (e.g. "success") reads correctly on photo / ink surfaces
 * AND on the warm-cream canvas. The `light-*` set replaces the older
 * raw-tailwind palette (`bg-green-50 text-green-700` etc.) with the
 * brand-aligned ink — same vocabulary as the refreshed `MetaChip`.
 *
 * Pair the `new` marker with `TrendingPill tone="new-light"` when
 * surfacing newly-listed merchants or services on the cream canvas.
 * The dark-surface companion is deferred to a future PR.
 */
const badgeVariants = cva(
    'inline-flex items-center font-medium transition-colors',
    {
        variants: {
            variant: {
                // ─── Dark theme — for photo / ink surfaces ───────────────
                default:
                    'rounded-full border border-white/[0.08] bg-white/[0.04] text-white/60 px-3 py-1 text-xs',
                primary:
                    'rounded-full border border-autara-purple/30 bg-autara-purple/10 text-autara-purple-lighter px-3 py-1 text-xs',
                aqua:
                    'rounded-full border border-autara-sky-aqua/30 bg-autara-sky-aqua/10 text-autara-sky-aqua px-3 py-1 text-xs',
                lime:
                    'rounded-full border border-autara-lime-drive/30 bg-autara-lime-drive/10 text-autara-lime-drive px-3 py-1 text-xs',
                success:
                    'rounded-full border border-autara-success/30 bg-autara-success/10 text-autara-success px-3 py-1 text-xs',
                warning:
                    'rounded-full border border-autara-warning/30 bg-autara-warning/10 text-autara-warning px-3 py-1 text-xs',
                destructive:
                    'rounded-full border border-autara-error/30 bg-autara-error/10 text-autara-error px-3 py-1 text-xs',
                // Section pill — matches .section-pill exactly
                pill:
                    'rounded-autara-full border border-white/[0.1] bg-white/[0.04] text-white/60 px-4 py-1.5 text-[13px] tracking-[0.02em]',
                // Live status pill — matches hero badge
                live:
                    'rounded-full border border-autara-lime-drive/20 bg-autara-lime-drive/10 text-autara-lime-drive px-4 py-1.5 text-xs tracking-wide gap-2',

                // ─── Light theme — for cream / surface canvas ────────────
                // Refresh: brand-aligned tokens replace the raw tailwind
                // green-50 / yellow-50 / red-50 trio. Same border + fill
                // grammar as `MetaChip` so the two read as one family.
                'light-default':
                    'rounded-full border border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-[var(--text-muted)] px-3 py-1 text-xs',
                'light-primary':
                    'rounded-full border border-[rgba(78,27,189,0.22)] bg-[rgba(78,27,189,0.08)] text-[var(--color-autara-purple)] px-3 py-1 text-xs',
                'light-success':
                    'rounded-full border border-[rgba(183,225,73,0.55)] bg-[rgba(183,225,73,0.18)] text-[#3a6b14] px-3 py-1 text-xs',
                'light-warning':
                    'rounded-full border border-[rgba(245,166,35,0.35)] bg-[rgba(245,166,35,0.12)] text-[var(--color-autara-warning-text)] px-3 py-1 text-xs',
                'light-destructive':
                    'rounded-full border border-[rgba(221,56,56,0.28)] bg-[rgba(221,56,56,0.1)] text-[var(--color-autara-error)] px-3 py-1 text-xs',

                // ─── Editorial marker — `new` ────────────────────────────
                // Counterpart to MetaChip / TrendingPill of the same name.
                // Use for "NEW", "JUST IN", "FRESH" — not for status.
                // Dark-surface companion deferred to a future PR.
                new:
                    'rounded-full border border-[#0E0A1A]/15 bg-[var(--color-autara-lime-bright)] text-[#0E0A1A] px-3 py-1 text-xs uppercase tracking-[0.14em]',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
)

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
        VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
    ({ className, variant, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(badgeVariants({ variant }), className)}
            {...props}
        />
    )
)
Badge.displayName = 'Badge'

export { Badge, badgeVariants }
