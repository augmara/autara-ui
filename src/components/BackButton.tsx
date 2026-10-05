'use client'

import {
    cloneElement,
    forwardRef,
    isValidElement,
    type ButtonHTMLAttributes,
    type ReactElement,
    type ReactNode,
} from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '../lib/cn'

/**
 * BackButton — the unified back affordance (AUTM-365).
 *
 * Generalised from the merchant app's local BackButton
 * (autara-merchant-mobile/src/components/BackButton.tsx) so every
 * surface renders the same anatomy:
 *
 *   - AUTM-1756: the icon disc, as IconButton draws it: a FILLED 44px
 *     circle (48px to a finger) in `--icon-disc` with a white 20px chevron.
 *     It was a 40px hairline ring on cream, which Don read as a bare icon
 *     ("every button should have that vibe, don't show only the icon").
 *     `tone="onbrand"` is the white disc for purple grounds.
 *   - Solar AltArrowLeft-style Linear glyph, inlined (autara-ui must
 *     not depend on @solar-icons/react)
 *   - Hover and press step the disc's fill
 *   - Soft purple focus ring
 *   - The disc itself is the 44px hit area
 *
 * Optional `label` renders a context word ("Bookings", "Menu") beside
 * the circle inside the SAME interactive element, so the label grows
 * the tap target instead of sitting next to it as dead text.
 *
 * Polymorphic via Radix `Slot` (asChild) — compose with a framework
 * Link. autara-ui never imports next/link or react-router-dom. Unlike
 * Button, the visual content is intrinsic, so pass the link element
 * EMPTY and BackButton fills it:
 *
 *   <BackButton asChild label="Bookings">
 *     <Link href="/account/bookings" />
 *   </BackButton>
 *
 * Native shells that need extra behaviour (haptics, history pop) keep
 * a thin app-side wrapper and compose this for the visuals.
 */

export interface BackButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    /** Context label rendered beside the circle, inside the tap target. */
    label?: string
    /** Accessible name when icon-only. Ignored when `label` is set. */
    ariaLabel?: string
    /** Compose with another component (e.g. framework Link) via Radix Slot. */
    asChild?: boolean
    /** The disc's fill (AUTM-1756): `neutral` (default) or `onbrand` on purple. */
    tone?: 'neutral' | 'onbrand'
}

const ChevronGlyph = () => (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
            d="M15 19l-7-7 7-7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
)

export const BackButton = forwardRef<HTMLButtonElement, BackButtonProps>(
    function BackButton({ label, ariaLabel = 'Back', asChild, tone = 'neutral', className, children, ...rest }, ref) {
        const Comp = asChild ? Slot : 'button'

        const content = (
            <>
                <span
                    aria-hidden
                    data-tone={tone}
                    /* AUTM-1756: IconButton's disc, filled, 44px (48px to a
                       finger), so the circle is the hit area. */
                    className={cn(
                        'relative grid size-11 shrink-0 place-items-center rounded-full pointer-coarse:size-12',
                        'transition-colors',
                        tone === 'onbrand'
                            ? 'bg-[var(--icon-disc-onbrand)] text-[var(--on-icon-disc-onbrand)] group-hover:bg-[var(--icon-disc-onbrand-hover)] group-active:bg-[var(--icon-disc-onbrand-press)]'
                            : 'bg-[var(--icon-disc)] text-[var(--on-icon-disc)] group-hover:bg-[var(--icon-disc-hover)] group-active:bg-[var(--icon-disc-press)]',
                    )}
                >
                    <ChevronGlyph />
                </span>
                {label ? (
                    <span className="text-sm font-medium text-[var(--text-muted)] transition-colors group-hover:text-[var(--text-strong)]">
                        {label}
                    </span>
                ) : null}
            </>
        )

        /* With asChild the consumer passes the link element EMPTY; its
           children become our intrinsic content so Slot can merge the
           root props onto it. */
        const slotted =
            asChild && isValidElement(children)
                ? cloneElement(children as ReactElement<{ children?: ReactNode }>, undefined, content)
                : content

        return (
            <Comp
                ref={ref}
                aria-label={label ? undefined : ariaLabel}
                className={cn(
                    'group motion-press inline-flex min-h-11 items-center gap-2.5 rounded-full',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]',
                    className,
                )}
                {...(asChild ? rest : { type: 'button' as const, ...rest })}
            >
                {slotted}
            </Comp>
        )
    },
)

BackButton.displayName = 'BackButton'
