'use client'

import * as React from 'react'
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import { cn } from '../lib/cn'

/**
 * DropdownMenu — Radix dropdown primitive in the Autara cream-canvas
 * grammar. Used for kebab menus on table rows, context menus on
 * cards, and any "more actions" trigger.
 *
 * - **Content / SubContent**: portaled, hairline `--border-subtle`
 *   ring, `--surface` fill, no drop shadow, no backdrop blur (Autara
 *   house rule). Radix slide+fade animations preserved.
 * - **Item**: ink text by default; hover/keyboard focus tints to
 *   `--surface-elevated`. Destructive items use
 *   `data-destructive` (caller adds `className="text-[var(--color-autara-error)]"`).
 * - **Label**: editorial uppercase eyebrow (matches Select + the rest
 *   of the design system).
 * - **Separator**: hairline `--border-subtle`.
 * - **SubTrigger**: Solar Bold chevron-right, rotates on data state.
 */
const DropdownMenu = DropdownMenuPrimitive.Root
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger
const DropdownMenuGroup = DropdownMenuPrimitive.Group
const DropdownMenuPortal = DropdownMenuPrimitive.Portal
const DropdownMenuSub = DropdownMenuPrimitive.Sub

// Shared surface for Content and SubContent.
const SURFACE = cn(
    'z-50 min-w-[10rem] overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] p-1 text-[var(--text-strong)]',
    'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
    'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
    'data-[side=bottom]:slide-in-from-top-1 data-[side=top]:slide-in-from-bottom-1',
    'data-[side=left]:slide-in-from-right-1 data-[side=right]:slide-in-from-left-1'
)

// Shared item grammar for Item and SubTrigger.
const ITEM = cn(
    'relative flex w-full cursor-pointer select-none items-center gap-2 rounded-md px-3 py-2 text-sm text-[var(--text-strong)] outline-none transition-colors',
    'data-[highlighted]:bg-[var(--surface-elevated)]',
    'data-[state=open]:bg-[var(--surface-elevated)]',
    'data-[disabled]:pointer-events-none data-[disabled]:opacity-50'
)

const DropdownMenuContent = React.forwardRef<
    React.ComponentRef<typeof DropdownMenuPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 6, ...props }, ref) => (
    <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
            ref={ref}
            sideOffset={sideOffset}
            className={cn(SURFACE, className)}
            {...props}
        />
    </DropdownMenuPrimitive.Portal>
))
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName

const DropdownMenuItem = React.forwardRef<
    React.ComponentRef<typeof DropdownMenuPrimitive.Item>,
    React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
        /** Add left padding so this row aligns with sibling items that carry an icon. */
        inset?: boolean
    }
>(({ className, inset, ...props }, ref) => (
    <DropdownMenuPrimitive.Item
        ref={ref}
        className={cn(ITEM, inset && 'pl-9', className)}
        {...props}
    />
))
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName

const DropdownMenuLabel = React.forwardRef<
    React.ComponentRef<typeof DropdownMenuPrimitive.Label>,
    React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
        inset?: boolean
    }
>(({ className, inset, ...props }, ref) => (
    <DropdownMenuPrimitive.Label
        ref={ref}
        className={cn(
            // Editorial eyebrow — matches Select label + the rest of the system.
            'px-3 pb-1 pt-2 text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]',
            inset && 'pl-9',
            className
        )}
        {...props}
    />
))
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName

const DropdownMenuSeparator = React.forwardRef<
    React.ComponentRef<typeof DropdownMenuPrimitive.Separator>,
    React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
    <DropdownMenuPrimitive.Separator
        ref={ref}
        className={cn(
            'mx-2 my-1 h-px bg-[var(--border-subtle)]',
            className
        )}
        {...props}
    />
))
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName

const DropdownMenuSubTrigger = React.forwardRef<
    React.ComponentRef<typeof DropdownMenuPrimitive.SubTrigger>,
    React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & {
        inset?: boolean
    }
>(({ className, inset, children, ...props }, ref) => (
    <DropdownMenuPrimitive.SubTrigger
        ref={ref}
        className={cn(ITEM, inset && 'pl-9', className)}
        {...props}
    >
        <span className="min-w-0 flex-1 truncate">{children}</span>
        <svg
            aria-hidden
            viewBox="0 0 24 24"
            width="14"
            height="14"
            className="shrink-0 text-[var(--text-subtle)]"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M9 6l6 6-6 6" />
        </svg>
    </DropdownMenuPrimitive.SubTrigger>
))
DropdownMenuSubTrigger.displayName = DropdownMenuPrimitive.SubTrigger.displayName

const DropdownMenuSubContent = React.forwardRef<
    React.ComponentRef<typeof DropdownMenuPrimitive.SubContent>,
    React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, sideOffset = 4, ...props }, ref) => (
    <DropdownMenuPrimitive.SubContent
        ref={ref}
        sideOffset={sideOffset}
        className={cn(SURFACE, className)}
        {...props}
    />
))
DropdownMenuSubContent.displayName = DropdownMenuPrimitive.SubContent.displayName

export {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuGroup,
    DropdownMenuPortal,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
}
