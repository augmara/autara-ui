import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * AUTM-1594 — the Autara Web palette (canvas v44 UiComponents and
 * UiComponentsDark) clears its floors in both themes.
 *
 * The sheet draws text on three surfaces (paper, band, raised) and labels on
 * six fills. Each pair the sheet actually uses is asserted here, so a value
 * edited in colors.css that breaks one fails by name. Reads the stylesheet,
 * like text-contrast.test.ts beside it.
 */

const CSS = readFileSync(resolve(process.cwd(), 'src/tokens/colors.css'), 'utf8')

type RGB = [number, number, number]

const lin = (c: number) => {
    const s = c / 255
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
}
const luminance = ([r, g, b]: RGB) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
const over = (fg: RGB, a: number, bg: RGB) => bg.map((c, i) => c + a * (fg[i] - c)) as RGB
const contrast = (a: RGB, b: RGB) => {
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
    return (hi + 0.05) / (lo + 0.05)
}
const hex = (h: string) => [0, 2, 4].map((i) => parseInt(h.slice(1 + i, 3 + i), 16)) as RGB

function token(name: string, theme: 'light' | 'dark'): { rgb: RGB; alpha: number } {
    const split = CSS.search(/^\[data-theme="dark"\] \{/m)
    if (split < 0) throw new Error('dark selector not found')
    const scope = theme === 'light' ? CSS.slice(0, split) : CSS.slice(split)
    const rgba = new RegExp(`--${name}:\\s*rgba\\(([^)]+)\\)`).exec(scope)
    if (rgba) {
        const [r, g, b, a] = rgba[1].split(',').map((n) => Number(n.trim()))
        return { rgb: [r, g, b], alpha: a }
    }
    const solid = new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6});`).exec(scope)
    if (!solid) throw new Error(`--${name} not found in ${theme}`)
    return { rgb: hex(solid[1]), alpha: 1 }
}

const ratio = (fg: string, bg: string, theme: 'light' | 'dark') => {
    const f = token(fg, theme)
    const b = token(bg, theme)
    return contrast(over(f.rgb, f.alpha, b.rgb), b.rgb)
}

const AA = 4.5
const NON_TEXT = 3

describe('Autara Web palette', () => {
    for (const theme of ['light', 'dark'] as const) {
        for (const surface of ['paper', 'band', 'raised']) {
            for (const text of ['text-strong', 'text-muted', 'text-subtle', 'accent', 'danger']) {
                it(`${theme}: --${text} reads on --${surface}`, () => {
                    expect(ratio(text, surface, theme)).toBeGreaterThanOrEqual(AA)
                })
            }
        }

        const labels: Array<[string, string]> = [
            ['on-strong', 'strong'],
            ['on-brand', 'brand'],
            ['on-deep', 'brand-deep'],
            ['on-deep-muted', 'brand-deep'],
            ['on-lime', 'lime'],
            ['on-aqua', 'aqua'],
            ['on-amber', 'amber'],
            ['on-selected', 'selected'],
        ]
        for (const [label, fill] of labels) {
            it(`${theme}: --${label} reads on --${fill}`, () => {
                expect(ratio(label, fill, theme)).toBeGreaterThanOrEqual(AA)
            })
        }

        it(`${theme}: the open dot and the field edge are visible on paper`, () => {
            expect(ratio('positive', 'paper', theme)).toBeGreaterThanOrEqual(NON_TEXT)
            expect(ratio('field-edge', 'paper', theme)).toBeGreaterThanOrEqual(NON_TEXT)
        })

        it(`${theme}: band sits one step off paper, raised one step off band`, () => {
            // No shadows, so these steps are the only depth there is. Equal
            // values would flatten a card into the page.
            expect(token('band', theme)).not.toEqual(token('paper', theme))
            expect(token('raised', theme)).not.toEqual(token('band', theme))
        })
    }

    it('lime on band is the pairing the sheet forbids, and why', () => {
        // Lime is never placed on band; the action there is strong. 1.03:1 is
        // the reason, so it is pinned as a fact rather than left to memory.
        expect(ratio('lime', 'band', 'light')).toBeLessThan(1.2)
    })
})
