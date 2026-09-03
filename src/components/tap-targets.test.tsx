import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Switch } from './Switch'
import { Tabs, TabsList, TabsTrigger } from './Tabs'

/**
 * AUTM-622 — the 44px floor, on the two components that were under it.
 *
 * Measured on merchant-mobile before the fix, and it was NOT "mostly a phone
 * problem" as reported: the Day/Today/Week/Month switcher rendered 32px tall
 * on phone, tablet AND desktop, and every availability toggle was 44x24.
 *
 * These assert the CLASSES that produce the geometry, because jsdom has no
 * layout engine — `getBoundingClientRect` returns zeroes here, so a
 * measurement test in this environment would pass against anything. The real
 * geometry is measured in merchant-mobile's Playwright suite, which has a
 * browser. Stating that explicitly because a test named "tap targets" that
 * cannot measure a tap target is exactly the kind of guard that reads as
 * proof and is not.
 */
describe('AUTM-622 — 44px tap targets', () => {
    it('Switch keeps its 24px look but carries a 44x44 hit area', () => {
        render(<Switch aria-label="Toggle Monday" />)
        const el = screen.getByRole('switch')
        // The painted control is unchanged — that shape is the affordance.
        expect(el.className).toContain('h-[24px]')
        expect(el.className).toContain('w-[44px]')
        // The hit area is the pseudo-element.
        expect(el.className).toContain('before:h-11')
        expect(el.className).toContain('before:w-11')
        // Without content the pseudo-element generates no box at all and the
        // whole thing silently does nothing.
        expect(el.className).toContain("before:content-['']")
        expect(el.className).toContain('relative')
    })

    it('TabsTrigger clears 44px, and the list makes room for it', () => {
        render(
            <Tabs defaultValue="day">
                <TabsList>
                    <TabsTrigger value="day">Day</TabsTrigger>
                    <TabsTrigger value="week">Week</TabsTrigger>
                </TabsList>
            </Tabs>,
        )
        expect(screen.getByRole('tab', { name: 'Day' }).className).toContain('min-h-11')
        // 44px trigger + 4px padding each side. A 44px child in a 40px list
        // either overflows or gets squashed, so these two move together.
        expect(screen.getByRole('tablist').className).toContain('min-h-[3.25rem]')
    })

    it('both use MINIMUM heights, so 200% text scale grows them instead of clipping', () => {
        render(
            <Tabs defaultValue="day">
                <TabsList>
                    <TabsTrigger value="day">Day</TabsTrigger>
                </TabsList>
            </Tabs>,
        )
        const trigger = screen.getByRole('tab', { name: 'Day' })
        expect(trigger.className).not.toMatch(/(^|\s)h-11(\s|$)/)
        expect(screen.getByRole('tablist').className).not.toMatch(/(^|\s)h-\[3\.25rem\](\s|$)/)
    })
})
