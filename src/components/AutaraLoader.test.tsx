import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { gzipSync } from 'node:zlib'
import { render, screen } from '@testing-library/react'
import { AutaraLoader } from './AutaraLoader'

/**
 * AUTM-1706: what AutaraLoader promises, on the DOM and in its stylesheet.
 *
 * jsdom has no media queries and no animation, so the motion contract is read
 * from `utilities/loader.css` itself; the AUTM-1706 PR has the same checks in
 * a browser with the media query emulated both ways.
 */

const CSS = readFileSync(resolve(process.cwd(), 'src/utilities/loader.css'), 'utf8')
const CODE = CSS.replace(/\/\*[\s\S]*?\*\//g, '')
const MARK = readFileSync(resolve(process.cwd(), 'src/components/AutaraLoader.tsx'), 'utf8')

/** The body of the first `@media (<query>) { ... }` block. */
function mediaBlock(query: string): string {
    const start = CODE.indexOf(`@media (${query})`)
    expect(start, `no @media (${query}) block`).toBeGreaterThanOrEqual(0)
    let depth = 0
    for (let i = CODE.indexOf('{', start); i < CODE.length; i++) {
        if (CODE[i] === '{') depth++
        else if (CODE[i] === '}' && --depth === 0) return CODE.slice(start, i)
    }
    throw new Error('unbalanced')
}

describe('AutaraLoader', () => {
    it('is a status named "Loading" by default', () => {
        render(<AutaraLoader />)
        expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument()
        expect(screen.getByText('Loading')).toHaveClass('sr-only')
    })

    it('takes a more specific label', () => {
        render(<AutaraLoader label="Loading your bookings" />)
        expect(screen.getByRole('status', { name: 'Loading your bookings' })).toBeInTheDocument()
    })

    it('is hidden and silent when decorative', () => {
        const { container } = render(<AutaraLoader decorative />)
        const root = container.firstElementChild!
        expect(root).toHaveAttribute('aria-hidden', 'true')
        expect(root).not.toHaveAttribute('role')
        expect(container.textContent).toBe('')
    })

    it.each([16, 20, 24, 48, 64, 80, 96] as const)('size %i renders in rem, so it follows text size', (size) => {
        const { container } = render(<AutaraLoader size={size} />)
        const root = container.firstElementChild as HTMLElement
        expect(root.style.width).toBe(`${size / 16}rem`)
        expect(root.style.height).toBe(`${size / 16}rem`)
    })

    it('draws the real mark: a ring and eight rays, in one solid colour', () => {
        const { container } = render(<AutaraLoader />)
        const svg = container.querySelector('svg')!
        expect(svg.querySelectorAll('circle')).toHaveLength(1)
        expect(svg.querySelectorAll('path.autara-loader-ray')).toHaveLength(8)
        // Turns about the mark's own centre (250.2, 250.3), not the box's.
        expect(svg.getAttribute('viewBox')).toBe('0.2 0.3 500 500')
        expect(container.innerHTML).not.toMatch(/gradient/i)
        expect(container.innerHTML.toLowerCase()).not.toContain('#4e1bbd')
    })

    it('grades the rays from a full-strength head', () => {
        const { container } = render(<AutaraLoader />)
        const op = [...container.querySelectorAll('path')].map((p) => Number(p.getAttribute('opacity')))
        expect(op[0]).toBe(1)
        expect(Math.min(...op)).toBeGreaterThan(0.2)
    })

    it('tones resolve through tokens or currentColor', () => {
        expect(render(<AutaraLoader />).container.firstElementChild).toHaveClass('text-[var(--accent)]')
        expect(render(<AutaraLoader tone="on-photo" />).container.firstElementChild).toHaveClass('text-white')
        expect(render(<AutaraLoader tone="current" />).container.firstElementChild!.className).not.toMatch(/\btext-/)
    })
})

describe('AutaraLoader motion (loader.css)', () => {
    it('turns only when motion is welcome, with a transform, on the loop token', () => {
        const moving = mediaBlock('prefers-reduced-motion: no-preference')
        expect(moving).toContain('animation: autara-loader-turn var(--motion-skeleton, 1400ms) linear infinite')
        expect(CODE).toMatch(/@keyframes autara-loader-turn \{\s*to \{\s*transform: rotate\(1turn\);\s*\}\s*\}/)
    })

    it('under reduced motion: no turn, the true mark, an opacity breath that survives the global clamp', () => {
        const still = mediaBlock('prefers-reduced-motion: reduce')
        expect(still).not.toContain('autara-loader-turn')
        expect(still).toContain('animation: autara-loader-breathe')
        expect(still).toContain('animation-duration: var(--motion-skeleton, 1400ms) !important')
        expect(still).toContain('animation-iteration-count: infinite !important')
        expect(still).toMatch(/\.autara-loader-ray \{\s*opacity: 1;/)
        const breathe = /@keyframes autara-loader-breathe \{([\s\S]*?)\n\}/.exec(CODE)![1]
        expect([...breathe.matchAll(/([a-z-]+):/g)].map((m) => m[1]).every((p) => p === 'opacity')).toBe(true)
    })

    it('animates nothing but transform and opacity', () => {
        const animated = [...CODE.matchAll(/@keyframes [\w-]+ \{([\s\S]*?)\n\}/g)].flatMap((m) =>
            [...m[1].matchAll(/([a-z-]+):/g)].map((p) => p[1])
        )
        expect(animated.length).toBeGreaterThan(0)
        expect(animated.filter((p) => p !== 'transform' && p !== 'opacity')).toEqual([])
    })

    it('ships in the utilities every consumer imports', () => {
        const index = readFileSync(resolve(process.cwd(), 'src/utilities/index.css'), 'utf8')
        expect(index).toContain('@import "./loader.css";')
    })

    it('stays under 2 KB gzipped, component and stylesheet together', () => {
        const bytes = gzipSync(MARK.replace(/\/\*[\s\S]*?\*\//g, '') + CODE).length
        expect(bytes).toBeLessThan(2048)
    })
})
