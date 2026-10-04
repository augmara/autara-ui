import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Disclosure } from './Disclosure'

let reduced = false
beforeEach(() => {
    reduced = false
    vi.useFakeTimers()
    window.matchMedia = vi.fn((query: string) => ({
        matches: query.includes('reduce') ? reduced : false,
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
    })) as unknown as typeof window.matchMedia
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => setTimeout(() => cb(0), 16) as unknown as number)
    vi.stubGlobal('cancelAnimationFrame', (id: number) => clearTimeout(id))
})
afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
})

const details = () => screen.getByTestId('d') as HTMLDetailsElement

describe('Disclosure', () => {
    it('is a details and summary, with the answer in the page while closed', () => {
        render(
            <Disclosure summary="How long does approval take?" data-testid="d">
                Usually a day.
            </Disclosure>
        )
        expect(details().tagName).toBe('DETAILS')
        expect(details().open).toBe(false)
        expect(screen.getByText('How long does approval take?').closest('summary')).not.toBeNull()
        expect(screen.getByText('Usually a day.')).toBeInTheDocument()
        expect(details()).toHaveAttribute('data-expanded', 'false')
    })

    it('starts open with defaultOpen', () => {
        render(
            <Disclosure summary="Q" defaultOpen data-testid="d">
                A
            </Disclosure>
        )
        expect(details().open).toBe(true)
        expect(details()).toHaveAttribute('data-expanded', 'true')
    })

    it('opens the element first and expands a frame later, so the height runs from closed', () => {
        render(
            <Disclosure summary="Q" data-testid="d">
                A
            </Disclosure>
        )
        fireEvent.click(screen.getByText('Q'))
        expect(details().open).toBe(true)
        expect(details()).toHaveAttribute('data-expanded', 'false')
        act(() => {
            vi.advanceTimersByTime(40)
        })
        expect(details()).toHaveAttribute('data-expanded', 'true')
    })

    it('collapses first and closes the element once the height has run', () => {
        const onOpenChange = vi.fn()
        render(
            <Disclosure summary="Q" defaultOpen data-testid="d" onOpenChange={onOpenChange}>
                A
            </Disclosure>
        )
        fireEvent.click(screen.getByText('Q'))
        expect(details()).toHaveAttribute('data-expanded', 'false')
        expect(details().open).toBe(true)
        act(() => {
            vi.advanceTimersByTime(400)
        })
        expect(details().open).toBe(false)
        expect(onOpenChange).toHaveBeenCalledWith(false)
    })

    it('opens and closes at once under reduced motion', () => {
        reduced = true
        render(
            <Disclosure summary="Q" data-testid="d">
                A
            </Disclosure>
        )
        fireEvent.click(screen.getByText('Q'))
        expect(details()).toHaveAttribute('data-expanded', 'true')
        fireEvent.click(screen.getByText('Q'))
        expect(details().open).toBe(false)
        expect(details()).toHaveAttribute('data-expanded', 'false')
    })

    it('follows the browser when it opens the element itself (find in page)', () => {
        render(
            <Disclosure summary="Q" data-testid="d">
                A
            </Disclosure>
        )
        act(() => {
            details().open = true
            details().dispatchEvent(new Event('toggle'))
        })
        expect(details()).toHaveAttribute('data-expanded', 'true')
    })

    it('marks itself enhanced once hydrated, so the no-JavaScript styles step aside', () => {
        render(
            <Disclosure summary="Q" data-testid="d" icon="plus">
                A
            </Disclosure>
        )
        expect(details()).toHaveAttribute('data-enhanced', 'true')
        expect(details()).toHaveAttribute('data-icon', 'plus')
    })
})
