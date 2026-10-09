import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import { StrictMode } from 'react'
import { CountUp } from './CountUp'

/**
 * AUTM-1792. What matters about a count-up is not the frames but that the
 * real figure is never hidden from anyone reading the page: it is in the DOM
 * at once, the counting copy is aria-hidden, and only one element ever reads
 * the final string.
 */
const aud = (n: number) => `$${Math.round(n)}`

function mockReducedMotion(reduce: boolean) {
    window.matchMedia = vi.fn().mockImplementation((q: string) => ({
        matches: reduce && q.includes('reduce'),
        media: q,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        onchange: null,
        dispatchEvent: () => false,
    })) as unknown as typeof window.matchMedia
}

describe('CountUp', () => {
    beforeEach(() => {
        vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance'] })
    })
    afterEach(() => vi.useRealTimers())

    it('has the real value in the page from the first frame, and one element reads it', () => {
        mockReducedMotion(false)
        render(<CountUp value={407} format={aud} />)
        expect(screen.getAllByText('$407')).toHaveLength(1)
        const counting = document.querySelector('[data-count-up] [aria-hidden="true"]')
        expect(counting?.textContent).toBe('$0')
    })

    it('counts up and then leaves only the real value', () => {
        mockReducedMotion(false)
        render(<CountUp value={407} format={aud} duration={900} />)
        act(() => {
            vi.advanceTimersByTime(450)
        })
        const mid = Number(document.querySelector('[data-count-up] [aria-hidden="true"]')?.textContent?.slice(1))
        expect(mid).toBeGreaterThan(0)
        expect(mid).toBeLessThan(407)
        act(() => {
            vi.advanceTimersByTime(600)
        })
        expect(document.querySelector('[data-count-up] [aria-hidden="true"]')).toBeNull()
        expect(screen.getAllByText('$407')).toHaveLength(1)
    })

    it('does not count under reduced motion', () => {
        mockReducedMotion(true)
        render(<CountUp value={407} format={aud} />)
        expect(document.querySelector('[data-count-up] [aria-hidden="true"]')).toBeNull()
    })

    it('shows a later value at once instead of counting again', () => {
        mockReducedMotion(false)
        const { rerender } = render(<CountUp value={407} format={aud} />)
        act(() => {
            vi.advanceTimersByTime(1200)
        })
        rerender(<CountUp value={456} format={aud} />)
        expect(document.querySelector('[data-count-up] [aria-hidden="true"]')).toBeNull()
        expect(screen.getByText('$456')).toBeTruthy()
    })
})

describe('CountUp under StrictMode (AUTM-1792)', () => {
    beforeEach(() => {
        vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance'] })
        mockReducedMotion(false)
    })
    afterEach(() => vi.useRealTimers())

    it('still finishes when React mounts it twice', () => {
        render(
            <StrictMode>
                <CountUp value={407} format={aud} duration={900} />
            </StrictMode>
        )
        act(() => {
            vi.advanceTimersByTime(1200)
        })
        expect(document.querySelector('[data-count-up] [aria-hidden="true"]')).toBeNull()
        expect(screen.getAllByText('$407')).toHaveLength(1)
    })
})
