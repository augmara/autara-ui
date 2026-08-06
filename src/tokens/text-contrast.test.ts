import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * AUTM-737 — every text token has to clear WCAG 1.4.3 on every surface it is
 * allowed to sit on, in BOTH themes.
 *
 * The light ladder shipped for months at `--text-subtle: .42` = **2.85:1**,
 * under the 4.5:1 floor for text below 18pt — and nothing uses that token
 * above 18pt, it is the small-label token. It survived because the dark
 * ladder was measured (AUTM-734) and the light one, being older, never was.
 *
 * `--surface-elevated` is the surface that actually loses the argument: it is
 * darker than white, so a token that only just clears on `--surface` fails on
 * it. Both are asserted.
 *
 * Reads the CSS rather than a JS constant so the test fails when someone
 * edits the stylesheet, which is the only place these values live.
 */

const CSS = readFileSync(resolve(process.cwd(), 'src/tokens/colors.css'), 'utf8')

type RGB = [number, number, number]

function srgbToLinear(c: number): number {
    const s = c / 255
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
}

function luminance([r, g, b]: RGB): number {
    return (
        0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b)
    )
}

/** Composite a partly-transparent foreground over an opaque background. */
function over(fg: RGB, alpha: number, bg: RGB): RGB {
    return bg.map((c, i) => c + alpha * (fg[i] - c)) as RGB
}

function contrast(a: RGB, b: RGB): number {
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
    return (hi + 0.05) / (lo + 0.05)
}

function hex(h: string): RGB {
    const v = h.replace('#', '')
    return [0, 2, 4].map((i) => parseInt(v.slice(i, i + 2), 16)) as RGB
}

/** Pull `--name: rgba(r, g, b, a)` or `--name: #hex` out of a theme block. */
function token(name: string, theme: 'light' | 'dark'): { rgb: RGB; alpha: number } {
    // The dark values live under `:root[data-theme="dark"]`; light under the
    // plain `:root`. Slice at the SELECTOR, not the first mention of the
    // string — the header comment names it too, and matching that collapsed
    // the light scope to nothing and failed every light assertion.
    const split = CSS.indexOf(':root[data-theme="dark"] {')
    if (split < 0) throw new Error('dark selector not found — did colors.css move?')
    const scope = theme === 'light' ? CSS.slice(0, split) : CSS.slice(split)
    const rgba = new RegExp(`--${name}:\\s*rgba\\(([^)]+)\\)`).exec(scope)
    if (rgba) {
        const [r, g, b, a] = rgba[1].split(',').map((n) => Number(n.trim()))
        return { rgb: [r, g, b], alpha: a }
    }
    const solid = new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`).exec(scope)
    if (!solid) throw new Error(`--${name} not found in ${theme}`)
    return { rgb: hex(solid[1]), alpha: 1 }
}

function ratioOn(tokenName: string, surfaceName: string, theme: 'light' | 'dark') {
    const fg = token(tokenName, theme)
    const bg = token(surfaceName, theme)
    return contrast(over(fg.rgb, fg.alpha, bg.rgb), bg.rgb)
}

const AA_BODY = 4.5

describe('text tokens clear WCAG AA on every surface', () => {
    for (const theme of ['light', 'dark'] as const) {
        for (const text of ['text-strong', 'text-muted', 'text-subtle']) {
            for (const surface of ['surface', 'surface-elevated']) {
                it(`${theme}: --${text} on --${surface}`, () => {
                    expect(ratioOn(text, surface, theme)).toBeGreaterThanOrEqual(AA_BODY)
                })
            }
        }
    }

    /**
     * Passing the floor is not enough — the three levels have to stay
     * distinguishable, or the hierarchy is decorative. Guard the gap so a
     * future "just make subtle darker" fix cannot quietly merge two levels.
     */
    for (const theme of ['light', 'dark'] as const) {
        it(`${theme}: muted stays clearly stronger than subtle`, () => {
            const muted = ratioOn('text-muted', 'surface', theme)
            const subtle = ratioOn('text-subtle', 'surface', theme)
            expect(muted / subtle).toBeGreaterThan(1.4)
        })
    }
})
