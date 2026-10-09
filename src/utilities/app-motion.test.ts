import { afterEach, describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { act, render, screen } from '@testing-library/react'
import { createElement } from 'react'
import { CountUp } from '../components/CountUp'
import { MediaFrame, initialsOf } from '../components/MediaFrame'
import { listenForBackNavigation, markNavigation } from '../lib/navigation-motion'
import { motionDurations, softTiming } from '../lib/motion-tokens'

/**
 * AUTM-1781: the app motion vocabulary (Don, 2026-10-09, after the Fernly
 * reference). jsdom has no stylesheet, so the CSS rules are read out of
 * utilities/animations.css; the components and helpers are rendered.
 */

const CSS = readFileSync(resolve(process.cwd(), 'src/utilities/animations.css'), 'utf8')
const CODE = CSS.replace(/\/\*[\s\S]*?\*\//g, '')
const APP = CODE.slice(CODE.indexOf('@keyframes autara-screen-push'))

function keyframes(name: string): string {
    const at = APP.indexOf(`@keyframes ${name} {`)
    if (at < 0) throw new Error(`@keyframes ${name} not found`)
    let depth = 0
    for (let i = APP.indexOf('{', at); i < APP.length; i++) {
        if (APP[i] === '{') depth++
        else if (APP[i] === '}' && --depth === 0) return APP.slice(at, i + 1)
    }
    throw new Error('unbalanced')
}

describe('the app motion CSS', () => {
    it.each([
        'autara-screen-push',
        'autara-screen-back',
        'autara-rise',
        'autara-row-in',
        'autara-pop',
        'autara-sheet-soft-in',
        'autara-dialog-soft-in',
        'autara-bar-in',
    ])('@keyframes %s animates transform and opacity only', (name) => {
        const props = [...keyframes(name).matchAll(/([a-z-]+)\s*:/g)].map((m) => m[1])
        expect(props.length).toBeGreaterThan(0)
        expect(props.filter((p) => p !== 'transform' && p !== 'opacity')).toEqual([])
    })

    it('every entrance starts present: opacity 0.001, never 0 or hidden', () => {
        for (const name of ['autara-screen-push', 'autara-screen-back', 'autara-rise', 'autara-row-in', 'autara-dialog-soft-in']) {
            expect(keyframes(name), name).toContain('opacity: 0.001')
        }
        expect(APP).not.toMatch(/visibility:\s*hidden/)
    })

    it('every animation runs only inside prefers-reduced-motion: no-preference', () => {
        // Split on the media blocks: a rule that animates must sit in one.
        const outside = APP.replace(/@media \(prefers-reduced-motion: no-preference\)[^{]*\{(?:[^{}]|\{[^{}]*\})*\}/g, '')
        expect(outside).not.toMatch(/animation:/)
    })

    it('runs on the soft curve, the pop on the overshoot', () => {
        expect(CSS).toContain('--motion-ease-soft: cubic-bezier(0.22, 1, 0.36, 1);')
        expect(CSS).toContain('--motion-ease-pop: cubic-bezier(0.34, 1.56, 0.64, 1);')
        for (const m of APP.matchAll(/animation: (autara-[\w-]+) var\(--motion-[\w-]+\) var\(--motion-ease-([\w]+)\)/g)) {
            expect(m[2], m[1]).toBe(m[1] === 'autara-pop' ? 'pop' : 'soft')
        }
    })

    it('rises 18px from 98.5%, rows 4px, the screen 6% sideways', () => {
        expect(keyframes('autara-rise')).toContain('translateY(18px) scale(0.985)')
        expect(keyframes('autara-row-in')).toContain('translateY(4px)')
        expect(keyframes('autara-screen-push')).toContain('translateX(6%)')
        expect(keyframes('autara-screen-back')).toContain('translateX(-6%)')
    })

    it('staggers sections 60ms capped at the sixth, rows 30ms capped at the twelfth', () => {
        expect(APP).toContain('calc(var(--rise-i, 0) * var(--motion-enter-stagger))')
        expect(APP).toContain('calc(var(--rise-i, 0) * var(--motion-row-stagger))')
        expect(APP).toContain('.motion-rise > :nth-child(n + 6), .motion-rows > :nth-child(6) { --rise-i: 5; }')
        expect(APP).toContain('.motion-rows > :nth-child(n + 12) { --rise-i: 11; }')
        expect(motionDurations.enterStagger).toBe(60)
        expect(motionDurations.rowStagger).toBe(30)
    })

    it('a screen slides only while html is marked, so a first load never does', () => {
        expect(APP).toMatch(/html\[data-nav="push"\] \.motion-screen \{/)
        expect(APP).not.toMatch(/^\.motion-screen \{/m)
    })

    it('a counting figure hides its real text by opacity and draws the count as generated content with no alternative', () => {
        expect(CODE).toContain('.motion-count[data-counting] > .motion-count-value {\n    opacity: 0;')
        expect(CODE).toContain('content: attr(data-counting) / "";')
    })

    it('softTiming gives the Web Animations timing on the soft curve', () => {
        expect(softTiming('slide')).toEqual({ duration: 450, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' })
        expect(softTiming('pop')).toEqual({ duration: 500, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' })
    })
})

describe('markNavigation', () => {
    afterEach(() => {
        vi.useRealTimers()
        delete document.documentElement.dataset.nav
    })

    it('marks the direction, then clears it once the screen has had time to arrive', () => {
        vi.useFakeTimers()
        markNavigation('push')
        expect(document.documentElement.dataset.nav).toBe('push')
        vi.advanceTimersByTime(1000)
        expect(document.documentElement.dataset.nav).toBeUndefined()
    })

    it('a second mark replaces the first and keeps its own time', () => {
        vi.useFakeTimers()
        markNavigation('push')
        vi.advanceTimersByTime(800)
        markNavigation('back')
        vi.advanceTimersByTime(500)
        expect(document.documentElement.dataset.nav).toBe('back')
    })

    it('the browser Back marks back, until the listener is removed', () => {
        const stop = listenForBackNavigation()
        window.dispatchEvent(new PopStateEvent('popstate'))
        expect(document.documentElement.dataset.nav).toBe('back')
        delete document.documentElement.dataset.nav
        stop()
        window.dispatchEvent(new PopStateEvent('popstate'))
        expect(document.documentElement.dataset.nav).toBeUndefined()
    })
})

describe('CountUp', () => {
    it('holds the final value in the DOM from the first frame', () => {
        render(createElement(CountUp, { value: 85.5, text: '$85.50', testId: 'n' }))
        expect(screen.getByTestId('n').textContent).toBe('$85.50')
    })

    it('counts over the value as an attribute, then removes it', () => {
        const frames: FrameRequestCallback[] = []
        const raf = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
            frames.push(cb)
            return frames.length
        })
        const now = vi.spyOn(performance, 'now').mockReturnValue(0)
        try {
            render(
                createElement(CountUp, {
                    value: 100,
                    formatOptions: { style: 'currency', currency: 'AUD' },
                    testId: 'n',
                })
            )
            const el = screen.getByTestId('n')
            expect(el.getAttribute('data-counting')).toBe('$0.00')
            act(() => frames.shift()!(450))
            const mid = Number(el.getAttribute('data-counting')!.replace(/[^\d.]/g, ''))
            expect(mid).toBeGreaterThan(50)
            expect(mid).toBeLessThan(100)
            expect(el.textContent).toBe('$100.00')
            act(() => frames.shift()!(motionDurations.count + 1))
            expect(el.hasAttribute('data-counting')).toBe(false)
        } finally {
            raf.mockRestore()
            now.mockRestore()
        }
    })

    it('does not count under reduced motion', () => {
        const mm = window.matchMedia
        window.matchMedia = ((q: string) => ({ matches: q.includes('reduce'), media: q })) as unknown as typeof window.matchMedia
        try {
            render(createElement(CountUp, { value: 40, text: '$40', testId: 'n' }))
            expect(screen.getByTestId('n').hasAttribute('data-counting')).toBe(false)
        } finally {
            window.matchMedia = mm
        }
    })
})

describe('MediaFrame', () => {
    it('draws a photo, fading in, at the ratio', () => {
        render(createElement(MediaFrame, { src: '/car.jpg', alt: 'A clean ute', ratio: '4 / 3', testId: 'm' }))
        const frame = screen.getByTestId('m')
        expect(frame.dataset.media).toBe('photo')
        expect(frame.style.aspectRatio).toBe('4 / 3')
        expect(screen.getByRole('img', { name: 'A clean ute' }).className).toContain('motion-crossfade')
    })

    it('falls back to initials on deep purple, named for a screen reader', () => {
        render(createElement(MediaFrame, { initials: 'FP', label: 'Fitzroy Paint Co', shape: 'tile', testId: 'm' }))
        const frame = screen.getByTestId('m')
        expect(frame.dataset.media).toBe('initials')
        expect(frame.className).toContain('bg-[var(--brand-deep)]')
        expect(frame.className).toContain('rounded-[14px]')
        expect(screen.getByRole('img', { name: 'Fitzroy Paint Co' }).textContent).toBe('FP')
    })

    it('a photo that fails to load falls back too', () => {
        render(createElement(MediaFrame, { src: '/gone.jpg', alt: '', initials: 'BM', testId: 'm' }))
        const img = screen.getByTestId('m').querySelector('img')!
        act(() => {
            img.dispatchEvent(new Event('error'))
        })
        expect(screen.getByTestId('m').dataset.media).toBe('initials')
    })

    it('the caller’s media wins over a photo, and loading wins over both', () => {
        const { rerender } = render(
            createElement(MediaFrame, { src: '/car.jpg', testId: 'm' }, createElement('div', null, 'map'))
        )
        expect(screen.getByTestId('m').dataset.media).toBe('media')
        rerender(createElement(MediaFrame, { src: '/car.jpg', loading: true, testId: 'm' }))
        expect(screen.getByTestId('m').dataset.media).toBe('loading')
    })

    it('initialsOf takes the first letters of the first two words', () => {
        expect(initialsOf('Fitzroy Paint Co')).toBe('FP')
        expect(initialsOf('Bayside')).toBe('B')
        expect(initialsOf('  ')).toBe('')
        expect(initialsOf(null)).toBe('')
    })
})
