import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../lib/cn'

/**
 * Card — the panel primitive. Glass by default.
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
const cardVariants = cva('transition-all duration-[350ms]', {
    variants: {
        variant: {
            // ─── The house material ──────────────────────────────────
            // Composes the ONE glass implementation rather than
            // re-deriving a blur value here. `rounded-autara-lg` and the
            // fill/edge/highlight all come from `.glass-surface`.
            glass: 'glass-surface glass-surface--interactive',

            // ─── Opaque twin — same ladder, no GPU cost ──────────────
            // Also what `.glass-surface` collapses to under
            // `prefers-reduced-transparency: reduce`, so the two stay
            // visually consistent by construction.
            surface: [
                'rounded-autara-lg bg-[var(--surface)] text-[var(--text-strong)]',
                'border border-[var(--glass-edge)]',
                'shadow-[inset_0_1px_0_var(--glass-hi)]',
                'hover:border-[var(--glass-edge-hi)]',
            ].join(' '),

            // Glass without the blur — for rows inside a long list. Keeps
            // the fill, edge and highlight so it reads as the same family.
            'glass-flat': [
                'glass-surface glass-surface--flat glass-surface--interactive',
            ].join(' '),

            // ─── Legacy names, moved onto the ladder ─────────────────
            // No `hover:translate-y` any more: a card-shaped surface that
            // floats on hover contradicts the brand (buttons may translate,
            // cards may not).
            service: [
                'glass-surface glass-surface--flat glass-surface--interactive',
                'p-6 cursor-pointer',
            ].join(' '),
            outline:
                'rounded-autara-lg border border-[var(--glass-edge)] bg-transparent text-[var(--text-strong)]',
            solid: [
                'rounded-autara-lg bg-[var(--surface-elevated)] text-[var(--text-strong)]',
                'border border-[var(--glass-edge)]',
            ].join(' '),

            // ─── UNTOUCHED — what consumers pin ──────────────────────
            // Autara ships shadow-free. Depth is the hairline border; lift
            // on hover is a border-colour shift. No box-shadow, no translate.
            light: [
                'rounded-autara-lg bg-[var(--surface)] p-7 text-[var(--text-strong)]',
                'border border-[var(--border-subtle)]',
                'hover:border-autara-purple/30',
            ].join(' '),
        },
    },
    defaultVariants: {
        // AUTM-948 — back to 'glass', but glass that actually renders.
        // AUTM-934 had moved it to 'surface' when glass was 1.001:1.
        variant: 'glass',
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
