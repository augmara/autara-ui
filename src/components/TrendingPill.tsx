import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../lib/cn'

/**
 * TrendingPill — the corner marker that sits over a hero image
 * (MerchantCard, ServiceCard) or floats alongside a section heading.
 *
 * Default shape is a higgsfield-style parallelogram: the wrapper is
 * skewed `-12deg`, an inner `<span>` counter-skews `+12deg` so the
 * label sits upright while the background reads as a tilted slab. The
 * `pill` shape is available for surfaces where the slanted edge would
 * crowd adjacent UI (chat composer, very narrow rails).
 *
 * Tones map to MerchantBadge so card consumers can pass the badge
 * value through unchanged.
 */

export type TrendingPillShape = 'parallelogram' | 'pill'
export type TrendingPillTone = 'trending' | 'new' | 'featured'
export type TrendingPillSize = 'sm' | 'md' | 'lg'

const wrapperVariants = cva(
    'inline-flex items-center justify-center font-semibold uppercase tracking-[0.16em] select-none whitespace-nowrap',
    {
        variants: {
            shape: {
                parallelogram: '[transform:skewX(-12deg)] rounded-md',
                pill: 'rounded-full',
            },
            tone: {
                trending: 'bg-autara-purple text-white',
                new: 'bg-[#0E0A1A] text-autara-lime-drive',
                featured: 'bg-white/95 text-[#0a0a0a]',
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
