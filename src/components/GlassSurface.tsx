import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '../lib/cn'

/**
 * GlassSurface — the one glass material every other surface composes.
 *
 * AUTM-948, for the Autara Glass direction Don settled on 2026-09-01
 * (`knowledge/project_ui_direction_2026_09_01.md`). Translucent fill +
 * `backdrop-filter: blur() saturate()` + a **1px inset top highlight**. The
 * highlight is load-bearing: strip it and the panel reads as flat grey.
 *
 * It exists so components stop hand-rolling `backdrop-filter`. Before this,
 * `Card variant="glass"`, `.glass-card`, `.nav-glass` and `.merchant-form`
 * each carried their own blur value and their own idea of the fill — three
 * of the four had drifted, and one of them (`.glass-card`) had no blur at
 * all despite the name. Retuning the material is now one line in
 * `tokens/glass.css`.
 *
 * ─── Two things to know before you reach for it ─────────────────────────
 *
 * **`backdrop-filter` creates a containing block for `position: fixed`
 * descendants.** AUTM-721 is exactly this bug: merchant-web's blurred
 * header made a fixed-position mobile menu resolve against the header
 * rather than the viewport, and the menu collapsed to a one-line strip.
 * Portal floating UI to `document.body`; never nest a fixed panel inside a
 * glass surface.
 *
 * **It is GPU work, per surface, per frame.** A long booking list on the
 * iPad Pro 11" is where it drops frames first. Pass `blur={false}` inside
 * lists — the material still reads correct at row density, because at that
 * size the frost was never visible anyway. Every blurring surface carries
 * `data-glass="blur"` so a device test can count them:
 * `document.querySelectorAll('[data-glass="blur"]').length`.
 *
 * ─── Contrast ───────────────────────────────────────────────────────────
 *
 * `tone="default"` is measured to keep every text token above 4.5:1 over
 * every gradient bloom in both themes (worst cell: dark `--text-subtle`
 * over an aqua bloom, 5.02:1). `tone="strong"` is for surfaces carrying
 * dense body text — admin's light-mode tables are the hardest case in the
 * system and this is the token that answers them.
 *
 * Glass is meaningless on a flat canvas. Render it on `.gradient-ground`.
 */

export interface GlassSurfaceProps extends HTMLAttributes<HTMLDivElement> {
    /**
     * `strong` raises the fill for surfaces carrying dense body text
     * (tables, long lists, anything read rather than scanned).
     */
    tone?: 'default' | 'strong'
    /**
     * Set `false` inside long or virtualised lists to drop the
     * `backdrop-filter` and its per-frame GPU cost. The fill, edge and
     * highlight stay, so it still reads as the same material.
     */
    blur?: boolean
    /** Hover raises the fill and the edge. Never a translate, never a shadow. */
    interactive?: boolean
    /** Compose onto another element (`<section>`, a framework Link) via Radix Slot. */
    asChild?: boolean
    children?: ReactNode
}

export const GlassSurface = forwardRef<HTMLDivElement, GlassSurfaceProps>(
    function GlassSurface(
        {
            tone = 'default',
            blur = true,
            interactive,
            asChild,
            className,
            children,
            ...rest
        },
        ref
    ) {
        const Comp = asChild ? Slot : 'div'
        return (
            <Comp
                ref={ref}
                /* Lets a device test find every blurring surface on a page
                 * without knowing which components produced them. */
                data-glass={blur ? 'blur' : 'flat'}
                className={cn(
                    'glass-surface',
                    tone === 'strong' && 'glass-surface--strong',
                    !blur && 'glass-surface--flat',
                    interactive && 'glass-surface--interactive',
                    className
                )}
                {...rest}
            >
                {children}
            </Comp>
        )
    }
)

GlassSurface.displayName = 'GlassSurface'

/**
 * GradientGround — the three blurred core-gradient blooms glass sits on.
 *
 * Consumers normally paint this on the app shell, once. It is exported so
 * Storybook and any surface that owns its own full-bleed background can use
 * the same values rather than re-deriving three radial gradients by hand.
 *
 * Cheap: one paint, no per-frame work. The ground is not the performance
 * risk — the blur on top of it is.
 */
export interface GradientGroundProps extends HTMLAttributes<HTMLDivElement> {
    asChild?: boolean
    children?: ReactNode
}

export const GradientGround = forwardRef<HTMLDivElement, GradientGroundProps>(
    function GradientGround({ asChild, className, children, ...rest }, ref) {
        const Comp = asChild ? Slot : 'div'
        return (
            <Comp ref={ref} className={cn('gradient-ground', className)} {...rest}>
                {children}
            </Comp>
        )
    }
)

GradientGround.displayName = 'GradientGround'
