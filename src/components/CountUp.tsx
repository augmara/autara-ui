'use client'

import * as React from 'react'
import { cn } from '../lib/cn'
import { motionDurations } from '../lib/motion-tokens'

/**
 * CountUp: a figure that counts up to its value once, when it arrives.
 *
 * AUTM-1792. Don, 2026-10-09, pointing at a dashboard he liked: "can you see
 * this smooth animation, can we apply slight animation in our app too". Its
 * money tiles count from zero to their value as the page lands. This is that,
 * on `--motion-count` (900ms) and the house ease-out, and nothing else:
 *
 * - **The real value is in the page from the first frame.** It is rendered
 *   at full size and transparent while a copy counts over it (`aria-hidden`),
 *   so a screen reader, a test and a copy-paste all read the true figure and
 *   the box never changes size under the count. The copy is removed before it
 *   would show the final string, so exactly one element ever reads it.
 * - **Once per arrival.** It counts on mount. A value that changes later (a
 *   refetch, a live update) is shown at once: a figure that re-counts on every
 *   poll reads as a fault, not as motion.
 * - **Reduced motion shows the value**, with no count at all.
 *
 * Format is the caller's (`formatAud`, a percentage, a count), applied to the
 * intermediate numbers too, so the count reads in the same units throughout.
 * Pair with `tabular-nums` on the figure so the digits do not jitter.
 */
export interface CountUpProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
    /** The figure to land on. */
    value: number
    /** How to print a number; used for the count and the final value. */
    format?: (n: number) => string
    /** Where the count starts. */
    from?: number
    /** Milliseconds. Defaults to `--motion-count`. */
    duration?: number
}

const useIsoLayoutEffect = typeof window === 'undefined' ? React.useEffect : React.useLayoutEffect

const defaultFormat = (n: number) => Math.round(n).toLocaleString()

/** Ease-out quart: close to `--motion-ease-out` and cheap to evaluate. */
const easeOut = (t: number) => 1 - Math.pow(1 - t, 4)

function prefersReducedMotion(): boolean {
    return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
        : false
}

export function CountUp({
    value,
    format = defaultFormat,
    from = 0,
    duration = motionDurations.count,
    className,
    ...props
}: CountUpProps) {
    const finalText = format(value)
    const [shown, setShown] = React.useState<string | null>(null)
    const started = React.useRef(false)
    const formatRef = React.useRef(format)
    formatRef.current = format

    useIsoLayoutEffect(() => {
        if (started.current) return
        started.current = true
        if (prefersReducedMotion() || value === from || !Number.isFinite(value)) return
        const target = value
        const print = formatRef.current
        const end = print(target)
        let frame = 0
        const t0 = performance.now()
        setShown(print(from))
        const tick = (now: number) => {
            const t = Math.min((now - t0) / duration, 1)
            const text = print(from + (target - from) * easeOut(t))
            // Stop before the copy would read the final figure, so only the
            // real value ever does.
            if (t >= 1 || text === end) {
                setShown(null)
                return
            }
            setShown(text)
            frame = requestAnimationFrame(tick)
        }
        frame = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(frame)
        // Once per arrival: a later value is shown at once (see the header),
        // so this deliberately depends on nothing.
    }, [])

    const counting = shown !== null
    return (
        <span data-count-up="" className={cn('relative inline-block', className)} {...props}>
            <span style={counting ? { opacity: 0 } : undefined}>{finalText}</span>
            {counting ? (
                <span aria-hidden className="pointer-events-none absolute inset-0 whitespace-nowrap">
                    {shown}
                </span>
            ) : null}
        </span>
    )
}
