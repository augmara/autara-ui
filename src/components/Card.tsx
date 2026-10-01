import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../lib/cn'

/**
 * Card — the panel primitive.
 *
 * ─── AUTM-1594: canvas v44 "Surfaces" ───────────────────────────────────
 *
 * Band cards on paper, raised rows inside band cards, one brand-deep hero per
 * screen. Radius 24 for cards. No shadows and no outlines: depth is the step
 * between paper, band and raised. So:
 *
 *   band    (default) the card: band, 24px
 *   hero    brand-deep (brand in dark: --hero) with on-deep ink, one per screen
 *   raised  a row or a card sitting on band: raised, 16px
 *
 * The glass variants below are retired by the sheet. Each still renders, as
 * a band card, so a consumer bump changes the look and nothing else; the
 * history that follows explains how glass got here and is kept as record.
 *
 * ─── AUTM-948 reworks AUTM-934 ──────────────────────────────────────────
 *
 * AUTM-934 measured the `glass` default at **1.001:1** against the canvas —
 * a bare `<Card>` rendered nothing a user could see — and proposed replacing
 * it with an opaque surface. The finding stands. The remedy changed on
 * 2026-09-01 when Don settled the Autara Glass direction: the fix is a
 * CORRECT glass treatment, not an opaque fallback
 * (`knowledge/project_ui_direction_2026_09_01.md`).
 *
 * What was actually wrong with the old `glass` was not that it was glass. It
 * was that it was `bg-white/[0.03]` with no top highlight — white-on-cream at
 * 3% is invisible, and 3% white over a dark canvas is a grey box, because the
 * 1px inset highlight that makes glass read as glass was never there. It also
 * carried no `backdrop-filter` at all after an earlier pass stripped it as a
 * "smell".
 *
 * `glass` now renders `.glass-surface`: themed translucent fill +
 * `backdrop-filter: blur() saturate()` + the inset top highlight, measured to
 * keep every text token above 4.5:1 over every gradient bloom in both themes.
 *
 * ─── The variants ───────────────────────────────────────────────────────
 *
 *   `glass`   (default) — the house material. No padding: composes with
 *                         CardHeader / CardContent / CardFooter, each of
 *                         which brings its own `p-6`.
 *   `surface`           — the opaque twin. Reach for it inside long or
 *                         virtualised lists, where `backdrop-filter` is
 *                         per-frame GPU work and the frost is invisible at
 *                         row density anyway.
 *   `light`             — `surface` + `p-7`. UNTOUCHED. This is the variant
 *                         every consumer pins today (6 call sites in
 *                         merchant-web); it is byte-for-byte what it was.
 *   `solid` / `outline` / `service` — legacy names, previously static
 *                         `bg-white/[0.0x]` treatments that measured ~1.00:1
 *                         on the cream canvas. Zero consumers use them (audited
 *                         across merchant-web, customer-web, merchant-mobile and
 *                         admin), so they are moved onto the token ladder rather
 *                         than left broken under a name someone might reach for.
 *
 * Glass is meaningless on a flat canvas — render Cards on `.gradient-ground`.
 * See `GlassSurface` for the two gotchas that come with `backdrop-filter`
 * (fixed-position containing block, GPU cost).
 */
const BAND = 'rounded-[1.5rem] bg-[var(--band)] text-[var(--text-strong)]'

const cardVariants = cva('transition-colors', {
    variants: {
        variant: {
            band: BAND,
            hero: 'rounded-[1.5rem] bg-[var(--hero)] text-[var(--on-deep)]',
            raised: 'rounded-2xl bg-[var(--raised)] text-[var(--text-strong)]',
            // Retired by the sheet: each renders as a band card.
            glass: BAND,
            'glass-flat': BAND,
            surface: BAND,
            solid: BAND,
            outline: BAND,
            light: `${BAND} p-7`,
            service: `${BAND} cursor-pointer p-6 hover:bg-[var(--band-press)]`,
        },
    },
    defaultVariants: {
        variant: 'band',
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
        // AUTM-1594: 20px in, 10px between title and description, as the sheet.
        className={cn('flex flex-col gap-2.5 p-5', className)}
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
        className={cn('text-lg font-bold leading-snug', className)}
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
        className={cn('text-[0.9375rem] leading-normal text-[var(--text-muted)]', className)}
        {...props}
    />
))
CardDescription.displayName = 'CardDescription'

const CardContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-5 pt-0', className)} {...props} />
))
CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn('flex items-center p-5 pt-0', className)}
        {...props}
    />
))
CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, cardVariants }
