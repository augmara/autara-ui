import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'

import { StatTile } from './StatTile'

/**
 * AUTM-1194 — on a hero tile the label and caption were 75% on-accent, which
 * measured 4.36:1 on the dark accent fill (about 3.6:1 on hover), under the
 * 4.5:1 floor. jsdom has no layout or colour maths, so this pins the
 * mechanism: no hero text is drawn at reduced on-accent opacity. The
 * measurement lives in merchant-mobile's dashboard-a11y spec.
 */
describe('StatTile hero text contrast', () => {
    /*
     * AUTM-1594: the hero is brand-deep now, and the sheet draws its label and
     * caption at 78% white through the --on-deep-muted token. That pair is
     * asserted at 4.5:1 or better in tokens/palette-contrast.test.ts (9.3:1
     * measured). What stays banned is an ad-hoc opacity on the ink, the
     * mechanism AUTM-1194 removed.
     */
    it('draws the hero label and caption in the measured on-deep-muted token', () => {
        render(<StatTile hero label="Pending payouts" value="$202" caption="3 bookings this week" />)
        for (const text of ['Pending payouts', '3 bookings this week']) {
            const cls = screen.getByText(text).className
            expect(cls).toContain('text-[var(--on-deep-muted)]')
            expect(cls).not.toMatch(/on-(accent|deep)\)\]\/\d+/)
        }
    })

    it('draws the hero figure in lime (AUTM-1592)', () => {
        render(<StatTile hero label="Today" value="$429" />)
        expect(screen.getByText('$429').className).toContain('text-[var(--lime)]')
    })
})
