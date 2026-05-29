'use client'

import * as React from 'react'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { cn } from '../lib/cn'

/**
 * Checkbox — Radix checkbox primitive styled for the cream canvas.
 *
 * **Unchecked**: surface fill with a hairline `--border-subtle` edge.
 * **Checked**: autara-purple fill + white check.
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
            'peer h-[18px] w-[18px] shrink-0 rounded-[4px] border transition-colors',
            'border-[var(--border-subtle)] bg-[var(--surface)]',
            'hover:border-[var(--color-autara-purple)]/35',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-autara-purple/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'data-[state=checked]:bg-[var(--color-autara-purple)] data-[state=checked]:border-[var(--color-autara-purple)] data-[state=checked]:text-white',
            className
        )}
        {...props}
    >
        <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
            {/* Solar Bold-style check — rounded caps, ~2.4px stroke on 24×24 */}
            <svg
                aria-hidden
                viewBox="0 0 24 24"
                className="h-[12px] w-[12px]"
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
