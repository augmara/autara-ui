import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { ModeChip } from './ModeChip'

/**
 * AUTM-969. Three guards, each pinned to a defect that actually shipped.
 */

describe('ModeChip answers "do I need to leave?"', () => {
    it('names the mode in the accessible tree, not just in pixels', () => {
        render(<ModeChip mode="MOBILE" />)
        expect(screen.getByText('Mobile')).toBeInTheDocument()
        expect(screen.getByText('booking')).toBeInTheDocument()
    })

    it.each([['IN_SHOP'], ['FIXED_LOCATION'], ['WORKSHOP'], ['workshop']])(
        '%s reads as In-shop',
        (mode) => {
            const { container } = render(<ModeChip mode={mode} />)
            expect(screen.getByText('In-shop')).toBeInTheDocument()
            expect(container.querySelector('[data-mode="IN_SHOP"]')).toBeTruthy()
        }
    )

    /**
     * The behaviour change in this ticket. The old branch was
     * `mode === 'MOBILE' ? mobile : inShop`, so a booking whose mode the API
     * had not returned rendered "In-shop" — telling the merchant the customer
     * was coming to them, on no evidence. A missing chip is a gap the merchant
     * can see; a wrong chip is a wrong answer.
     */
    it.each([[null], [undefined], [''], ['  '], ['SOMETHING_NEW']])(
        'renders nothing rather than guessing for %s',
        (mode) => {
            const { container } = render(<ModeChip mode={mode as string | null} />)
            expect(container).toBeEmptyDOMElement()
        }
    )

    it('keeps an accessible name when the label is hidden', () => {
        render(<ModeChip mode="MOBILE" iconOnly />)
        expect(screen.getByRole('img', { name: 'Mobile booking' })).toBeInTheDocument()
    })
})

/**
 * A source scan for the two rules jsdom cannot see: it has no stylesheet, so
 * a rendered assertion about a ring or a font size would pass while the real
 * app was wrong. Same reasoning as `theme-pairing.test.ts`.
 */
describe('ModeChip is solid and scales', () => {
    const SRC = readFileSync(resolve(process.cwd(), 'src/components/ModeChip.tsx'), 'utf8')

    /** Strip comments — they quote the banned patterns on purpose. */
    const code = (() => {
        let inBlock = false
        return SRC.split('\n')
            .filter((line) => {
                const t = line.trim()
                if (t.startsWith('/*')) inBlock = true
                const was = inBlock
                if (t.endsWith('*/')) inBlock = false
                return !was && !t.startsWith('//') && !t.startsWith('*')
            })
            .join('\n')
    })()

    /**
     * Rule 4, as Don extended it on 2026-09-01: "no outline buttons or
     * sections … everything should be solid." The chip's fill defines it;
     * `neutral-contrast.test.ts` proves the fill is a visible step on every
     * ground, which is what earns the right to drop the ring.
     */
    it('carries no ring or border — the fill defines the shape', () => {
        expect(code).not.toMatch(/\bring-(?:1|2|inset|\[)/)
        expect(code).not.toMatch(/\bborder(?:-\d|-\[)/)
        expect(code).toContain('bg-[var(--neutral-fill)]')
    })

    /**
     * `text-[9px]` / `text-[10px]` and pixel `width`/`height` on the SVGs
     * froze the whole chip against OS Dynamic Type. Everything is rem or em
     * now, so the glyph grows with the label and the label grows with the
     * root font size.
     */
    it('uses no fixed pixel size anywhere', () => {
        expect(code).not.toMatch(/text-\[\d+px\]/)
        expect(code).not.toMatch(/\b(?:h|w|p[xy]?|gap)-\[\d+px\]/)
        expect(code).not.toMatch(/<svg[^>]*\b(?:width|height)=/)
    })

    /**
     * Rule 1 reserves the skew for status; rule 3 gives chips the 8px rung.
     * A delivery mode is metadata — it does not change over the booking's
     * life the way CONFIRMED → COMPLETED does.
     */
    it('takes the chip radius, not the status parallelogram and not a pill', () => {
        expect(code).toContain('rounded-autara-sm')
        expect(code).not.toContain('rounded-full')
        expect(code).not.toContain('skew')
    })
})

/**
 * AUTM-969 follow-up. Reported from a screenshot: in a squeezed booking row the
 * chip rendered as "IN-" over "SHOP" — the hyphen in IN-SHOP is a line-break
 * opportunity and flexbox took it.
 *
 * Asserting the classes rather than measured geometry is deliberate: jsdom does
 * no layout, so a height or line-count assertion here would pass against the
 * bug. The real geometry check belongs in a Playwright spec; this guards the
 * declaration that prevents it, which is the thing an editor would remove.
 */
describe('AUTM-969: the label never breaks mid-word', () => {
    it('declines to wrap and declines to be squeezed', () => {
        const { container } = render(<ModeChip mode="IN_SHOP" />)
        const chip = container.firstElementChild as HTMLElement
        expect(chip.className).toContain('whitespace-nowrap')
        expect(chip.className).toContain('shrink-0')
    })

    it('holds for every mode, not just the hyphenated one', () => {
        for (const mode of ['MOBILE', 'IN_SHOP', 'WORKSHOP', 'FIXED_LOCATION'] as const) {
            const { container } = render(<ModeChip mode={mode} />)
            const chip = container.firstElementChild as HTMLElement
            expect(chip.className).toContain('whitespace-nowrap')
        }
    })
})
