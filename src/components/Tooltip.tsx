'use client'

import * as React from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { cn } from '../lib/cn'

/**
 * Tooltip — Radix tooltip primitive in the Autara Torph ink aesthetic.
 *
 * - `#0E0A1A` ink background, white text, hairline `white/10` ring.
 *   Matches the Toast capsule grammar so floating UI reads as one
 *   family.
 * - **No drop shadow** — the dark/light contrast against the cream
 *   canvas does the depth work (Autara house rule).
 * - Keeps the existing Radix `slide-in` / `zoom-in` animations and
 *   side-aware origin.
 *
 * The `theme` prop is preserved for source-level compatibility but is
 * currently a **no-op** — only the ink variant ships. A light /
 * cream-canvas variant for inline help text on form fields is a
 * deferred follow-up.
 */
const TooltipProvider = TooltipPrimitive.Provider
const Tooltip = TooltipPrimitive.Root
const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipContent = React.forwardRef<
    React.ComponentRef<typeof TooltipPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> & {
        /** @deprecated currently a no-op — light companion deferred */
        theme?: 'dark' | 'light'
    }
>(({ className, sideOffset = 6, theme: _theme, ...props }, ref) => (
    <TooltipPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn(
            // Capsule grammar — matches the Toast ink pill so floating
            // UI reads as one family.
            'z-50 max-w-xs rounded-md bg-[#0E0A1A] px-3 py-1.5 text-[12px] font-medium text-white ring-1 ring-inset ring-white/10',
            // Radix transition primitives — origin is side-aware.
            'animate-in fade-in-0 zoom-in-95',
            'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
            'data-[side=bottom]:slide-in-from-top-1',
            'data-[side=left]:slide-in-from-right-1',
            'data-[side=right]:slide-in-from-left-1',
            'data-[side=top]:slide-in-from-bottom-1',
            className
        )}
        {...props}
    />
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
