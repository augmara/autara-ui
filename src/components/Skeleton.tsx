import * as React from 'react'
import { cn } from '../lib/cn'

/**
 * Skeleton — the primitive loading placeholder. One shape-matched block.
 *
 * Reach for `AsyncSkeleton` when you want a ready-made list / card / text
 * arrangement; reach for `Skeleton` when you are hand-composing a layout
 * and just need the block.
 *
 * AUTM-934: the fill was `bg-white/[0.06]`, a dark-only value that measures
 * 1.003:1 against the warm-cream canvas. The placeholder did not render, so
 * a loading list was indistinguishable from an empty list — the single worst
 * thing a loading state can do, because the user concludes there is nothing
 * there and leaves. `--surface-elevated` is the themed track token and is
 * what `AsyncSkeleton` already used.
 *
 * Announces via `role="status"` + a visually-hidden label so a screen-reader
 * user is told the region is loading instead of hearing silence. Pass
 * `label={null}` for decorative blocks inside a container that already
 * announces (that is what `AsyncSkeleton` does for its inner bars).
 */
export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    /**
     * Announced while the placeholder is on screen. Be specific — "Loading
     * your bookings" beats "Loading". Pass `null` to stay silent when an
     * ancestor already announces.
     */
    label?: string | null
}

function Skeleton({ className, label = 'Loading', ...props }: SkeletonProps) {
    const silent = label === null
    return (
        <div
            className={cn(
                'animate-pulse rounded-autara bg-[var(--surface-elevated)]',
                className
            )}
            {...(silent
                ? { 'aria-hidden': true }
                : { role: 'status', 'aria-live': 'polite' })}
            {...props}
        >
            {silent ? null : (
                <span className="sr-only">{label}</span>
            )}
        </div>
    )
}

export { Skeleton }
