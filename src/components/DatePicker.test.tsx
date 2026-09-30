import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

import { DatePicker } from './DatePicker'

const TODAY = '2026-09-09'

describe('DatePicker', () => {
    it('never reads the clock — the rail is built from the `today` it is given', () => {
        // The property this component exists to guarantee. A merchant in Perth
        // on a tablet still set to Sydney must see THEIR today, so the rail
        // has to start where the caller says and nowhere else.
        render(
            <DatePicker value="" today="2027-03-01" onChange={() => {}} stripDays={3} testId="d" />,
        )
        expect(screen.getByTestId('d-day-2027-03-01')).toBeTruthy()
        expect(screen.getByTestId('d-day-2027-03-03')).toBeTruthy()
        expect(screen.queryByTestId('d-day-2027-03-04')).toBeNull()
    })

    it('contains its own days, so a scrolling parent does not scroll sideways (AUTM-1373)', () => {
        // jsdom has no layout, so this pins the mechanism rather than the
        // measurement: the rail must be the containing block for the day
        // buttons' absolutely positioned sr-only labels. The measurement lives
        // in the InScrollingPanel story.
        render(<DatePicker value="" today={TODAY} onChange={() => {}} testId="d" />)
        const rail = screen.getByRole('radiogroup')
        expect(rail.className.split(/\s+/)).toContain('relative')
        expect(rail.className).toContain('overflow-x-auto')
    })

    it('starts at `min` when it is later than today', () => {
        render(
            <DatePicker
                value=""
                today={TODAY}
                min="2026-09-20"
                onChange={() => {}}
                stripDays={2}
                testId="d"
            />,
        )
        expect(screen.getByTestId('d-day-2026-09-20')).toBeTruthy()
        expect(screen.queryByTestId(`d-day-${TODAY}`)).toBeNull()
    })

    it('refuses a day the merchant cannot actually have', () => {
        const onChange = vi.fn()
        render(
            <DatePicker
                value=""
                today={TODAY}
                onChange={onChange}
                stripDays={5}
                dayState={(d) => (d === '2026-09-11' ? 'unavailable' : 'available')}
                testId="d"
            />,
        )
        const shut = screen.getByTestId('d-day-2026-09-11')
        expect(shut.getAttribute('aria-disabled')).toBe('true')
        fireEvent.click(shut)
        expect(onChange).not.toHaveBeenCalled()
    })

    it('treats a date past `max` as unavailable rather than silently accepting it', () => {
        const onChange = vi.fn()
        render(
            <DatePicker
                value=""
                today={TODAY}
                max="2026-09-10"
                onChange={onChange}
                stripDays={4}
                testId="d"
            />,
        )
        fireEvent.click(screen.getByTestId('d-day-2026-09-12'))
        expect(onChange).not.toHaveBeenCalled()
        fireEvent.click(screen.getByTestId('d-day-2026-09-10'))
        expect(onChange).toHaveBeenCalledWith('2026-09-10')
    })

    it('is one tab stop, not fourteen', () => {
        // A rail of separate tab stops is what makes a keyboard user give up.
        render(
            <DatePicker
                value="2026-09-11"
                today={TODAY}
                onChange={() => {}}
                stripDays={7}
                testId="d"
            />,
        )
        const days = screen.getAllByRole('radio')
        expect(days.filter((d) => d.getAttribute('tabindex') === '0')).toHaveLength(1)
        expect(screen.getByTestId('d-day-2026-09-11').getAttribute('tabindex')).toBe('0')
    })

    it('says availability in words, not only as a coloured dot', () => {
        // WCAG 1.4.1. The dot is aria-hidden, so without this a screen reader
        // is told nothing about why a day cannot be chosen.
        const { container } = render(
            <DatePicker
                value=""
                today={TODAY}
                onChange={() => {}}
                stripDays={3}
                dayState={(d) => (d === '2026-09-10' ? 'limited' : 'available')}
                testId="d"
            />,
        )
        expect(container.textContent).toContain('nearly full')
        expect(container.textContent).toContain('today')
    })

    it('marks the chosen day for assistive tech', () => {
        render(
            <DatePicker
                value="2026-09-10"
                today={TODAY}
                onChange={() => {}}
                stripDays={3}
                testId="d"
            />,
        )
        expect(screen.getByTestId('d-day-2026-09-10').getAttribute('aria-checked')).toBe('true')
        expect(screen.getByTestId('d-day-2026-09-09').getAttribute('aria-checked')).toBe('false')
    })
})

describe('DatePicker with a caller-written <label htmlFor> (AUTM-1267)', () => {
    it('carries the id on the group, is named by the label, and a click on the label focuses the day holding the tab stop without choosing it', () => {
        // Every merchant form writes `<Label htmlFor="invoice-due">` above the
        // picker because every other field on the form works that way. The
        // component used to ignore the id, so the label pointed at nothing.
        const onChange = vi.fn()
        render(
            <>
                <label htmlFor="invoice-due">Due date</label>
                <DatePicker id="invoice-due" value="" today={TODAY} onChange={onChange} stripDays={5} testId="d" />
            </>,
        )
        const group = screen.getByRole('radiogroup', { name: 'Due date' })
        expect(document.getElementById('invoice-due')).toBe(group)

        fireEvent.click(screen.getByText('Due date'))
        const active = screen.getAllByRole('radio').find((r) => r.getAttribute('tabindex') === '0')
        expect(active).toBeTruthy()
        expect(document.activeElement).toBe(active)
        // A label click must never pick a date: that is what focusing a plain
        // input does, and it is all the customer asked for.
        expect(onChange).not.toHaveBeenCalled()
    })

    it('keeps its own name when nothing points at its id', () => {
        render(<DatePicker id="lonely" value="" today={TODAY} onChange={() => {}} stripDays={3} label="Date" />)
        expect(screen.getByRole('radiogroup', { name: 'Date' }).id).toBe('lonely')
    })
})

