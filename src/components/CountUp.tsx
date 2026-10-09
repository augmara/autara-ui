'use client'

import * as React from 'react'
import { cn } from '../lib/cn'
import { motionDurations, motionEasings } from '../lib/motion-tokens'

/**
 * CountUp: a figure that counts up to its value once, when it arrives
 * (AUTM-1781, the app motion vocabulary: "numbers count up").
 *
 *     <CountUp value={85.5} text="$85.50" formatOptions={{ style: 'currency', currency: 'AUD' }} />
 *
 * The figure is never wrong for anyone who reads it rather than watches it:
 *   - `text` is the final value, in the DOM from the first frame (server HTML
 *     included). A screen reader, `innerText` and a test only ever meet it.
 *   - The counting digits are drawn over it as generated content with an
 *     empty alternative (`.motion-count` in utilities/animations.css), in the
 *     same box, so nothing moves in the layout.
 *   - Under `prefers-reduced-motion: reduce`, or with no `requestAnimationFrame`,
 *     there is no count: the value is simply there.
 *   - Once per mount. A later change of `value` (a poll) shows the new value
 *     at once; it does not count again.
 *
 * `formatOptions` and `locale` format the in-between frames (serialisable, so
 * a server component can pass them). Keep them in step with how `text` was
 * formatted, or the last frame visibly snaps.
 */

export interface CountUpProps {
    value: number
    /** The final value as shown. Defaults to `value` formatted like the frames. */
    text?: string
    formatOptions?: Intl.NumberFormatOptions
    /** @default 'en-AU' */
    locale?: string
    /** @default motionDurations.count (900ms) */
    durationMs?: number
    className?: string
    testId?: string
}

/** A cubic-bezier's y for an x, by bisection: plenty for 60 frames. */
function bezierAt([x1, y1, x2, y2]: readonly number[], x: number): number {
    const coord = (t: number, a: number, b: number) => 3 * a * t * (1 - t) ** 2 + 3 * b * t ** 2 * (1 - t) + t ** 3
    let lo = 0
    let hi = 1
    let t = x
    for (let i = 0; i < 20; i++) {
        const cx = coord(t, x1, x2)
        if (Math.abs(cx - x) < 1e-4) break
        if (cx < x) lo = t
        else hi = t
        t = (lo + hi) / 2
    }
    return coord(t, y1, y2)
}

export function CountUp({
    value,
    text,
    formatOptions,
    locale = 'en-AU',
    durationMs = motionDurations.count,
    className,
    testId,
}: CountUpProps) {
    const ref = React.useRef<HTMLSpanElement>(null)
    const played = React.useRef(false)
    const format = React.useMemo(() => new Intl.NumberFormat(locale, formatOptions), [locale, formatOptions])
    const finalText = text ?? format.format(value)

    React.useEffect(() => {
        const el = ref.current
        if (!el || played.current) return
        played.current = true
        if (
            !Number.isFinite(value) ||
            value === 0 ||
            typeof window.requestAnimationFrame !== 'function' ||
            window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
        ) {
            return
        }
        let frame = 0
        const start = performance.now()
        const step = (now: number) => {
            const x = Math.min(1, (now - start) / durationMs)
            if (x >= 1) {
                el.removeAttribute('data-counting')
                return
            }
            el.setAttribute('data-counting', format.format(value * bezierAt(motionEasings.soft, x)))
            frame = requestAnimationFrame(step)
        }
        el.setAttribute('data-counting', format.format(0))
        frame = requestAnimationFrame(step)
        return () => {
            cancelAnimationFrame(frame)
            el.removeAttribute('data-counting')
            // Unmounted mid-count (or React's development double effect):
            // the next mount may count again.
            played.current = false
        }
        // Once per mount, by design: a later value shows at once.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <span ref={ref} data-testid={testId} className={cn('motion-count tabular-nums', className)}>
            <span className="motion-count-value">{finalText}</span>
        </span>
    )
}
