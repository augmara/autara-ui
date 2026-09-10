'use client'

import { useEffect, useState } from 'react'

/**
 * Countdown — a live "expires in" line.
 *
 * Graduated from autara-customer-web under AUTM-1221 (plan item U5), where it
 * replaced a static "Expires 12 Sep, 4:00 pm" on the magic-link confirm page:
 * that asked the customer to do the arithmetic against a deadline they were
 * about to miss.
 *
 * Two rules this component keeps, and both are load-bearing:
 *
 * 1. **Only ever point it at a deadline the server enforces.** A clock the
 *    backend does not honour is a lie told with a straight face, and the
 *    customer finds out at the worst moment. If there is no real `expiresAt`,
 *    render nothing rather than inventing one.
 * 2. **Server and first client render agree on the absolute date**, so there
 *    is no hydration mismatch. The relative value lands on mount and ticks
 *    once a minute. Announcing per second would make `aria-live` unusable.
 */
export interface CountdownProps {
    /** ISO timestamp of the deadline. */
    until: string
    /** Leading words. Default "Expires in". */
    prefix?: string
    /** Shown once the deadline has passed. Default "Expired". */
    expiredLabel?: string
    /** Locale for the pre-hydration absolute fallback. Default "en-AU". */
    locale?: string
    testId?: string
    className?: string
}

/**
 * The remaining span in words, `""` once the deadline has passed, or null
 * when `until` is not a date. Exported for tests and for a consumer that
 * needs the same wording somewhere a live region would be wrong.
 */
export function remainingLabel(until: string, now: number): string | null {
    const ms = new Date(until).getTime() - now
    if (!Number.isFinite(ms)) return null
    if (ms <= 0) return ''
    const mins = Math.floor(ms / 60000)
    const days = Math.floor(mins / 1440)
    const hours = Math.floor((mins % 1440) / 60)
    const minutes = mins % 60
    if (days >= 2) return `${days} days`
    if (days === 1) return `1 day ${hours}h`
    if (hours >= 1) return `${hours}h ${minutes}m`
    if (minutes >= 1) return `${minutes} min`
    return 'under a minute'
}

export function Countdown({
    until,
    prefix = 'Expires in',
    expiredLabel = 'Expired',
    locale = 'en-AU',
    testId,
    className,
}: CountdownProps) {
    const [now, setNow] = useState<number | null>(null)

    useEffect(() => {
        const tick = () => setNow(Date.now())
        const id = window.setTimeout(tick, 0)
        const interval = window.setInterval(tick, 60_000)
        return () => {
            window.clearTimeout(id)
            window.clearInterval(interval)
        }
    }, [])

    const text = now === null ? null : remainingLabel(until, now)

    /* Pre-hydration, and for a value that is not a date at all: the absolute
       deadline. Worse than the countdown, still true. */
    if (text === null) {
        const absolute = new Date(until)
        const readable = Number.isNaN(absolute.getTime())
            ? until
            : absolute.toLocaleString(locale, {
                  day: 'numeric',
                  month: 'short',
                  hour: 'numeric',
                  minute: '2-digit',
              })
        return (
            <span data-testid={testId} className={className} aria-live="polite">
                {prefix} {readable}
            </span>
        )
    }

    return (
        <span
            data-testid={testId}
            data-expired={text === '' || undefined}
            className={className}
            aria-live="polite"
        >
            {text === '' ? expiredLabel : `${prefix} ${text}`}
        </span>
    )
}
