import { forwardRef, type ElementType, type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '../lib/cn'

/**
 * Reveal — a block that arrives once as it scrolls into view. No JavaScript.
 *
 * AUTM-1475. `ScrollReveal` (an IntersectionObserver toggling `.is-visible`)
 * and every consumer's local copy of the same idea share one defect: the
 * block is held at `opacity: 0` by CSS until a script runs, so any JS
 * failure, a crawler, or a still frame of the page sees nothing.
 *
 * This one is the reverse. The class does nothing by default, so server
 * HTML, a browser without the feature and a reduced-motion user all get the
 * content at rest. Only an engine that supports CSS scroll-driven animations
 * (Chromium 115+, Safari 26+) AND a user who has not asked for reduced
 * motion get the reveal, and it runs on the compositor with no listener:
 *
 *     .reveal-view { animation-timeline: view(); animation-range: entry 0% entry 38%; }
 *
 * It is a server component. Use it for one reveal per section on a
 * marketing page (rule 7: one-shot, cheap), never for content that must be
 * legible in a screenshot before the user scrolls to it — a hero is not
 * revealed, it is simply there.
 */
export interface RevealProps extends HTMLAttributes<HTMLElement> {
    /** Render as another element (`section`, `li`, `article`). */
    as?: ElementType
    children?: ReactNode
}

export const Reveal = forwardRef<HTMLElement, RevealProps>(function Reveal(
    { as, className, children, ...rest },
    ref
) {
    const Comp: ElementType = as ?? 'div'
    return (
        <Comp ref={ref} className={cn('reveal-view', className)} {...rest}>
            {children}
        </Comp>
    )
})

Reveal.displayName = 'Reveal'