describe('DatePicker month sheet navigation (AUTM-1266)', () => {
    it('names Back and Next by the words printed on them, so speech input can reach them', () => {
        // WCAG 2.5.3 Label in Name: "Previous month" as the accessible name of
        // a button that reads "Back" meant saying "click Back" did nothing.
        render(<DatePicker value="" today={TODAY} onChange={() => {}} testId="d" />)
        fireEvent.click(screen.getByTestId('d-more'))
        expect(screen.getByRole('button', { name: 'Back' })).toBeTruthy()
        expect(screen.getByRole('button', { name: 'Next' })).toBeTruthy()
        expect(screen.queryByRole('button', { name: /previous month/i })).toBeNull()
        expect(screen.queryByRole('button', { name: /next month/i })).toBeNull()
    })
})

/**
 * AUTM-1373 — the rail's mouse affordance.
 *
 * QA's measurement was 806px of days in a 400px box with the scrollbar
 * suppressed and no arrows, so 7 of 14 days could not be reached with a mouse
 * and nothing said they were there. jsdom has no layout, so the geometry is
 * STATED here rather than measured: that is enough to pin the behaviour, which
 * is that the arrows appear only when there is somewhere to go, disable
 * themselves at each end, and never take a tab stop from the radiogroup. The
 * measurement itself belongs to the InScrollingPanel story.
 */
describe('DatePicker rail arrows (AUTM-1373)', () => {
    /** jsdom reports every box as 0x0; say what the browser would report. */
    function stateGeometry(
        rail: HTMLElement,
        geometry: { scrollWidth: number; clientWidth: number; scrollLeft: number },
    ) {
        for (const [key, value] of Object.entries(geometry)) {
            Object.defineProperty(rail, key, { value, configurable: true })
        }
        fireEvent.scroll(rail)
    }

    it('offers no arrows at all while the whole rail fits', () => {
        // The default in jsdom is a rail that measures 0 in a box of 0, which
        // is the "nothing to scroll" case.
        render(<DatePicker value="" today={TODAY} onChange={() => {}} stripDays={3} testId="d" />)
        expect(screen.queryByTestId('d-earlier')).toBeNull()
        expect(screen.queryByTestId('d-later')).toBeNull()
    })

    it('shows both arrows once the days overflow, with the one that can do nothing disabled', () => {
        render(<DatePicker value="" today={TODAY} onChange={() => {}} testId="d" />)
        stateGeometry(screen.getByRole('radiogroup'), {
            scrollWidth: 806,
            clientWidth: 400,
            scrollLeft: 0,
        })
        // At the near end: forward is live, back has nowhere to go and says so
        // rather than looking pressable.
        expect(screen.getByTestId('d-later')).not.toBeDisabled()
        expect(screen.getByTestId('d-earlier')).toBeDisabled()
    })

    it('disables the forward arrow at the far end', () => {
        render(<DatePicker value="" today={TODAY} onChange={() => {}} testId="d" />)
        stateGeometry(screen.getByRole('radiogroup'), {
            scrollWidth: 806,
            clientWidth: 400,
            scrollLeft: 406,
        })
        expect(screen.getByTestId('d-later')).toBeDisabled()
        expect(screen.getByTestId('d-earlier')).not.toBeDisabled()
    })

    it('scrolls the rail forward and back by whole days', () => {
        render(<DatePicker value="" today={TODAY} onChange={() => {}} testId="d" />)
        const rail = screen.getByRole('radiogroup')
        const scrollBy = vi.fn()
        rail.scrollBy = scrollBy
        stateGeometry(rail, { scrollWidth: 806, clientWidth: 400, scrollLeft: 200 })

        fireEvent.click(screen.getByTestId('d-later'))
        // A day pill measures 0 in jsdom, so this is the floor: a third of the
        // box, three of them.
        expect(scrollBy).toHaveBeenCalledWith({ left: 399, behavior: 'smooth' })
        fireEvent.click(screen.getByTestId('d-earlier'))
        expect(scrollBy).toHaveBeenLastCalledWith({ left: -399, behavior: 'smooth' })
    })

    it('keeps the radiogroup at one tab stop and stays out of the keyboard path', () => {
        // The reason the arrows are aria-hidden and tabIndex -1: the rail
        // already answers to arrow keys, and two more tab stops in a form is a
        // worse trade than a mouse-only affordance that duplicates nothing.
        render(<DatePicker value="" today={TODAY} onChange={() => {}} testId="d" />)
        const rail = screen.getByRole('radiogroup')
        stateGeometry(rail, { scrollWidth: 806, clientWidth: 400, scrollLeft: 0 })
        for (const id of ['d-earlier', 'd-later']) {
            expect(screen.getByTestId(id).getAttribute('tabindex')).toBe('-1')
            expect(screen.getByTestId(id).getAttribute('aria-hidden')).toBe('true')
        }
        expect(rail.querySelectorAll('[role="radio"][tabindex="0"]')).toHaveLength(1)
    })

    it('never offers an arrow on a disabled picker', () => {
        render(
            <DatePicker value="" today={TODAY} onChange={() => {}} disabled testId="d" />,
        )
        stateGeometry(screen.getByRole('radiogroup'), {
            scrollWidth: 806,
            clientWidth: 400,
            scrollLeft: 200,
        })
        expect(screen.getByTestId('d-earlier')).toBeDisabled()
        expect(screen.getByTestId('d-later')).toBeDisabled()
    })
})
