import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * AUTM-1756 (Don, 2026-10-05): every icon-only control is a FILLED disc, never
 * a bare glyph or a faint ring. On light grounds it is the Wise pattern, a
 * soft lavender grey disc with an ink glyph (Don, of a mid grey disc with a
 * white glyph: "too much dark on white screen"); on dark grounds a disc a
 * step lighter than the surface with a white glyph.
 *
 * WHAT IS HELD TO WHICH BAR, and why. WCAG 1.4.11 (non-text contrast) asks for
 * 3:1 on the visual information REQUIRED TO IDENTIFY a control. For an icon
 * button that information is the icon: it says the control is there and what
 * it does. The W3C's Understanding note for 1.4.11 says as much for buttons
 * whose text or icon identifies them: the boundary or fill behind it is not
 * required to meet 3:1. So:
 *
 *   - the GLYPH against its disc is held to 4.5:1 (above the 3:1 it needs,
 *     because the cross is the one thing that says "close"), at rest, hover
 *     and press, in both themes;
 *   - the DISC against its ground is held to a VISIBILITY floor, 1.2:1, not
 *     to 3:1. It has to read as a filled circle, so a target is visible and
 *     Don's "faint ring" cannot come back, but it does not identify the
 *     control. Holding it to 3:1 is what produced the mid grey disc Don
 *     rejected.
 *   - hover and press must visibly CHANGE the disc, in the right direction:
 *     darker on light, lighter on dark, by at least 1.05:1 a step.
 *
 * All values are read from the token file, so a token change that breaks any
 * of these fails here.
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
const GLYPH = 4.5
const VISIBLE = 1.2
const STEP = 1.05

describe('IconButton: the glyph identifies the control, so it is held to 4.5:1 on its disc', () => {
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
            expect(r, `${r.toFixed(2)}:1`).toBeGreaterThanOrEqual(GLYPH)
        })
    }

    it('light: the glyph is ink, a dark glyph on a soft disc (the Wise pattern)', () => {
        expect(token('on-icon-disc', 'light')).toEqual(token('strong', 'light'))
        expect(lum(token('icon-disc', 'light'))).toBeGreaterThan(0.5)
    })

    it('dark: the glyph is white, on a disc a step lighter than the surface', () => {
        expect(token('on-icon-disc', 'dark')).toEqual(hex('#ffffff'))
        expect(lum(token('icon-disc', 'dark'))).toBeGreaterThan(lum(token('raised', 'dark')))
    })
})

describe('IconButton: the disc is visible on its ground (1.2:1 floor, not the 3:1 bar)', () => {
    for (const theme of THEMES) {
        it.each(['paper', 'band', 'raised'])(`${theme}: the neutral disc shows on %s`, (ground) => {
            const r = ratio(token('icon-disc', theme), token(ground, theme))
            expect(r, `${r.toFixed(2)}:1`).toBeGreaterThanOrEqual(VISIBLE)
        })
        it.each(['brand', 'brand-deep', 'hero'])(`${theme}: the on-brand disc shows on %s`, (ground) => {
            const r = ratio(token('icon-disc-onbrand', theme), token(ground, theme))
            expect(r, `${r.toFixed(2)}:1`).toBeGreaterThanOrEqual(VISIBLE)
        })
    }

    // The inverse toast is ink in light and white in dark; its dismiss carries
    // data-theme="dark", so it is the DARK disc on both.
    it.each([
        ['ink (the light theme inverse toast, an ink sidebar)', hex('#0e0a1a')],
        ['white (the dark theme inverse toast)', hex('#ffffff')],
    ] as [string, RGB][])('the dark-island disc shows on %s', (_g, ground) => {
        const r = ratio(token('icon-disc', 'dark'), ground)
        expect(r, `${r.toFixed(2)}:1`).toBeGreaterThanOrEqual(VISIBLE)
    })
})

describe('IconButton: hover and press visibly change the disc, in the right direction', () => {
    it.each([
        ['light', 'darker'],
        ['dark', 'lighter'],
    ] as [Theme, 'darker' | 'lighter'][])('%s: each step is %s, by at least 1.05:1', (theme, dir) => {
        const rest = token('icon-disc', theme)
        const hover = token('icon-disc-hover', theme)
        const press = token('icon-disc-press', theme)
        const sign = dir === 'darker' ? -1 : 1
        expect(Math.sign(lum(hover) - lum(rest))).toBe(sign)
        expect(Math.sign(lum(press) - lum(hover))).toBe(sign)
        expect(ratio(rest, hover)).toBeGreaterThanOrEqual(STEP)
        expect(ratio(hover, press)).toBeGreaterThanOrEqual(STEP)
    })

    it('on-brand: hover and press step down from white', () => {
        const rest = token('icon-disc-onbrand', 'light')
        const hover = token('icon-disc-onbrand-hover', 'light')
        const press = token('icon-disc-onbrand-press', 'light')
        expect(lum(hover)).toBeLessThan(lum(rest))
        expect(lum(press)).toBeLessThan(lum(hover))
        expect(ratio(rest, hover)).toBeGreaterThanOrEqual(STEP)
        expect(ratio(hover, press)).toBeGreaterThanOrEqual(STEP)
    })
})
