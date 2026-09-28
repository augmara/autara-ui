import { beforeAll, describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { BloomField } from './BloomField'
import { LitGroup } from './LitGroup'
import { GlassSurface } from './GlassSurface'
import { Reveal } from './Reveal'

/* jsdom has no WebGL, which is the fallback path a real browser without it
 * takes: the canvas goes, the static ground stays, and the wrapper says so.
 * jsdom's own getContext logs a "not implemented" error before returning
 * nothing; stubbing it keeps the test output honest about what is asserted. */
beforeAll(() => {
    HTMLCanvasElement.prototype.getContext = (() => null) as unknown as HTMLCanvasElement['getContext']
})

describe('BloomField', () => {
    it('falls back to the static ground when there is no WebGL2 context', () => {
        const { container } = render(
            <BloomField data-testid="field">
                <p>content</p>
            </BloomField>
        )
        const host = container.querySelector('[data-testid="field"]') as HTMLElement
        expect(host.className).toContain('gradient-ground')
        expect(host.className).toContain('bloom-field')
        expect(host.dataset.ground).toBe('static')
        expect(host.querySelector('canvas')).toBeNull()
        expect(host.textContent).toContain('content')
    })
})

describe('GlassSurface lit + LitGroup', () => {
    it('marks a lit surface for the group to find, and only when asked', () => {
        const { container } = render(
            <LitGroup>
                <GlassSurface lit>a</GlassSurface>
                <GlassSurface>b</GlassSurface>
            </LitGroup>
        )
        expect(container.querySelector('[data-lit-group]')).not.toBeNull()
        const lit = container.querySelectorAll('[data-lit]')
        expect(lit).toHaveLength(1)
        expect(lit[0].className).toContain('glass-surface--lit')
    })
})

describe('Reveal', () => {
    it('renders the class and the requested element, with the content at rest', () => {
        const { container } = render(
            <Reveal as="li" data-testid="r">
                text
            </Reveal>
        )
        const el = container.querySelector('[data-testid="r"]') as HTMLElement
        expect(el.tagName).toBe('LI')
        expect(el.className).toContain('reveal-view')
        expect(el.textContent).toBe('text')
    })
})
