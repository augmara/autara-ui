'use client'

import * as React from 'react'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { cn } from '../lib/cn'

/**
 * Checkbox — Radix checkbox primitive (AUTM-1594, canvas v44 "Checkbox").
 *
 * A 24px box at an 8px radius. **Unchecked**: paper with a 2px field edge.
 * **Checked**: the selected colour with its own ink for the check. The box
 * is 24px but its hit area is 44 (the AUTM-622 pseudo-element, as Switch).
 *
 * The check glyph is drawn in the Solar Bold style — rounded line
 * caps and a slightly heavier 2.4px stroke — to sit with Autara's
 * canonical icon set (see [[solar-icons-canonical]] memory). Avoid
 * dropping in Lucide-style sharp strokes here.
 *
 * The `theme` prop is preserved for source-level compatibility with
 * existing consumers (e.g. autara-merchant-web's local wrapper) but
 * is currently a **no-op** — both `'light'` and `'dark'` render the
 * same light treatment. Dark-surface companion deferred to a future
 * PR.
 */
const Checkbox = React.forwardRef<
    React.ComponentRef<typeof CheckboxPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> & {
        /** @deprecated currently a no-op — dark-surface companion deferred */
        theme?: 'dark' | 'light'
    }
>(({ className, theme: _theme, ...props }, ref) => (
    <CheckboxPrimitive.Root
        ref={ref}
        className={cn(
            'peer relative size-6 shrink-0 rounded-autara-sm border-2 transition-colors',
            "before:absolute before:left-1/2 before:top-1/2 before:size-11 before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']",
            'border-[var(--field-edge)] bg-[var(--paper)]',
            'hover:border-[var(--text-muted)]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'data-[state=checked]:border-transparent data-[state=checked]:bg-[var(--selected)] data-[state=checked]:text-[var(--on-selected)]',
            className
        )}
        {...props}
    >
        <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
            {/* Solar Bold-style check — rounded caps, ~2.4px stroke on 24×24 */}
            <svg
                aria-hidden
                viewBox="0 0 24 24"
                className="size-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.4}
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M5 12.5l4.5 4.5L19 7.5" />
            </svg>
        </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
