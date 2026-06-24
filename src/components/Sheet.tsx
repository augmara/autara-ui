'use client'

import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../lib/cn'

/**
 * Sheet — Radix dialog primitive as an edge-anchored drawer.
 *
 * Same grammar as `Dialog`: `--surface` fill, `--text-strong` ink,
 * `--border-subtle` hairline edge — no drop shadow, no backdrop blur.
 * `side` picks the anchor; the four entrance animations match the
 * anchor direction.
 *
 * Dark companion (for sheets over photo / ink contexts) deferred to a
 * future PR.
 */
const Sheet = DialogPrimitive.Root
const SheetTrigger = DialogPrimitive.Trigger
const SheetClose = DialogPrimitive.Close
const SheetPortal = DialogPrimitive.Portal

const SheetOverlay = React.forwardRef<
    React.ComponentRef<typeof DialogPrimitive.Overlay>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
    <DialogPrimitive.Overlay
        ref={ref}
        className={cn(
            'fixed inset-0 z-50 bg-[#0E0A1A]/55',
            'data-[state=open]:animate-in data-[state=open]:fade-in-0',
            'data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
            className
        )}
        {...props}
    />
))
SheetOverlay.displayName = DialogPrimitive.Overlay.displayName

const sheetVariants = cva(
    cn(
        'fixed z-50 flex flex-col bg-[var(--surface)] text-[var(--text-strong)]',
        'transition ease-in-out',
        'data-[state=closed]:duration-200 data-[state=open]:duration-300',
        'data-[state=open]:animate-in data-[state=closed]:animate-out'
    ),
    {
        variants: {
            side: {
                // Top-edge-anchored sides (top is full-width; left/right are
                // full-height) butt against the device status bar, so their
                // in-flow content (SheetHeader) clears the safe-area inset.
                // `env(safe-area-inset-top)` is 0 on the web — harmless there.
                // A bottom sheet's top is mid-screen, so it needs no inset.
                top:
                    'inset-x-0 top-0 border-b border-[var(--border-subtle)] pt-[env(safe-area-inset-top)] ' +
                    'data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top',
                bottom:
                    'inset-x-0 bottom-0 border-t border-[var(--border-subtle)] ' +
                    'data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
                left:
                    'inset-y-0 left-0 h-full w-3/4 border-r border-[var(--border-subtle)] sm:max-w-sm pt-[env(safe-area-inset-top)] ' +
                    'data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left',
                right:
                    'inset-y-0 right-0 h-full w-3/4 border-l border-[var(--border-subtle)] sm:max-w-sm pt-[env(safe-area-inset-top)] ' +
                    'data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
            },
        },
        defaultVariants: {
            side: 'right',
        },
    }
)

interface SheetContentProps
    extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
        VariantProps<typeof sheetVariants> {}

const SheetContent = React.forwardRef<
    React.ComponentRef<typeof DialogPrimitive.Content>,
    SheetContentProps
>(({ side = 'right', className, children, ...props }, ref) => {
    // The close button is absolutely positioned, so the container's
    // `pt-[env(safe-area-inset-top)]` doesn't move it — it carries its own
    // inset. A bottom sheet sits mid-screen and keeps the plain top-4.
    const closeTop =
        side === 'bottom'
            ? 'top-4'
            : 'top-[calc(env(safe-area-inset-top)+16px)]'
    return (
        <SheetPortal>
            <SheetOverlay />
            <DialogPrimitive.Content
                ref={ref}
                className={cn(sheetVariants({ side }), className)}
                {...props}
            >
                <DialogPrimitive.Close
                    aria-label="Close drawer"
                    className={cn(
                        'absolute right-4 grid h-7 w-7 place-items-center rounded-full',
                        closeTop,
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
                {children}
            </DialogPrimitive.Content>
        </SheetPortal>
    )
})
SheetContent.displayName = DialogPrimitive.Content.displayName

const SheetHeader = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn(
            'flex flex-col gap-1.5 p-6 pb-4 text-left',
            className
        )}
        {...props}
    />
)
SheetHeader.displayName = 'SheetHeader'

const SheetFooter = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn(
            'mt-auto flex flex-col-reverse gap-2 border-t border-[var(--border-subtle)] p-6 sm:flex-row sm:justify-end',
            className
        )}
        {...props}
    />
)
SheetFooter.displayName = 'SheetFooter'

const SheetTitle = React.forwardRef<
    React.ComponentRef<typeof DialogPrimitive.Title>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
    <DialogPrimitive.Title
        ref={ref}
        className={cn(
            'text-lg font-medium leading-tight text-[var(--text-strong)]',
            className
        )}
        {...props}
    />
))
SheetTitle.displayName = DialogPrimitive.Title.displayName

const SheetDescription = React.forwardRef<
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
SheetDescription.displayName = DialogPrimitive.Description.displayName

export {
    Sheet,
    SheetPortal,
    SheetOverlay,
    SheetTrigger,
    SheetClose,
    SheetContent,
    SheetHeader,
    SheetFooter,
    SheetTitle,
    SheetDescription,
}
