'use client'

import * as React from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { cn } from '../lib/cn'

/**
 * Tabs — Radix tab primitive, segmented-control shape.
 *
 * ─── AUTM-974: why the active tab is a solid fill now ───────────────────
 *
 * It used to be `bg-[var(--surface)]` with `ring-1 ring-inset` on a
 * `--surface-elevated` track. `--surface` is 1.05:1 from `--surface-elevated`,
 * so the fill was invisible and THE RING WAS THE TAB — a 1px outline was the
 * only thing telling the merchant which of Day / Today / Week / Month / List
 * they were looking at.
 *
 * That is rule 4 of the Autara Glass direction
 * (`knowledge/project_ui_direction_2026_09_01.md`), as Don extended it on
 * 2026-09-01 with a screenshot of exactly this: "no outline buttons or
 * sections, boxes as we discussed. everything should be solid." Emphasis is
 * carried by a SOLID fill — not a tint, not a ring, not an outlined box.
 *
 * Two things changed, and both follow from that one rule:
 *
 *   ACTIVE TRIGGER → `--act-fill` / `--on-act`. Rule 5 assigns purple to
 *   ACTS, and `tokens/glass.css` names "active nav" as one of them. The tab
 *   you are on is where you are acting. The fill is 9.5:1 from the track in
 *   light and 1.9:1 in dark, so it defines its own shape and has earned the
 *   right to drop the ring.
 *
 *   TRACK → keeps `--surface-elevated`, loses its border. A container whose
 *   fill is a whisper off the card and whose edge is a hairline is an
 *   outlined section box, which the same rule bans. The track is a ground,
 *   not an emphasis, so the ground is all it gets.
 *
 * ─── The focus ring, which a solid fill can quietly break ───────────────
 *
 * A solid accent fill under the house `ring-[var(--accent)]/35` focus ring is
 * how the merchant-mobile Today pass put purple on purple at 1.0:1 and lost a
 * keyboard user's place on the row they were most likely to be on. Two fixes,
 * both measured in `solid-emphasis.test.ts`:
 *
 *   - Full-strength `--accent`, not `/35`. At 35% over the track the ring
 *     measures ~1.9:1, under the 3:1 WCAG 2.4.11 asks of a focus indicator.
 *     At full strength it is 8.0:1 light / 3.4:1 dark against the track.
 *   - `ring-offset-[var(--surface-elevated)]`, not `--background`. The offset
 *     band is what separates the purple ring from the purple fill, so it has
 *     to be painted in the colour that is actually behind the tab. Pointing
 *     it at the page canvas drew a cream halo inside a dark track.
 *
 * Radius follows the ladder in `tokens/radii.css` rather than raw Tailwind
 * rungs: the track takes the shared control radius, the triggers take the
 * "control inside a control" rung one step tighter.
 *
 * Works in both themes off the token stack — there is no separate dark
 * companion to wait for any more.
 */
const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
    React.ComponentRef<typeof TabsPrimitive.List>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
    <TabsPrimitive.List
        ref={ref}
        className={cn(
            // `min-h-10`, not `h-10` — at 200% text scale a fixed height
            // clips the labels instead of growing with them (AUTM-915).
            'inline-flex min-h-10 items-center justify-center gap-1 rounded-autara-md bg-[var(--surface-elevated)] p-1 text-[var(--text-muted)]',
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
            'inline-flex items-center justify-center whitespace-nowrap rounded-autara-sm px-3 py-1.5 text-sm font-medium transition-colors',
            'text-[var(--text-muted)] hover:text-[var(--text-strong)]',
            // See the focus-ring note in the header — full-strength accent,
            // and the offset band painted in the track that is really behind
            // it, because that band is what keeps a purple ring off a purple
            // fill.
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-elevated)]',
            'disabled:pointer-events-none disabled:opacity-50',
            'data-[state=active]:bg-[var(--act-fill)] data-[state=active]:text-[var(--on-act)]',
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
            'mt-3 text-[var(--text-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]',
            className
        )}
        {...props}
    />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
