'use client'

import * as React from 'react'
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import { cn } from '../lib/cn'

/**
 * RadioGroup / RadioGroupItem — Radix radio primitive styled for the
 * cream canvas. Mirrors the Checkbox grammar: hairline `--border-subtle`
 * unchecked, autara-purple border + inner dot when checked.
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
            'aspect-square h-[18px] w-[18px] rounded-full border transition-colors',
            'border-[var(--border-subtle)] bg-[var(--surface)]',
            'hover:border-[var(--color-autara-purple)]/35',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-autara-purple/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'data-[state=checked]:border-[var(--color-autara-purple)]',
            className
        )}
        {...props}
    >
        <RadioGroupPrimitive.Indicator className="flex h-full w-full items-center justify-center">
            <span className="block h-[8px] w-[8px] rounded-full bg-[var(--color-autara-purple)]" />
        </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
))
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

export { RadioGroup, RadioGroupItem }
