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
 *   - 40×40 circle, hairline border, cream surface, ink chevron
 *   - Solar AltArrowLeft-style Linear glyph, inlined (autara-ui must
 *     not depend on @solar-icons/react)
 *   - Hover bumps the border + chevron to brand purple
 *   - Soft purple focus ring
 *   - Effective hit area ≥44px (`before:` inset extension + min-h-11
 *     root), per the cross-stack tap-target rule
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
}

const ChevronGlyph = () => (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
            d="M15 19l-7-7 7-7"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
)

export const BackButton = forwardRef<HTMLButtonElement, BackButtonProps>(
    function BackButton({ label, ariaLabel = 'Back', asChild, className, children, ...rest }, ref) {
        const Comp = asChild ? Slot : 'button'

        const content = (
            <>
                <span
                    aria-hidden
                    /* before:-inset-0.5 pads the hit area to 44px around the
                       40px circle without changing the rendered size. */
                    className={cn(
                        'relative grid h-10 w-10 shrink-0 place-items-center rounded-full',
                        'border border-[var(--border-subtle)] bg-[var(--surface)] text-[var(--text-strong)]',
                        'transition-colors group-hover:border-[rgba(78,27,189,0.35)] group-hover:text-[var(--color-autara-purple)]',
                        "before:absolute before:-inset-0.5 before:rounded-full before:content-['']",
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
                    'group inline-flex min-h-11 items-center gap-2.5 rounded-full',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-autara-purple)]/35',
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
