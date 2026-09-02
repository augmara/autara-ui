'use client'

import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { cn } from '../lib/cn'

/**
 * Dialog — Radix dialog primitive styled for the Autara cream canvas.
 *
 * Single light treatment (a dark companion for photo/ink surfaces is
 * deferred to a future PR). Honors the Autara house rules:
 *   - `--surface` (white) fill, `--text-strong` ink text
 *   - Hairline `--border-subtle` ring instead of any drop shadow
 *   - Ink overlay at 50% opacity (no backdrop blur — flat
 *     editorial scrim)
 *   - Solar Bold close icon at the top-right
 *
 * The `theme` prop on `DialogContent` is preserved for source-level
 * compatibility but is currently a **no-op**.
 *
 * ─── AUTM-967: the dialog now actually animates ─────────────────────────
 *
 * It carried `data-[state=open]:animate-in data-[state=open]:zoom-in-95` and
 * friends. Those are `tailwindcss-animate` utilities and that plugin is not a
 * dependency of this package or of any of the three consumers, so the classes
 * emitted NOTHING: every dialog on merchant-mobile, merchant-web and
 * customer-web appeared and vanished on the same frame it was asked for.
 *
 * The enter and exit are `.overlay-scrim` and `.modal-panel`, defined as real
 * CSS in `utilities/animations.css` — no plugin, no consumer configuration,
 * and `prefers-reduced-motion: reduce` respected there.
 */
const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogClose = DialogPrimitive.Close
const DialogPortal = DialogPrimitive.Portal

const DialogOverlay = React.forwardRef<
    React.ComponentRef<typeof DialogPrimitive.Overlay>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
    <DialogPrimitive.Overlay
        ref={ref}
        className={cn(
            'fixed inset-0 z-50 bg-[#0E0A1A]/55',
            // Real CSS, from utilities/animations.css. This used to be
            // `animate-in fade-in-0`, which resolved to nothing — see the
            // AUTM-967 note in the component header.
            'overlay-scrim',
            className
        )}
        {...props}
    />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
    React.ComponentRef<typeof DialogPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
        /** @deprecated currently a no-op — dark companion deferred */
        theme?: 'dark' | 'light'
    }
>(({ className, children, theme: _theme, ...props }, ref) => (
    <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
            ref={ref}
            className={cn(
                'fixed left-1/2 top-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4',
                // The sheet rung, not Tailwind's 2xl — a dialog is the largest
                // surface the user sees and carries the softest corner.
                'rounded-autara-xl bg-[var(--surface)] p-6',
                'ring-1 ring-inset ring-[var(--border-subtle)]',
                // `duration-200` went with it: `duration-*` sets
                // `transition-duration`, never `animation-duration`, so it
                // was tuning a transition that did not exist either.
                'modal-panel',
                className
            )}
            {...props}
        >
            {children}
            <DialogPrimitive.Close
                aria-label="Close dialog"
                className={cn(
                    'absolute right-4 top-4 grid h-7 w-7 place-items-center rounded-full',
                    'text-[var(--text-subtle)] transition-colors',
                    'hover:bg-[var(--surface-elevated)] hover:text-[var(--text-strong)]',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-autara-purple/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)]'
                )}
            >
                <svg
                    aria-hidden
                    viewBox="0 0 24 24"
                    width="14"
                    height="14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.4}
                    strokeLinecap="round"
                >
                    <path d="M6 6l12 12M18 6L6 18" />
                </svg>
            </DialogPrimitive.Close>
        </DialogPrimitive.Content>
    </DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn(
            'flex flex-col space-y-1.5 text-left',
            className
        )}
        {...props}
    />
)
DialogHeader.displayName = 'DialogHeader'

const DialogFooter = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn(
            'flex flex-col-reverse gap-2 sm:flex-row sm:justify-end',
            className
        )}
        {...props}
    />
)
DialogFooter.displayName = 'DialogFooter'

const DialogTitle = React.forwardRef<
    React.ComponentRef<typeof DialogPrimitive.Title>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
    <DialogPrimitive.Title
        ref={ref}
        className={cn(
            // Satoshi: 500 only, no semibold/bold.
            'text-lg font-medium leading-tight text-[var(--text-strong)]',
            className
        )}
        {...props}
    />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
    React.ComponentRef<typeof DialogPrimitive.Description>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
    <DialogPrimitive.Description
        ref={ref}
        className={cn(
            'text-sm leading-relaxed text-[var(--text-muted)]',
            className
        )}
        {...props}
    />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
    Dialog,
    DialogPortal,
    DialogOverlay,
    DialogClose,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogDescription,
}
