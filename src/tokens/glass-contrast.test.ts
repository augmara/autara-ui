import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * AUTM-948 — glass is the risk the Autara Glass direction ships with, and it
 * is a measurable one.
 *
 * Body text on a translucent surface over a gradient is legible in one
 * corner of the page and marginal in another. That is not a rhetorical
 * worry: the naive dark implementation (white at low alpha, which is what
 * `Card variant="glass"` did before this) put `--text-muted` at **3.62:1**
 * and `--text-subtle` at **2.73:1** over an aqua bloom, and `--accent` at
 * **1.79:1**. Nothing about that is visible in a screenshot of the top-left
 * of a page.
 *
 * So the whole matrix is asserted: every text token × every bloom × both
 * themes × both glass fills. Both files are READ, not mirrored into
 * constants — the assertions have to fail when someone edits the stylesheet,
 * which is the only place these values live. (Same reason
 * `text-contrast.test.ts` reads `colors.css`.)
 *
 * A note on what is NOT modelled: `backdrop-filter: blur()` samples and
 * averages the ground. Averaging moves a pixel TOWARD the mean, so the
 * worst case for contrast is the un-blurred composite — a bloom at full
 * strength directly behind the text. Measuring the composite is therefore
 * the conservative choice, not a simplification that flatters the result.
 */

const COLORS = readFileSync(resolve(process.cwd(), 'src/tokens/colors.css'), 'utf8')
const GLASS = readFileSync(resolve(process.cwd(), 'src/tokens/glass.css'), 'utf8')

type RGB = [number, number, number]
type Theme = 'light' | 'dark'

const srgbToLinear = (c: number) => {
    const s = c / 255
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
}
const luminance = ([r, g, b]: RGB) =>
    0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b)

/** Composite a partly-transparent foreground over an opaque background. */
const over = (fg: RGB, alpha: number, bg: RGB): RGB =>
    bg.map((c, i) => c + alpha * (fg[i] - c)) as RGB

const contrast = (a: RGB, b: RGB) => {
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
    return (hi + 0.05) / (lo + 0.05)
}

const hex = (h: string): RGB =>
    [0, 2, 4].map((i) => parseInt(h.replace('#', '').slice(i, i + 2), 16)) as RGB

/**
 * Slice a stylesheet to one theme's scope. Slice at the SELECTOR, not the
 * first mention of the string — the header comments name it too, and matching
 * those collapses the light scope to nothing and silently passes everything
 * (the trap `text-contrast.test.ts` documents).
 */
