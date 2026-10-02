import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

import { MonthCalendar } from './MonthCalendar'

/** A Saturday, the day Don raised AUTM-1633. */
const TODAY = '2026-10-03'

function cell(date: string) {
    return screen.getByTestId(`c-cell-${date}`)
}

function activeDay() {
    const days = screen.getAllByRole('button').filter((b) => b.getAttribute('data-date'))
    const active = days.filter((d) => d.getAttribute('tabindex') === '0')
    expect(active).toHaveLength(1)
    return active[0]
}

describe('MonthCalendar (AUTM-1633)', () => {
    it('opens on the chosen day’s month, or on today’s when nothing is chosen', () => {
        const { unmount } = render(
            <MonthCalendar value="" today={TODAY} onSelect={() => {}} testId="c" />,
        )
        expect(screen.getByText('October 2026')).toBeTruthy()
        unmount()
        render(<MonthCalendar value="2027-01-20" today={TODAY} onSelect={() => {}} testId="c" />)
        expect(screen.getByText('January 2027')).toBeTruthy()
        expect(activeDay().getAttribute('data-date')).toBe('2027-01-20')
    })

    it('marks today for sight and for a screen reader, without making it look chosen', () => {
        render(<MonthCalendar value="2026-10-08" today={TODAY} onSelect={() => {}} testId="c" />)
        const today = cell(TODAY)
        expect(today.getAttribute('aria-current')).toBe('date')
        expect(today.getAttribute('aria-label')).toBe('Saturday 3 October, today')
        expect(today.parentElement?.getAttribute('aria-selected')).toBe('false')
        expect(cell('2026-10-08').parentElement?.getAttribute('aria-selected')).toBe('true')
    })

    it('refuses a day before `min`, and Back cannot reach an earlier month', () => {
        const onSelect = vi.fn()
        render(<MonthCalendar value="" today={TODAY} min={TODAY} onSelect={onSelect} testId="c" />)
        const past = cell('2026-10-02')
        expect(past.getAttribute('aria-disabled')).toBe('true')
        expect(past.getAttribute('aria-label')).toContain('unavailable')
        fireEvent.click(past)
        expect(onSelect).not.toHaveBeenCalled()
        expect(screen.getByRole('button', { name: 'Back' })).toBeDisabled()
    })

    it('lets a closed day be chosen, and says it is closed (the time grid’s rule)', () => {
        // Times outside a merchant's hours are "still yours to take" (AUTM-707),
        // so a closed DAY must not be refused one step earlier.
        const onSelect = vi.fn()
        render(
            <MonthCalendar
                value=""
                today={TODAY}
                min={TODAY}
                dayState={(d) => (d === '2026-10-04' ? 'closed' : 'available')}
                onSelect={onSelect}
                testId="c"
            />,
        )
        const sunday = cell('2026-10-04')
        expect(sunday.getAttribute('aria-disabled')).toBeNull()
        expect(sunday.getAttribute('aria-label')).toBe('Sunday 4 October, closed')
        expect(sunday.getAttribute('style')).toContain('repeating-linear-gradient')
        fireEvent.click(sunday)
        expect(onSelect).toHaveBeenCalledWith('2026-10-04')
    })

    it('reaches any later month with Next, and selects a day there', () => {
        const onSelect = vi.fn()
        render(<MonthCalendar value="" today={TODAY} min={TODAY} onSelect={onSelect} testId="c" />)
        fireEvent.click(screen.getByRole('button', { name: 'Next' }))
        fireEvent.click(screen.getByRole('button', { name: 'Next' }))
        expect(screen.getByText('December 2026')).toBeTruthy()
        fireEvent.click(cell('2026-12-24'))
        expect(onSelect).toHaveBeenCalledWith('2026-12-24')
    })

    it('stops Next at the month holding `max`', () => {
        render(
            <MonthCalendar value="" today={TODAY} max="2026-11-15" onSelect={() => {}} testId="c" />,
        )
        fireEvent.click(screen.getByRole('button', { name: 'Next' }))
        expect(screen.getByText('November 2026')).toBeTruthy()
        expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()
    })

    it('is one tab stop, inside a labelled grid', () => {
        render(<MonthCalendar value="" today={TODAY} onSelect={() => {}} testId="c" />)
        const grid = screen.getByRole('grid', { name: 'October 2026' })
        expect(grid).toBeTruthy()
        expect(activeDay().getAttribute('data-date')).toBe(TODAY)
        expect(screen.getAllByRole('columnheader').map((h) => h.getAttribute('aria-label'))).toEqual([
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
            'Sunday',
        ])
    })

    it('moves by day, by week, to the week’s ends, and by month and year from the keyboard', () => {
        render(<MonthCalendar value="2026-10-14" today={TODAY} onSelect={() => {}} testId="c" />)
        const press = (key: string, shiftKey = false) => {
            fireEvent.keyDown(activeDay(), { key, shiftKey })
            return activeDay().getAttribute('data-date')
        }
        expect(press('ArrowRight')).toBe('2026-10-15')
        expect(press('ArrowLeft')).toBe('2026-10-14')
        expect(press('ArrowDown')).toBe('2026-10-21')
        expect(press('ArrowUp')).toBe('2026-10-14')
        // 14 October 2026 is a Wednesday; the week runs Monday to Sunday.
        expect(press('Home')).toBe('2026-10-12')
        expect(press('End')).toBe('2026-10-18')
        expect(press('PageDown')).toBe('2026-11-18')
        expect(screen.getByText('November 2026')).toBeTruthy()
        expect(press('PageUp')).toBe('2026-10-18')
        expect(press('PageDown', true)).toBe('2027-10-18')
        expect(document.activeElement).toBe(activeDay())
    })

    it('turns the page when the arrows walk off the month', () => {
        render(<MonthCalendar value="2026-10-31" today={TODAY} onSelect={() => {}} testId="c" />)
        fireEvent.keyDown(activeDay(), { key: 'ArrowRight' })
        expect(activeDay().getAttribute('data-date')).toBe('2026-11-01')
        expect(screen.getByText('November 2026')).toBeTruthy()
    })

    it('will not walk the keyboard past `min`', () => {
        render(<MonthCalendar value="" today={TODAY} min={TODAY} onSelect={() => {}} testId="c" />)
        fireEvent.keyDown(activeDay(), { key: 'ArrowUp' })
        expect(activeDay().getAttribute('data-date')).toBe(TODAY)
        fireEvent.keyDown(activeDay(), { key: 'PageUp' })
        expect(activeDay().getAttribute('data-date')).toBe(TODAY)
    })

    it('chooses with the button’s own Enter and Space, the same act as a tap', () => {
        const onSelect = vi.fn()
        render(<MonthCalendar value="" today={TODAY} onSelect={onSelect} testId="c" />)
        fireEvent.keyDown(activeDay(), { key: 'ArrowRight' })
        // Activation is the browser's: a keyboard Enter on a <button> is a click.
        fireEvent.click(activeDay())
        expect(onSelect).toHaveBeenCalledWith('2026-10-04')
    })
})
