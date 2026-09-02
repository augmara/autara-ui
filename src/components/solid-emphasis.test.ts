import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

/**
 * RULE 4 — Don, 2026-09-01, with a screenshot of the light-mode active nav
 * row: "no outline buttons or sections, boxes as we discussed. everything
 * should be solid."
 *
 * Emphasis is carried by a SOLID FILL. Not a pastel tint of the accent, not a
 * ring, not an outlined box, not a tint-plus-ring. That covers status,
 * outlined buttons, outlined section containers and active states.
 *
 * ─── The exception, which is a material and not a loophole ──────────────
 *
 * The 1px hairline on a GLASS surface is the material itself: rule 2 requires
 * it alongside the blur and the inset top highlight, and rule 7 makes blur the
 * only depth device in the system. The test the direction doc states, and the
 * one this file encodes:
 *
 *   Is the border doing the job a fill should do — marking something as
 *   selected, primary, or important? Then it is banned.
 *   Is it defining where a TRANSLUCENT surface ends? Then it is the material.
 *
 * A focus indicator is neither. It is a third thing, it is required, and it is
 * checked separately at the bottom of this file.
 *
 * ─── Why a source scan ──────────────────────────────────────────────────
 *
 * Same reason as `default-variant.test.ts` and `shape-language.test.ts`: jsdom
 * has no stylesheet, so a render assertion would pass while the real app was
 * still a box.
 *
 * The contrast half is computed from the token stylesheets rather than from a
 * constant, so editing the CSS is what fails the test. Every fill involved is
 * OPAQUE, so compositing it is exact arithmetic rather than an estimate — the
 * "measure the rendered pixels" rule exists because `getComputedStyle` cannot
 * judge GLASS over a sibling ground layer, and nothing asserted here is glass.
 */

const DIR = resolve(process.cwd(), 'src/components')
const TOKENS = resolve(process.cwd(), 'src/tokens')

/** The components AUTM-974 swept. The list is allowed to grow, never shrink. */
const SWEPT = [
    'Tabs.tsx',
    'PickerSheet.tsx',
    'MultiSelect.tsx',
    'Table.tsx',
    'MetaChip.tsx',
    'FilterChipRow.tsx',
    'Badge.tsx',
]

/** Strip comments — they quote the banned pattern on purpose, as documentation. */
function code(text: string): string {
    let inBlock = false
    return text
        .split('\n')
        .filter((line) => {
            const t = line.trim()
            if (t.startsWith('/*')) inBlock = true
            const was = inBlock
            if (t.endsWith('*/')) inBlock = false
            return !was && !t.startsWith('//') && !t.startsWith('*')
        })
        .join('\n')
}

function source(file: string): string {
    return code(readFileSync(join(DIR, file), 'utf8'))
}

/**
 * Lines carrying a `ring-*` utility that is neither a focus indicator nor the
 * edge of a glass surface.
 *
 * Word-wise rather than line-wise on the variant check, because
 * `focus-visible:ring-2 focus-visible:ring-offset-2` and a state ring can sit
 * on the same line; glass is checked line-wise because `ring-1 ring-inset`
 * carries no colour of its own and only the sibling `ring-[…]` says which
 * surface it belongs to.
 */
