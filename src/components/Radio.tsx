'use client'

import * as React from 'react'
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import { cn } from '../lib/cn'

/**
 * RadioGroup / RadioGroupItem — Radix radio primitive (AUTM-1594, canvas
 * v44 "Radio"). A 24px circle: a 2px field edge unchecked; checked, a 7px
 * ring in the selected colour around a paper centre. Mirrors Checkbox, with
 * the same 44px hit area around the 24px control.
 *
 * The `theme` prop on the item is preserved for source-level
 * compatibility but is currently a **no-op** — dark-surface companion
 * deferred to a future PR.
 */
const RadioGroup = React.forwardRef<
    React.ComponentRef<typeof RadioGroupPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => (
    <RadioGroupPrimitive.Root
        className={cn('grid gap-2', className)}
        {...props}
        ref={ref}
    />
))
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName

const RadioGroupItem = React.forwardRef<
    React.ComponentRef<typeof RadioGroupPrimitive.Item>,
    React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> & {
        /** @deprecated currently a no-op — dark-surface companion deferred */
        theme?: 'dark' | 'light'
    }
>(({ className, theme: _theme, ...props }, ref) => (
    <RadioGroupPrimitive.Item
        ref={ref}
        className={cn(
            'relative aspect-square size-6 shrink-0 rounded-full border-2 transition-[border-color,border-width]',
            "before:absolute before:left-1/2 before:top-1/2 before:size-11 before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']",
            'border-[var(--field-edge)] bg-[var(--paper)]',
            'hover:border-[var(--text-muted)]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'data-[state=checked]:border-[7px] data-[state=checked]:border-[var(--selected)]',
            className
        )}
        {...props}
    >
        {/* The checked state is the 7px ring itself; the indicator paints
            nothing but keeps Radix's checked/unchecked structure intact. */}
        <RadioGroupPrimitive.Indicator className="sr-only" />
    </RadioGroupPrimitive.Item>
))
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

export { RadioGroup, RadioGroupItem }
