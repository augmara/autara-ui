'use client'

import * as React from 'react'
import * as SwitchPrimitive from '@radix-ui/react-switch'
import { cn } from '../lib/cn'

/**
 * Switch — Radix switch primitive styled for the Autara cream canvas.
 *
 * **Unchecked**: surface-elevated track with a hairline border.
 * **Checked**: autara-purple track. Thumb is a clean white pill — no
 * drop shadow (depth comes from the track contrast, per the Autara
 * house rule against `box-shadow`).
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
            'peer inline-flex h-[24px] w-[44px] shrink-0 cursor-pointer items-center rounded-full border transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-autara-purple/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'border-[var(--border-subtle)] bg-[var(--surface-elevated)]',
            'data-[state=checked]:border-autara-purple data-[state=checked]:bg-autara-purple',
            className
        )}
        {...props}
        ref={ref}
    >
        <SwitchPrimitive.Thumb
            className={cn(
                'pointer-events-none block h-[18px] w-[18px] translate-x-[2px] rounded-full bg-white ring-0 transition-transform',
                'data-[state=checked]:translate-x-[22px]'
            )}
        />
    </SwitchPrimitive.Root>
))
Switch.displayName = SwitchPrimitive.Root.displayName

export { Switch }
