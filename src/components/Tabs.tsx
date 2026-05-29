'use client'

import * as React from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { cn } from '../lib/cn'

/**
 * Tabs — Radix tab primitive styled for the Autara cream canvas.
 *
 * Container = surface-elevated with a hairline border. Inactive
 * triggers carry muted ink; the active trigger pops to a solid
 * surface fill with strong ink and a hairline ring. **No shadow** —
 * elevation comes from the surface contrast, in line with the house
 * rule (see [`autara-ui/CLAUDE.md`](../../CLAUDE.md) §
 * "Aesthetic invariants").
 *
 * Dark-surface companion is deferred to a future PR. If you need a
 * tab control on a photo / ink background, wait for that pass rather
 * than wrapping these in a darker container.
 */
const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
    React.ComponentRef<typeof TabsPrimitive.List>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
    <TabsPrimitive.List
        ref={ref}
        className={cn(
            'inline-flex h-10 items-center justify-center gap-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-1 text-[var(--text-muted)]',
            className
        )}
        {...props}
    />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
    React.ComponentRef<typeof TabsPrimitive.Trigger>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
    <TabsPrimitive.Trigger
        ref={ref}
        className={cn(
            'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-transparent transition-colors',
            'text-[var(--text-muted)] hover:text-[var(--text-strong)]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-autara-purple/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]',
            'disabled:pointer-events-none disabled:opacity-50',
            'data-[state=active]:bg-[var(--surface)] data-[state=active]:text-[var(--text-strong)] data-[state=active]:ring-1 data-[state=active]:ring-inset data-[state=active]:ring-[var(--border-subtle)]',
            className
        )}
        {...props}
    />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
    React.ComponentRef<typeof TabsPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
    <TabsPrimitive.Content
        ref={ref}
        className={cn(
            'mt-3 text-[var(--text-strong)] ring-offset-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-autara-purple/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]',
            className
        )}
        {...props}
    />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