function emphasisRings(text: string): string[] {
    return text
        .split('\n')
        .filter((line) => !line.includes('--glass-'))
        .flatMap((line) =>
            line
                .split(/[\s'"`,]+/)
                .filter(
                    (w) =>
                        /(^|:)ring(-|$)/.test(w) &&
                        !w.includes('focus-visible:') &&
                        !w.includes('focus-within:')
                )
        )
}

describe('no swept component carries a ring that is doing a fill’s job', () => {
    it.each(SWEPT)('%s', (file) => {
        expect(
            emphasisRings(source(file)),
            'a ring may only be a focus indicator or the edge of a glass surface'
        ).toEqual([])
    })
})

/**
 * Borders are pinned per component rather than banned outright, because a
 * border is legitimate in three places this sweep deliberately did not touch:
 * a form field's own edge, an unchecked checkbox (an empty box has no fill to
 * carry), and a floating panel over arbitrary page content.
 */
describe('the specific outlines this sweep removed stay removed', () => {
    it('Tabs has no border anywhere — the track was an outlined section box', () => {
        expect(source('Tabs.tsx')).not.toMatch(/\bborder\b/)
    })

    it('FilterChipRow has no border — the inactive chip was outlined', () => {
        expect(source('FilterChipRow.tsx')).not.toMatch(/\bborder\b/)
    })

    it('PickerSheet no longer marks selection with a purple border', () => {
        expect(source('PickerSheet.tsx')).not.toMatch(/border-autara-purple/)
    })

    it('MetaChip declares no border or ring in its tone table', () => {
        const tones = /const TONES[\s\S]*?\n};/.exec(source('MetaChip.tsx'))?.[0] ?? ''
        expect(tones).not.toBe('')
        expect(
            tones
                .split('\n')
                .filter((l) => !l.includes('--glass-'))
                .join('\n')
        ).not.toMatch(/\bring-|\bborder\b/)
    })

    it('Badge default is a solid fill, not a hairline box', () => {
        const s = source('Badge.tsx')
        const def = /\n\s*default:\s*\n?\s*'([^']*)'/.exec(s)?.[1] ?? ''
        expect(def).toContain('--neutral-fill')
        expect(def).not.toMatch(/\bborder\b|\bring-/)
    })
})

/**
 * AUTM-936's rule, applied where AUTM-974 found the last offender: Tailwind's
 * own ramps are static and the canvas is not. `bg-autara-purple-50` on a
 * selected table row measured 1.05:1 against the row beside it.
 */
describe('Table is built from tokens', () => {
    const RAW_PALETTE =
        /\b(?:bg|text|border|ring|divide)-autara-(?:gray|purple)-\d{2,3}\b/

    it('carries no raw palette ramp', () => {
        expect(RAW_PALETTE.exec(source('Table.tsx'))?.[0] ?? null).toBeNull()
    })

    it('paints the selected row solid AND moves the cell ink with it', () => {
        const s = source('Table.tsx')
        expect(s).toContain('data-[state=selected]:bg-[var(--act-fill)]')
        // `TableCell` sets its colour on the <td>, so a colour on the <tr>
        // alone loses to it — a solid row with cell-grade ink on top is the
        // banned-outline-for-failing-text trade this sweep exists to avoid.
        expect(s).toContain('data-[state=selected]:[&>td]:text-[var(--on-act)]')
    })
})

/** The fills that replaced an outline, and what each has to keep doing. */
describe('the replacements are actually solid', () => {
    it('Tabs marks the active trigger with a fill, not a ring', () => {
        const s = source('Tabs.tsx')
        expect(s).toContain('data-[state=active]:bg-[var(--act-fill)]')
        expect(s).toContain('data-[state=active]:text-[var(--on-act)]')
    })

    it('MetaChip neutral takes the achromatic solid added for it', () => {
        expect(source('MetaChip.tsx')).toContain(
            'neutral: "bg-[var(--neutral-fill)] text-[var(--on-neutral)]"'
        )
    })

    it('PickerSheet marks selection with a solid marker in both modes', () => {
        const s = source('PickerSheet.tsx')
        expect(
            s.match(/bg-\[var\(--act-fill\)\] text-\[var\(--on-act\)\]/g)?.length ?? 0
        ).toBeGreaterThanOrEqual(2)
    })
})

/* ─── The measured half ─────────────────────────────────────────────────── */

type RGB = [number, number, number]
type Theme = 'light' | 'dark'
const THEMES: Theme[] = ['light', 'dark']

const COLORS = readFileSync(join(TOKENS, 'colors.css'), 'utf8')
const GLASS = readFileSync(join(TOKENS, 'glass.css'), 'utf8')

