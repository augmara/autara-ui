import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../lib/cn'

/**
 * Card — the hairline-edged panel primitive.
 *
 * AUTM-934: `surface` is the default. It used to be `glass`, a dark-only
 * treatment (`bg-white/[0.03]` on `border-white/[0.06]`) that measures
 * 1.001:1 against the warm-cream canvas — i.e. a bare `<Card>` rendered
 * nothing a user could see. Every consumer had already learned to pass
 * `variant="light"` explicitly, which is exactly how a broken default
 * survives: nobody hits it twice, they just never stop working around it.
 *
 * `surface` carries the light treatment WITHOUT padding, so it composes
 * with `CardHeader` / `CardContent` / `CardFooter` (which bring their own
 * `p-6`) instead of double-padding them. `light` is `surface` + `p-7` and
 * is untouched — it is what the consumers pin today.
 *
 * The dark-surface variants (`glass`, `service`, `solid`, `outline`) are
 * kept under their existing names for marketing/photo surfaces. They are
 * now an explicit opt-in rather than something you get by forgetting.
 */
const cardVariants = cva('transition-all duration-[350ms]', {
    variants: {
        variant: {
            // ─── Themed — track the token ladder in both themes ───────
            // No padding: compose with CardHeader/Content/Footer.
            surface: [
                'rounded-autara-lg bg-[var(--surface)] text-[var(--text-strong)]',
                'border border-[var(--border-subtle)]',
                'hover:border-[var(--accent-border-soft)]',
            ].join(' '),
            // ─── Dark / photo surfaces — explicit opt-in ──────────────
            // `backdrop-blur` dropped per the house rule: depth comes from
            // the hairline border, never from blur or a drop shadow.
            glass: [
                'rounded-autara-lg bg-white/[0.03] border border-white/[0.06]',
                'hover:bg-white/[0.06] hover:border-autara-purple/30 hover:translate-y-[-2px]',
            ].join(' '),
            service: [
                'rounded-autara-lg bg-white/[0.03] border border-white/[0.06] p-6 cursor-pointer',
                'hover:bg-white/[0.07] hover:border-autara-purple/30 hover:translate-y-[-3px]',
            ].join(' '),
            outline: 'rounded-autara-lg border border-white/[0.08] bg-transparent',
            solid: 'rounded-autara-lg bg-white/[0.04] border border-white/[0.06]',
            // Light theme cards — Autara aesthetic ships shadow-free.
            // Depth comes from the 1px hairline border, lift on hover from
            // a border-color shift (purple/30). No box-shadow, no translate
            // — `translateY` on a card-shaped surface reads as "this card
            // is floating" which contradicts the editorial brand.
            light: [
                'rounded-autara-lg bg-[var(--surface)] p-7 text-[var(--text-strong)]',
                'border border-[var(--border-subtle)]',
                'hover:border-autara-purple/30',
            ].join(' '),
        },
    },
    defaultVariants: {
        // AUTM-934 — was 'glass' (dark-only, 1.001:1 on cream).
        variant: 'surface',
    },
})

export interface CardProps
    extends React.HTMLAttributes<HTMLDivElement>,
        VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, variant, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(cardVariants({ variant }), className)}
            {...props}
        />
    )
)
Card.displayName = 'Card'

const CardHeader = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn('flex flex-col space-y-1.5 p-6', className)}
        {...props}
    />
))
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn('text-lg font-bold leading-none tracking-tight', className)}
        {...props}
    />
))
CardTitle.displayName = 'CardTitle'

const CardDescription = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        /* AUTM-934 — was a hardcoded `text-white/35` with no variant axis,
           so CardDescription measured 1.02:1 on every light surface and was
           invisible everywhere, in both themes' light halves. `--text-muted`
           is the themed secondary-copy rung and clears 4.5:1 on `--surface`
           and `--surface-elevated` in both themes (see text-contrast.test.ts). */
        className={cn('text-sm text-[var(--text-muted)]', className)}
        {...props}
    />
))
CardDescription.displayName = 'CardDescription'

const CardContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
))
CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn('flex items-center p-6 pt-0', className)}
        {...props}
    />
))
CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, cardVariants }
