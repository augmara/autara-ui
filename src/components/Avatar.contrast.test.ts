import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * AUTM-936 — `AvatarFallback`'s themed branch.
 *
 * It used to paint `bg-autara-purple-50` / `text-autara-purple`: a static
 * Tailwind ramp that does not track the theme, plus fill-grade purple used as
 * ink. In dark mode that rendered a bright pale disc on a near-black card, and
 * all four merchant-mobile call sites shipped it.
 *
 * Two things are locked here, and the second is the one a future refactor is
 * most likely to undo:
 *
 *   1. The ink clears AA on the fill in BOTH themes.
 *   2. The component does not reintroduce a static ramp. A contrast test
 *      alone cannot catch that — swapping back to `autara-purple-50` would
 *      still measure fine in light, because the light value is where the ramp
 *      was chosen. The regression is invisible until someone opens dark mode,
 *      which is exactly how it survived this long.
 */

const COLORS = readFileSync(resolve(process.cwd(), 'src/tokens/colors.css'), 'utf8')
const AVATAR = readFileSync(resolve(process.cwd(), 'src/components/Avatar.tsx'), 'utf8')

const AA_BODY = 4.5
type RGB = [number, number, number]
type Theme = 'light' | 'dark'

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
/** Anchored at column 0 — matching the prose mention of data-theme collapses
 *  the light scope to nothing and passes every light assertion vacuously. */
function scope(css: string, theme: Theme): string {
    const split = css.search(/^\[data-theme="dark"\] \{/m)
    if (split < 0) throw new Error('dark selector not found — did the file move?')
    return theme === 'light' ? css.slice(0, split) : css.slice(split)
}
function token(name: string, theme: Theme): RGB {
    const m = new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`).exec(scope(COLORS, theme))
    if (!m) throw new Error(`--${name} not found as a hex in the ${theme} scope`)
    return hex(m[1])
}

describe('AvatarFallback — themed disc', () => {
    for (const theme of ['light', 'dark'] as Theme[]) {
        it(`${theme}: --on-accent clears AA on --accent-fill`, () => {
            const r = contrast(token('on-accent', theme), token('accent-fill', theme))
            expect(r).toBeGreaterThanOrEqual(AA_BODY)
        })
    }

    it('the fill actually MOVES between themes', () => {
        // The whole defect was a disc that did not change. If these ever
        // match, the token has been flattened back to a static value and the
        // dark-mode bug is back regardless of what the contrast numbers say.
        expect(token('accent-fill', 'light')).not.toEqual(token('accent-fill', 'dark'))
    })

    it('does not reintroduce a static Tailwind ramp', () => {
        // Strip comments first. The doc comment above the component NAMES
        // the old class to explain what was wrong, so a naive scan of the
        // raw file matches its own explanation and fails green code. This
        // project has shipped that exact bug twice — a cva scan that could
        // not see a parameter default, and an @layer check that matched the
        // text inside its own comment. A guard you have not seen go red for
        // the right reason is not yet a guard.
        const code = AVATAR.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')
        expect(code).not.toMatch(/bg-autara-purple-\d{2,3}/)
        expect(code).toContain('bg-[var(--accent-fill)]')
        expect(code).toContain('text-[var(--on-accent)]')
    })
})