const AA_BODY = 4.5
/** A fill has to define its own shape without an edge (AUTM-969's floor). */
const SOLID_STEP = 1.5
/** …or separate itself by hue and chroma instead. See `deltaE` below. */
const SOLID_DELTA_E = 25
/** WCAG 2.4.11 — a focus indicator against what is adjacent to it. */
const FOCUS_INDICATOR = 3

function srgbToLinear(c: number): number {
    const s = c / 255
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
}
function luminance([r, g, b]: RGB): number {
    return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b)
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
 * CIE L*a*b*, D65. Needed because WCAG contrast is a LUMINANCE ratio and
 * luminance is the wrong instrument for a saturated fill.
 *
 * `--money-fill` is brand lime #b7e149. Against `--surface-elevated` it
 * measures 1.35:1 — under the 1.5 solid-step floor — and yet a lime chip on a
 * cream card is not remotely hard to find, because what separates them is hue
 * and chroma, neither of which the ratio can see. Holding a chromatic fill to
 * an achromatic metric would either fail a fill that works or force the floor
 * down for the slate fills, where luminance IS the whole signal.
 *
 * So a fill defines its own shape if it clears EITHER bar. Both are reported
 * in the failure message so a regression says which one it broke.
 */
function lab([r, g, b]: RGB): [number, number, number] {
    const [R, G, B] = [r, g, b].map(srgbToLinear)
    // sRGB → XYZ (D65), then normalise by the D65 white point.
    const x = (0.4124 * R + 0.3576 * G + 0.1805 * B) / 0.95047
    const y = 0.2126 * R + 0.7152 * G + 0.0722 * B
    const z = (0.0193 * R + 0.1192 * G + 0.9505 * B) / 1.08883
    const f = (t: number) => (t > 216 / 24389 ? Math.cbrt(t) : (841 / 108) * t + 4 / 29)
    const [fx, fy, fz] = [f(x), f(y), f(z)]
    return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)]
}

/** CIE76 colour difference. ~2.3 is "just noticeable"; 25 is unmistakable. */
function deltaE(a: RGB, b: RGB): number {
    const [l1, a1, b1] = lab(a)
    const [l2, a2, b2] = lab(b)
    return Math.hypot(l1 - l2, a1 - a2, b1 - b2)
}

/**
 * Scope to a theme block, anchored on the element-level selector at column 0.
 * Matching the `:root[data-theme="dark"]` form instead collapses the LIGHT
 * scope to nothing and passes every light assertion vacuously — the bug
 * `text-contrast.test.ts` records, and worth not re-introducing here.
 */
