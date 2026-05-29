'use client'

import * as React from 'react'
import * as SelectPrimitive from '@radix-ui/react-select'
import { cn } from '../lib/cn'

/**
 * Select — Radix select primitive in the Autara cream-canvas grammar.
 *
 * - **Trigger**: 44 high, hairline `--border-subtle`, `--surface` fill,
 *   ink text, Solar Bold chevron. 4 px brand-purple halo on focus —
 *   same focus grammar as `Input` so triggers and inputs read as one
 *   field family.
 * - **Content**: portaled, hairline edge, no drop shadow, no backdrop
 *   blur (Autara house rule).
 * - **Item**: muted text → ink on hover/focus; checked item carries a
 *   brand-purple tint + Solar Bold check on the right.
 * - **Label / Separator**: editorial uppercase eyebrow / `--border-subtle`
 *   hairline.
 *
 * The `theme` prop on Trigger and Content is preserved for source-
 * level compatibility with merchant-web's local Select wrapper, but
 * is currently a **no-op** — only the light treatment ships. A dark-
 * surface companion is deferred.
 */
const Select = SelectPrimitive.Root
const SelectGroup = SelectPrimitive.Group
const SelectValue = SelectPrimitive.Value

const ChevronIcon: React.FC = () => (
    <svg
        aria-hidden
        viewBox="0 0 24 24"
        width="14"
        height="14"
        className="text-[var(--text-subtle)]"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M6 9l6 6 6-6" />
    </svg>
)

const CheckIcon: React.FC = () => (
    <svg
        aria-hidden
        viewBox="0 0 24 24"
        width="14"
        height="14"
        className="text-[var(--color-autara-purple)]"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
)

const SelectTrigger = React.forwardRef<
    React.ComponentRef<typeof SelectPrimitive.Trigger>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> & {
        /** @deprecated currently a no-op — dark companion deferred */
        theme?: 'dark' | 'light'
    }
>(({ className, children, theme: _theme, ...props }, ref) => (
    <SelectPrimitive.Trigger
        ref={ref}
        className={cn(
            'flex h-11 w-full items-center justify-between gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface)] px-3.5 text-sm text-[var(--text-strong)] outline-none transition-colors',
            'placeholder:text-[var(--text-subtle)]',
            'hover:border-[rgba(17,24,39,0.18)]',
            'data-[placeholder]:text-[var(--text-subtle)]',
            'focus-visible:border-[var(--color-autara-purple)] focus-visible:[box-shadow:0_0_0_4px_rgba(78,27,189,0.10)]',
            'data-[state=open]:border-[var(--color-autara-purple)] data-[state=open]:[box-shadow:0_0_0_4px_rgba(78,27,189,0.10)]',
            'aria-invalid:border-[var(--color-autara-error)] aria-invalid:[box-shadow:0_0_0_4px_rgba(221,56,56,0.10)]',
            'disabled:cursor-not-allowed disabled:bg-[var(--surface-warm)] disabled:text-[var(--text-subtle)]',
            '[&>span]:line-clamp-1',
            className
        )}
        {...props}
    >
        {children}
        <SelectPrimitive.Icon asChild>
            <ChevronIcon />
        </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SelectContent = React.forwardRef<
    React.ComponentRef<typeof SelectPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content> & {
        /** @deprecated currently a no-op — dark companion deferred */
        theme?: 'dark' | 'light'
    }
>(({ className, children, position = 'popper', theme: _theme, ...props }, ref) => (
    <SelectPrimitive.Portal>
        <SelectPrimitive.Content
            ref={ref}
            className={cn(
                'relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] text-[var(--text-strong)]',
                'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
                'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
                'data-[side=bottom]:slide-in-from-top-1 data-[side=top]:slide-in-from-bottom-1',
                'data-[side=left]:slide-in-from-right-1 data-[side=right]:slide-in-from-left-1',
                position === 'popper' &&
                    'data-[side=bottom]:translate-y-1 data-[side=top]:-translate-y-1',
                className
            )}
            position={position}
            sideOffset={6}
            {...props}
        >
            <SelectPrimitive.Viewport
                className={cn(
                    'p-1',
                    position === 'popper' &&
                        'w-full min-w-[var(--radix-select-trigger-width)]'
                )}
            >
                {children}
            </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
))
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectLabel = React.forwardRef<
    React.ComponentRef<typeof SelectPrimitive.Label>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
    <SelectPrimitive.Label
        ref={ref}
        className={cn(
            // Editorial eyebrow — matches the rest of the design system.
            'px-3 pb-1 pt-2 text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]',
            className
        )}
        {...props}
    />
))
SelectLabel.displayName = SelectPrimitive.Label.displayName

const SelectItem = React.forwardRef<
    React.ComponentRef<typeof SelectPrimitive.Item>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
    <SelectPrimitive.Item
        ref={ref}
        className={cn(
            'relative flex w-full cursor-pointer select-none items-center gap-2 rounded-md px-3 py-2 text-sm text-[var(--text-strong)] outline-none transition-colors',
            'data-[highlighted]:bg-[var(--surface-elevated)]',
            'data-[state=checked]:bg-[rgba(78,27,189,0.06)]',
            'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
            className
        )}
        {...props}
    >
        <SelectPrimitive.ItemText asChild>
            <span className="min-w-0 flex-1 truncate">{children}</span>
        </SelectPrimitive.ItemText>
        <SelectPrimitive.ItemIndicator className="shrink-0">
            <CheckIcon />
        </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName

const SelectSeparator = React.forwardRef<
    React.ComponentRef<typeof SelectPrimitive.Separator>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
    <SelectPrimitive.Separator
        ref={ref}
        className={cn(
            'mx-2 my-1 h-px bg-[var(--border-subtle)]',
            className
        )}
        {...props}
    />
))
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

export {
    Select,
    SelectGroup,
    SelectValue,
    SelectTrigger,
    SelectContent,
    SelectLabel,
    SelectItem,
    SelectSeparator,
}
