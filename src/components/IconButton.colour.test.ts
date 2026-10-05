import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * AUTM-1756 (Don, 2026-10-05): every icon-only control is a FILLED disc that
 * reads on its ground. Two ratios, read from the token file so a token change
 * that breaks either fails here:
 *
 *   - the glyph on its disc, at rest, hover and press: 4.5:1 (held to the
 *     text bar although an icon needs 3:1, because the cross is the only
 *     thing that says what the control does);
 *   - the disc against every ground it is drawn on, at rest: 3:1 (WCAG
 *     1.4.11, the non-text bar), so the control is visible as a control and
 *     not only as a glyph.
 *
 * Neutral is one mid tone in both themes, so it is measured against light
 * AND dark grounds in both: paper, band, ink (a dark sidebar, an inverse
 * toast) and, in dark, band and raised. On-brand is measured on brand and
 * brand-deep.
 */

type RGB = [number, number, number]
type Theme = 'light' | 'dark'

const COLORS = readFileSync(resolve(process.cwd(), 'src/tokens/colors.css'), 'utf8')

function lin(c: number): number {
    const s = c / 255
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
}
function lum([r, g, b]: RGB): number {
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}
function ratio(a: RGB, b: RGB): number {
    const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x)
    return (hi + 0.05) / (lo + 0.05)
}
function hex(h: string): RGB {
    const v = h.replace('#', '')
    return [0, 2, 4].map((i) => parseInt(v.slice(i, i + 2), 16)) as RGB
}
function scope(theme: Theme): string {
    const split = COLORS.search(/^\[data-theme="dark"\] \{/m)
    expect(split, 'dark block not found').toBeGreaterThan(0)
    return theme === 'light' ? COLORS.slice(0, split) : COLORS.slice(split)
}
function token(name: string, theme: Theme): RGB {
    const m = new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6});`).exec(scope(theme))
    if (!m) throw new Error(`--${name} is not an opaque hex in ${theme}`)
    return hex(m[1])
}

const THEMES: Theme[] = ['light', 'dark']
const INK: RGB = hex('#0e0a1a')
const WHITE: RGB = hex('#ffffff')

describe('IconButton: the glyph reads on its disc, at rest, hover and press', () => {
    for (const theme of THEMES) {
        it.each([
            ['neutral', 'icon-disc', 'on-icon-disc'],
            ['neutral hover', 'icon-disc-hover', 'on-icon-disc'],
            ['neutral press', 'icon-disc-press', 'on-icon-disc'],
            ['onbrand', 'icon-disc-onbrand', 'on-icon-disc-onbrand'],
            ['onbrand hover', 'icon-disc-onbrand-hover', 'on-icon-disc-onbrand'],
            ['onbrand press', 'icon-disc-onbrand-press', 'on-icon-disc-onbrand'],
        ])(`${theme}: %s is at least 4.5:1`, (_name, disc, glyph) => {
            const r = ratio(token(glyph, theme), token(disc, theme))
            expect(r, `${r.toFixed(2)}:1`).toBeGreaterThanOrEqual(4.5)
        })
    }
})

describe('IconButton: the disc is visible against its ground (3:1), so it reads as a control', () => {
    for (const theme of THEMES) {
        const grounds: [string, RGB][] = [
            ['paper', token('paper', theme)],
            ['band', token('band', theme)],
            ['raised', token('raised', theme)],
            // A dark sidebar in a light app, and the inverse toast in either theme.
            ['ink', INK],
            ['white', WHITE],
        ]
        it.each(grounds)(`${theme}: the neutral disc on %s`, (_g, ground) => {
            const r = ratio(token('icon-disc', theme), ground)
            expect(r, `${r.toFixed(2)}:1`).toBeGreaterThanOrEqual(3)
        })
        it.each([
            ['brand', token('brand', theme)],
            ['brand-deep', token('brand-deep', theme)],
            ['hero', token('hero', theme)],
        ] as [string, RGB][])(`${theme}: the on-brand disc on %s`, (_g, ground) => {
            const r = ratio(token('icon-disc-onbrand', theme), ground)
            expect(r, `${r.toFixed(2)}:1`).toBeGreaterThanOrEqual(3)
        })
    }

    it('dark: hover and press step lighter, away from the dark page', () => {
        const paper = token('paper', 'dark')
        expect(ratio(token('icon-disc-hover', 'dark'), paper)).toBeGreaterThanOrEqual(ratio(token('icon-disc', 'dark'), paper))
        expect(ratio(token('icon-disc-press', 'dark'), paper)).toBeGreaterThanOrEqual(ratio(token('icon-disc', 'dark'), paper))
    })
})