function scope(css: string, theme: Theme): string {
    const split = css.search(/^\[data-theme="dark"\] \{/m)
    if (split < 0) throw new Error('dark selector not found — did the file move?')
    return theme === 'light' ? css.slice(0, split) : css.slice(split)
}

/** Resolve a token to an opaque RGB, following one level of `var()` aliasing. */
function token(name: string, theme: Theme): RGB {
    for (const css of [COLORS, GLASS]) {
        const s = scope(css, theme)
        const m = new RegExp(`--${name}:\\s*([^;]+);`).exec(s)
        if (!m) continue
        const value = m[1].trim()
        const solid = /^#[0-9a-fA-F]{6}$/.exec(value)
        if (solid) return hex(value)
        const alias = /^var\(--([\w-]+)\)$/.exec(value)
        if (alias) return token(alias[1], theme)
        throw new Error(`--${name} is not an opaque colour in ${theme}: ${value}`)
    }
    throw new Error(`--${name} not found in ${theme}`)
}

/**
 * Every fill that now carries emphasis, with the ink it has to hold and the
 * grounds it sits on in the components above.
 *
 *   act      Tabs active trigger, Table selected row, PickerSheet marker
 *   neutral  MetaChip neutral, Badge default
 *   money    MetaChip success (was a lime tint + ring)
 *   flight   MetaChip flight
 */
const FILLS: { fill: string; ink: string; grounds: string[] }[] = [
    { fill: 'act-fill', ink: 'on-act', grounds: ['surface', 'surface-elevated', 'background'] },
    { fill: 'neutral-fill', ink: 'on-neutral', grounds: ['surface', 'surface-elevated', 'background'] },
    { fill: 'money-fill', ink: 'on-money', grounds: ['surface', 'surface-elevated', 'background'] },
    { fill: 'flight-fill', ink: 'on-flight', grounds: ['surface', 'surface-elevated', 'background'] },
]

describe('every emphasis fill carries legible ink', () => {
    for (const theme of THEMES) {
        for (const { fill, ink } of FILLS) {
            it(`${theme} · --${ink} on --${fill}`, () => {
                expect(contrast(token(fill, theme), token(ink, theme))).toBeGreaterThanOrEqual(
                    AA_BODY
                )
            })
        }
    }
})

describe('every emphasis fill defines its own shape — that is what earns dropping the ring', () => {
    for (const theme of THEMES) {
        for (const { fill, grounds } of FILLS) {
            for (const ground of grounds) {
                it(`${theme} · --${fill} on --${ground}`, () => {
                    const f = token(fill, theme)
                    const g = token(ground, theme)
                    const ratio = contrast(f, g)
                    const de = deltaE(f, g)
                    expect(
                        ratio >= SOLID_STEP || de >= SOLID_DELTA_E,
                        `--${fill} on --${ground}: ${ratio.toFixed(2)}:1 luminance, ΔE ${de.toFixed(1)} — needs ${SOLID_STEP}:1 or ΔE ${SOLID_DELTA_E}`
                    ).toBe(true)
                })
            }
        }
    }
})

/**
 * THE TRAP, pinned.
 *
 * The merchant-mobile Today pass painted a row in a solid accent and left the
 * house `ring-[var(--accent)]/35` focus ring on it: purple on purple, 1.0:1,
 * and a keyboard user lost their place on the row they were most likely to be
 * on. Every component here now uses full-strength `--accent` with a 2px offset
 * band, and the band — not luck — is what keeps the ring off the fill.
 *
 * So the assertion is ring-vs-BAND, since the band is what the ring is
 * adjacent to on both sides. Each pair below is the offset colour the
 * component actually names.
 */
const FOCUS_BANDS: [string, string][] = [
    ['Tabs trigger', 'surface-elevated'],
    ['FilterChipRow chip', 'background'],
    ['PickerSheet row', 'surface'],
]

describe('the focus indicator survives the solid fill', () => {
    for (const theme of THEMES) {
        for (const [where, band] of FOCUS_BANDS) {
            it(`${theme} · ${where} — --accent against its --${band} offset band`, () => {
                expect(contrast(token('accent', theme), token(band, theme))).toBeGreaterThanOrEqual(
                    FOCUS_INDICATOR
                )
            })
        }
    }

    it.each(['Tabs.tsx', 'FilterChipRow.tsx', 'PickerSheet.tsx'])(
        '%s uses full-strength accent, not the /35 alpha that measures ~1.9:1',
        (file) => {
            const s = source(file)
            expect(s).toContain('focus-visible:ring-[var(--accent)]')
            expect(s).not.toMatch(/focus-visible:ring-\[var\(--accent\)\]\/\d/)
            expect(s).not.toMatch(/focus-visible:ring-autara-purple\/\d/)
        }
    )

    it('every focus ring in the swept set names the surface behind it', () => {
        const missing = ['Tabs.tsx', 'FilterChipRow.tsx', 'PickerSheet.tsx'].filter(
            (f) => !/focus-visible:ring-offset-\[var\(--[\w-]+\)\]/.test(source(f))
        )
        expect(
            missing,
            'ring-offset-color has to be the colour actually behind the control — pointing it at the page canvas draws a cream halo inside a dark track'
        ).toEqual([])
    })
})
