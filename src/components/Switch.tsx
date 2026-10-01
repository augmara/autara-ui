'use client'

import * as React from 'react'
import * as SwitchPrimitive from '@radix-ui/react-switch'
import { cn } from '../lib/cn'

/**
 * Switch — Radix switch primitive (AUTM-1594, canvas v44 "Switch").
 *
 * A 52 x 32 track with a 24px white thumb 4px in. **Off**: band with the
 * field edge. **On**: the selected colour (#2e1070, #8f6bff in dark). No
 * shadow on the thumb: depth is the track's contrast.
 *
 * The `theme` prop is preserved for source-level compatibility with
 * existing consumers (e.g. autara-merchant-web's local wrapper) but
 * is currently a **no-op** — both `'light'` and `'dark'` render the
 * same light treatment. The dark-surface companion is deferred to a
 * future PR; call sites that pass `theme="dark"` will simply render
 * in the light grammar until that lands.
 */
const Switch = React.forwardRef<
    React.ComponentRef<typeof SwitchPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> & {
        /** @deprecated currently a no-op — dark-surface companion deferred */
        theme?: 'dark' | 'light'
    }
>(({ className, theme: _theme, ...props }, ref) => (
    <SwitchPrimitive.Root
        className={cn(
            'peer relative inline-flex h-8 w-13 shrink-0 cursor-pointer items-center rounded-full border transition-colors',
            /* AUTM-622 — a 44x44 hit area WITHOUT changing the painted
             * control. A switch is 24px tall by design; that is the shape
             * people recognise, so growing the box would fix the target and
             * break the component. The pseudo-element is centred, covers the
             * 44px floor in both axes, and paints nothing.
             *
             * `content-['']` is required — a ::before with no content
             * generates no box at all and the whole rule silently does
             * nothing, which is the version of this that measures as fixed
             * and still misses at 24px. */
            'before:absolute before:left-1/2 before:top-1/2 before:h-11 before:w-13',
            "before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']",
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'border-[var(--field-edge)] bg-[var(--band)]',
            'data-[state=checked]:border-transparent data-[state=checked]:bg-[var(--selected)]',
            className
        )}
        {...props}
        ref={ref}
    >
        <SwitchPrimitive.Thumb
            className={cn(
                // 3px + the 1px border = 4px in; 52 - 2 - 24 - 3 = 23px when on.
                'pointer-events-none block size-6 translate-x-[3px] rounded-full bg-white ring-0 transition-transform',
                'data-[state=checked]:translate-x-[23px]'
            )}
        />
    </SwitchPrimitive.Root>
))
Switch.displayName = SwitchPrimitive.Root.displayName

export { Switch }
