import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Countdown, remainingLabel } from './Countdown'

/**
 * AUTM-1221 — Countdown, graduated from customer-web (plan item U5).
 *
 * The wording rules are the part worth pinning: this stands in for a deadline
 * the customer is about to miss, so "1 day 3h" and "under a minute" are the
 * difference between acting and not. The tick is once a minute on purpose —
 * a per-second `aria-live` region is unusable — so these assert the label
 * function directly rather than driving a clock through fake timers.
 */
describe('remainingLabel', () => {
    const NOW = Date.UTC(2026, 8, 10, 12, 0, 0)
    const inMs = (ms: number) => new Date(NOW + ms).toISOString()

    it('counts days, then hours, then minutes', () => {
        expect(remainingLabel(inMs(3 * 864e5), NOW)).toBe('3 days')
        expect(remainingLabel(inMs(864e5 + 3 * 36e5), NOW)).toBe('1 day 3h')
        expect(remainingLabel(inMs(2 * 36e5 + 5 * 6e4), NOW)).toBe('2h 5m')
        expect(remainingLabel(inMs(7 * 6e4), NOW)).toBe('7 min')
    })

    it('never shows seconds', () => {
        expect(remainingLabel(inMs(40_000), NOW)).toBe('under a minute')
        expect(remainingLabel(inMs(1_000), NOW)).toBe('under a minute')
    })

    it('answers empty once the deadline has passed, and null for a non-date', () => {
        expect(remainingLabel(inMs(0), NOW)).toBe('')
        expect(remainingLabel(inMs(-60_000), NOW)).toBe('')
        expect(remainingLabel('not a date', NOW)).toBeNull()
    })
})

describe('Countdown', () => {
    beforeEach(() => {
        vi.useFakeTimers()
        vi.setSystemTime(new Date(Date.UTC(2026, 8, 10, 12, 0, 0)))
    })
    afterEach(() => {
        vi.useRealTimers()
    })

    it('announces politely and counts down once mounted', () => {
        const until = new Date(Date.UTC(2026, 8, 10, 14, 30, 0)).toISOString()
        render(<Countdown until={until} testId="hold" />)
        /* Inside act(), or the mount timer fires and React never flushes the
           state it set, leaving the pre-hydration absolute date on screen. */
        act(() => {
            vi.advanceTimersByTime(1)
        })
        const el = screen.getByTestId('hold')
        expect(el).toHaveAttribute('aria-live', 'polite')
        expect(el.textContent).toBe('Expires in 2h 30m')
        expect(el).not.toHaveAttribute('data-expired')
    })

    it('says so past the deadline, and marks itself for a consumer', () => {
        const until = new Date(Date.UTC(2026, 8, 10, 11, 0, 0)).toISOString()
        render(<Countdown until={until} testId="hold" expiredLabel="This link has expired" />)
        act(() => {
            vi.advanceTimersByTime(1)
        })
        const el = screen.getByTestId('hold')
        expect(el.textContent).toBe('This link has expired')
        expect(el).toHaveAttribute('data-expired', 'true')
    })

    it('renders the absolute deadline before the first tick, so SSR and the first client render agree', () => {
        const until = new Date(Date.UTC(2026, 8, 12, 6, 0, 0)).toISOString()
        render(<Countdown until={until} testId="hold" />)
        // No timers advanced: this is the server/first-paint shape.
        expect(screen.getByTestId('hold').textContent).toMatch(/^Expires in \d+ \w+/)
        expect(screen.getByTestId('hold').textContent).not.toContain('Expires in 1 day')
    })
})
