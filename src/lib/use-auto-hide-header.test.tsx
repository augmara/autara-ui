import { act, render, renderHook, screen } from '@testing-library/react'
import { useRef } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useAutoHideHeader } from './use-auto-hide-header'

/* Scroll the window to y and let one animation frame run. */
function scrollTo(y: number) {
    act(() => {
        Object.defineProperty(window, 'scrollY', { value: y, configurable: true })
        window.dispatchEvent(new Event('scroll'))
        vi.advanceTimersByTime(20)
    })
}

beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'requestAnimationFrame', 'cancelAnimationFrame'] })
    // Fake timers drive requestAnimationFrame too (a frame is 16ms).
    Object.defineProperty(window, 'scrollY', { value: 0, configurable: true })
})
afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
})

describe('useAutoHideHeader', () => {
    it('is shown at the top, hides on the way down and shows on the way up', () => {
        const { result } = renderHook(() => useAutoHideHeader())
        expect(result.current).toBe(false)
        scrollTo(40)
        expect(result.current).toBe(true)
        scrollTo(30)
        expect(result.current).toBe(false)
        scrollTo(60)
        expect(result.current).toBe(true)
        scrollTo(0)
        expect(result.current).toBe(false)
    })

    it('ignores a few pixels of travel', () => {
        const { result } = renderHook(() => useAutoHideHeader({ tolerance: 12 }))
        scrollTo(100)
        expect(result.current).toBe(true)
        scrollTo(99)
        expect(result.current).toBe(true)
        scrollTo(80)
        expect(result.current).toBe(false)
        scrollTo(88)
        expect(result.current).toBe(false)
    })

    it('stays shown above `after`', () => {
        const { result } = renderHook(() => useAutoHideHeader({ after: () => 500 }))
        scrollTo(300)
        expect(result.current).toBe(false)
        scrollTo(520)
        scrollTo(560)
        expect(result.current).toBe(true)
    })

    it('stays shown while disabled', () => {
        const { result } = renderHook(() => useAutoHideHeader({ disabled: true }))
        scrollTo(400)
        expect(result.current).toBe(false)
    })

    it('comes back, and stays, while focus is inside the header', () => {
        function Header() {
            const ref = useRef<HTMLElement>(null)
            const hidden = useAutoHideHeader({ ref })
            return (
                <header ref={ref} data-testid="h" data-hidden={hidden ? 'true' : 'false'}>
                    <a href="#x">Home</a>
                </header>
            )
        }
        render(<Header />)
        scrollTo(400)
        expect(screen.getByTestId('h')).toHaveAttribute('data-hidden', 'true')
        act(() => {
            screen.getByText('Home').focus()
        })
        expect(screen.getByTestId('h')).toHaveAttribute('data-hidden', 'false')
        scrollTo(800)
        expect(screen.getByTestId('h')).toHaveAttribute('data-hidden', 'false')
    })
})
