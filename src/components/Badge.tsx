import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../lib/cn'

const badgeVariants = cva(
    'inline-flex items-center font-medium transition-colors',
    {
        variants: {
            variant: {
                // Dark theme
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
                // Light theme
                'light-default':
                    'rounded-full border border-autara-gray-200 bg-autara-gray-50 text-autara-gray-600 px-3 py-1 text-xs',
                'light-primary':
                    'rounded-full border border-autara-purple-100 bg-autara-purple-50 text-autara-purple px-3 py-1 text-xs',
                'light-success':
                    'rounded-full border border-green-200 bg-green-50 text-green-700 px-3 py-1 text-xs',
                'light-warning':
                    'rounded-full border border-yellow-200 bg-yellow-50 text-yellow-700 px-3 py-1 text-xs',
                'light-destructive':
                    'rounded-full border border-red-200 bg-red-50 text-red-700 px-3 py-1 text-xs',
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
