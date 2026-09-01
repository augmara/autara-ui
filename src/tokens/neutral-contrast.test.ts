import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * AUTM-969 — the contract for `--neutral-fill`, the achromatic member of the
 * semantic-fill family.
 *
 * Two things have to hold, and the SECOND is the one that matters here.
 *
 *   1. Its on-colour is legible on it. Same contract every `-fill` token
 *      carries: never use a `-fill` as ink or a text value as a fill.
 *
 *   2. The FILL is a legible tonal step from every ground it can sit on.
 *      This is what makes it a solid rather than an outline. The reason
 *      `ModeChip` needed `ring-1 ring-inset` at all was that its fill,
 *      `--surface-elevated`, is ~1.05:1 from the card — the fill was
 *      invisible, so the ring became the chip. Rule 4 of the Autara Glass
 *      direction bans exactly that, and a fill token that cannot carry a
 *      shape on its own quietly reintroduces it.
 *
 * `AA_BODY` is the floor for (1). For (2) the floor is `SOLID_STEP`, which is
 * deliberately above the AUTM-713 card-to-canvas target of 1.3:1: a card is
 * ALLOWED to be a whisper off the canvas because it is large and its content
 * defines it. A chip is small and has nothing inside it but four characters,
 * so it has to be a step you can see without looking for it.
 *
 * Reads the stylesheet rather than a JS constant, like its two neighbours, so
 * editing the CSS is what fails the test.
 */

const COLORS = readFileSync(resolve(process.cwd(), 'src/tokens/colors.css'), 'utf8')
const GLASS = readFileSync(resolve(process.cwd(), 'src/tokens/glass.css'), 'utf8')

const AA_BODY = 4.5
/** A fill has to define its own shape without an edge. */
const SOLID_STEP = 1.5

type RGB = [number, number, number]
type Theme = 'light' | 'dark'
const THEMES: Theme[] = ['light', 'dark']

function srgbToLinear(c: number): number {
    const s = c / 255
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
}

function luminance([r, g, b]: RGB): number {
    return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b)
}

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

/**
 * Scope to a theme block. Anchored on the element-level selector at column 0
 * — the header prose mentions `data-theme="dark"` too, and matching that
 * collapses the light scope to nothing and passes every light assertion
 * vacuously (the bug `text-contrast.test.ts` records).
 */
function scope(css: string, theme: Theme): string {
    const split = css.search(/^\[data-theme="dark"\] \{/m)
    if (split < 0) throw new Error('dark selector not found — did the file move?')
    return theme === 'light' ? css.slice(0, split) : css.slice(split)
}

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

/** Flat glass, and glass over each of the three blooms. */
function grounds(theme: Theme): [string, RGB][] {
    const canvas = token(COLORS, 'background', theme)
    const fill = token(GLASS, 'glass-fill', theme)
    const alpha = Number(/--bloom-alpha:\s*([\d.]+)/.exec(scope(GLASS, theme))![1])

    const opaque: [string, RGB][] = [
        ['--surface', token(COLORS, 'surface', theme).rgb],
        ['--surface-elevated', token(COLORS, 'surface-elevated', theme).rgb],
        ['--background', canvas.rgb],
    ]
    const glassy: [string, RGB][] = [
        ['glass · flat', over(fill.rgb, fill.alpha, canvas.rgb)],
        ...(['act', 'flight', 'money'] as const).map(
            (b) =>
                [
                    `glass · ${b} bloom`,
                    over(
                        fill.rgb,
                        fill.alpha,
                        over(token(GLASS, `bloom-${b}`, theme).rgb, alpha, canvas.rgb)
                    ),
                ] as [string, RGB]
        ),
    ]
    return [...opaque, ...glassy]
}

describe('the neutral fill carries a legible label', () => {
    for (const theme of THEMES) {
        for (const fill of ['neutral-fill', 'neutral-fill-hover'] as const) {
            it(`${theme} · --${fill} under --on-neutral`, () => {
                const bg = token(GLASS, fill, theme)
                const ink = token(GLASS, 'on-neutral', theme)
                // The chip label is small (11–12px at a 16px root), so hold it
                // to the AAA small-text bar rather than the AA one. It has the
                // headroom; a token that only just cleared 4.5 would not
                // survive the next time someone dims it "slightly".
                expect(contrast(bg.rgb, ink.rgb)).toBeGreaterThanOrEqual(7)
            })
        }
    }
})

describe('the neutral fill defines its own shape — no ring needed', () => {
    for (const theme of THEMES) {
        for (const [name, ground] of grounds(theme)) {
            it(`${theme} · --neutral-fill on ${name}`, () => {
                const fill = token(GLASS, 'neutral-fill', theme)
                expect(
                    contrast(over(fill.rgb, fill.alpha, ground), ground)
                ).toBeGreaterThanOrEqual(SOLID_STEP)
            })
        }
    }
})

/**
 * `--surface-elevated` is what the outlined chip used, and it is the value a
 * future "simplification" would reach back for. Pinned with the number
 * attached so the failure explains itself.
 */
describe('the token that caused the outline could never have worked', () => {
    for (const theme of THEMES) {
        it(`${theme} · --surface-elevated is below the solid-step floor on --surface`, () => {
            const elevated = token(COLORS, 'surface-elevated', theme)
            const surface = token(COLORS, 'surface', theme)
            expect(contrast(elevated.rgb, surface.rgb)).toBeLessThan(SOLID_STEP)
        })
    }
})

/**
 * Rule 5 — purple ACTS, aqua is IN FLIGHT, lime is DONE. The neutral exists
 * so metadata does not have to spend one of those, which only holds if it is
 * genuinely achromatic. A "neutral" that drifted into a purple tint would
 * quietly reintroduce the dilution it was added to prevent.
 *
 * Held to a channel spread rather than a strict grey: the dark ramp is
 * documented as "near-black carrying a whisper of the brand's purple ink"
 * and this slate belongs to that family. `colors.css` records the spread the
 * shipped dark ramp holds — 7 to 12 — and calls a spread of 31 "violet
 * rather than a dark neutral carrying a hint of the brand".
 */
describe('the neutral fill stays neutral', () => {
    for (const theme of THEMES) {
        for (const fill of ['neutral-fill', 'neutral-fill-hover'] as const) {
            it(`${theme} · --${fill} is a slate, not an accent`, () => {
                const [r, g, b] = token(GLASS, fill, theme).rgb
                expect(Math.max(r, g, b) - Math.min(r, g, b)).toBeLessThanOrEqual(25)
            })
        }
    }
})
