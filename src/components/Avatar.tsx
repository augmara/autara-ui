'use client'

import * as React from 'react'
import * as AvatarPrimitive from '@radix-ui/react-avatar'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../lib/cn'

const avatarVariants = cva(
    'relative flex shrink-0 overflow-hidden rounded-full',
    {
        variants: {
            size: {
                sm: 'h-8 w-8',
                md: 'h-10 w-10',
                lg: 'h-12 w-12',
                xl: 'h-16 w-16',
            },
        },
        defaultVariants: {
            size: 'md',
        },
    }
)

const Avatar = React.forwardRef<
    React.ComponentRef<typeof AvatarPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> & VariantProps<typeof avatarVariants>
>(({ className, size, ...props }, ref) => (
    <AvatarPrimitive.Root
        ref={ref}
        className={cn(avatarVariants({ size }), className)}
        {...props}
    />
))
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.forwardRef<
    React.ComponentRef<typeof AvatarPrimitive.Image>,
    React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
    <AvatarPrimitive.Image
        ref={ref}
        className={cn('aspect-square h-full w-full object-cover', className)}
        {...props}
    />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

/**
 * AUTM-975 — `theme` defaulted to `'dark'`, so a bare `<AvatarFallback>` put
 * `text-white/70` initials on a 20%-purple wash over the cream canvas and the
 * letters all but vanished. `Button.stories.tsx` renders exactly that shape.
 *
 * The default is now `'light'`. Read that name as "the themed branch", not as
 * "light mode" — `'dark'` is the STATIC ink opt-in for a photo or marketing
 * surface, and the theme itself is handled by the tokens either way. The
 * value names are published API, so they stay.
 *
 * Every known consumer call site already passes `theme="light"` explicitly
 * (merchant-mobile: TopBar, CustomerCard, CustomerDetailScreen, MeScreen), so
 * this flip changes no pixel that ships today — it fixes what a NEW caller
 * gets for writing the obvious thing.
 *
 * AUTM-936 — the themed branch now paints `--accent-fill` / `--on-accent`.
 * It previously used `bg-autara-purple-50` / `text-autara-purple`: a static
 * Tailwind ramp that does not track the theme, plus fill-grade purple used as
 * ink. In dark mode that rendered a bright pale disc on a near-black card, and
 * all four merchant-mobile call sites shipped it (TopBar, CustomerCard,
 * CustomerDetailScreen, MeScreen).
 *
 * The replacement is a solid fill with its own ink rather than a tint, which
 * is rule 4 and matches ModeChip's `--neutral-fill` / `--on-neutral`. Measured
 * on the token values: white on `#4e1bbd` is 9.48:1 in light, white on
 * `#6d3dd4` is 6.43:1 in dark — both clear AA, and the disc now moves with the
 * theme instead of staying a fixed lavender.
 *
 * This DOES change shipped pixels on those four call sites: a pale disc with
 * purple initials becomes a solid purple disc with white initials. That is the
 * intended correction, not a side effect.
 */
const AvatarFallback = React.forwardRef<
    React.ComponentRef<typeof AvatarPrimitive.Fallback>,
    React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback> & { theme?: 'dark' | 'light' }
>(({ className, theme = 'light', ...props }, ref) => (
    <AvatarPrimitive.Fallback
        ref={ref}
        className={cn(
            'flex h-full w-full items-center justify-center rounded-full text-sm font-medium',
            theme === 'dark'
                ? 'bg-autara-purple/20 text-white/70'
                : 'bg-[var(--accent-fill)] text-[var(--on-accent)]',
            className
        )}
        {...props}
    />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

export { Avatar, AvatarImage, AvatarFallback, avatarVariants }