function scope(css: string, theme: Theme): string {
    // Anchor on the element-level selector line at column 0. AUTM-948 widened
    // the dark block to `:root[data-theme="dark"], [data-theme="dark"] {`, and
    // the surrounding prose mentions the attribute several times — only the
    // real selector begins a line and is followed by ` {`.
    const split = css.search(/^\[data-theme="dark"\] \{/m)
    if (split < 0) throw new Error('dark selector not found — did the file move?')
    return theme === 'light' ? css.slice(0, split) : css.slice(split)
}

/** `--name: rgba(r, g, b, a)` or `--name: #hex`, resolved to rgb + alpha. */
function token(css: string, name: string, theme: Theme): { rgb: RGB; alpha: number } {
    const s = scope(css, theme)
    const rgba = new RegExp(`--${name}:\\s*rgba\\(([^)]+)\\)`).exec(s)
    if (rgba) {
        const [r, g, b, a] = rgba[1].split(',').map((n) => Number(n.trim()))
        return { rgb: [r, g, b], alpha: a }
    }
    const solid = new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`).exec(s)
    if (!solid) throw new Error(`--${name} not found in ${theme}`)
    return { rgb: hex(solid[1]), alpha: 1 }
}

const num = (css: string, name: string, theme: Theme): number => {
    const m = new RegExp(`--${name}:\\s*([\\d.]+)`).exec(scope(css, theme))
    if (!m) throw new Error(`--${name} not found in ${theme}`)
    return Number(m[1])
}

/** The pixel a glass surface actually paints, over a given ground. */
function glassPixel(theme: Theme, fillToken: string, ground: RGB): RGB {
    const fill = token(GLASS, fillToken, theme)
    return over(fill.rgb, fill.alpha, ground)
}

/** Canvas, plus the canvas with each bloom at its peak alpha over it. */
function grounds(theme: Theme): [string, RGB][] {
    const canvas = token(COLORS, 'background', theme)
    const alpha = num(GLASS, 'bloom-alpha', theme)
    return [
        ['flat canvas', canvas.rgb],
        ...(['act', 'flight', 'money'] as const).map(
            (b) =>
                [`${b} bloom`, over(token(GLASS, `bloom-${b}`, theme).rgb, alpha, canvas.rgb)] as [
                    string,
                    RGB,
                ]
        ),
    ]
}

const AA_BODY = 4.5
const THEMES: Theme[] = ['light', 'dark']
const TEXT_TOKENS = ['text-strong', 'text-muted', 'text-subtle'] as const
const FILLS = ['glass-fill', 'glass-fill-strong'] as const

describe('every text token clears AA on glass, over every bloom, in both themes', () => {
    for (const theme of THEMES) {
        for (const fill of FILLS) {
            for (const [groundName, ground] of grounds(theme)) {
                const surface = glassPixel(theme, fill, ground)
                for (const t of TEXT_TOKENS) {
                    it(`${theme} · --${fill} · ${groundName} · --${t}`, () => {
                        const ink = token(COLORS, t, theme)
                        const ratio = contrast(over(ink.rgb, ink.alpha, surface), surface)
                        expect(ratio).toBeGreaterThanOrEqual(AA_BODY)
                    })
                }
            }
        }
    }
})

/**
 * The semantic accents are text-grade values and get held to the body floor
 * too. `--flight` is the one that needed real work: the reference mockup's
 * #0e7c97 clears on pure white (4.83:1) and fails on `--surface-elevated`
 * (4.31:1) and on glass over a purple bloom (4.36:1) — measured against one
 * surface and shipped, exactly the blind spot AUTM-737 corrected for
 * `--text-subtle`.
 */
describe('semantic accents clear AA as ink on glass', () => {
    for (const theme of THEMES) {
        for (const fill of FILLS) {
            for (const [groundName, ground] of grounds(theme)) {
                const surface = glassPixel(theme, fill, ground)
                for (const a of ['act', 'flight', 'money'] as const) {
                    it(`${theme} · --${fill} · ${groundName} · --${a}`, () => {
                        // --act aliases --accent via var(); resolve through.
                        const name = a === 'act' ? 'accent' : a
                        const src = a === 'act' ? COLORS : GLASS
                        const ink = token(src, name, theme)
                        expect(
                            contrast(over(ink.rgb, ink.alpha, surface), surface)
                        ).toBeGreaterThanOrEqual(AA_BODY)
                    })
                }
            }
        }
    }
})

/**
 * Rule 3 — status is a SOLID fill, never a tint. A solid fill only works if
 * its on-colour is legible on it, and that pairing is a contract: never use
 * a `-fill` as ink or a text value as a fill.
 */
describe('every solid accent fill carries a legible on-colour', () => {
    for (const theme of THEMES) {
        for (const a of ['act', 'flight', 'money'] as const) {
            it(`${theme} · --${a}-fill under --on-${a}`, () => {
                const fill =
                    a === 'act'
                        ? token(COLORS, 'accent-fill', theme)
                        : token(GLASS, `${a}-fill`, theme)
                const on =
                    a === 'act'
                        ? token(COLORS, 'on-accent', theme)
                        : token(GLASS, `on-${a}`, theme)
                expect(contrast(fill.rgb, on.rgb)).toBeGreaterThanOrEqual(AA_BODY)
            })
        }
    }
})

/**
 * The raw brand aqua and lime are FILLS. They measure 1.45:1 and 1.51:1 as
 * ink on white and must never end up as a light-mode text value. This pins
 * that: if someone "simplifies" `--flight` in light mode back to the brand
 * hex, this fails with the reason attached.
 */
describe('the raw brand accents are never light-mode ink', () => {
    it.each([
        ['aqua', '#4ceaff'],
        ['lime', '#b7e149'],
    ])('%s is not used as a light-mode text token', (_name, brandHex) => {
        for (const t of ['flight', 'money'] as const) {
            expect(token(GLASS, t, 'light').rgb).not.toEqual(hex(brandHex))
        }
    })
})

/**
 * `--bloom-alpha` is a contrast bound, not a taste value. At 0.55 — which
 * looks better in a static mockup — dark `--text-subtle` over an aqua bloom
 * falls to 3.99:1. Anyone raising it has to move the text ladder first, and
 * the matrix above will tell them so; this asserts the intent directly so
 * the reason survives.
 */
describe('bloom strength stays inside its contrast budget', () => {
    for (const theme of THEMES) {
        it(`${theme} bloom-alpha is capped`, () => {
            expect(num(GLASS, 'bloom-alpha', theme)).toBeLessThanOrEqual(0.35)
        })
    }
})

/**
 * Rule 2 — the 1px inset top highlight is load-bearing. Without it glass
 * reads as flat grey and the direction collapses. It is one line and it is
 * exactly the sort of line a cleanup pass deletes, so it is pinned.
 */
describe('the inset top highlight exists in both themes', () => {
    for (const theme of THEMES) {
        it(`${theme} defines --glass-hi`, () => {
            expect(() => token(GLASS, 'glass-hi', theme)).not.toThrow()
        })
    }
    it('.glass-surface applies it as an INSET shadow, not a drop shadow', () => {
        const css = readFileSync(
            resolve(process.cwd(), 'src/utilities/glass.css'),
            'utf8'
        )
        expect(css).toMatch(/box-shadow:\s*inset 0 1px 0 var\(--glass-hi\)/)
        // No drop shadows anywhere — rule 6, and the standing house rule.
        // `\s+` not `\s*` — with `*` the lookahead is evaluated at zero
        // whitespace, sees " inset", and "matches" every inset shadow.
        const dropShadow = /box-shadow:\s+(?!inset|none)/g
        expect(css.match(dropShadow)).toBeNull()
    })
})
