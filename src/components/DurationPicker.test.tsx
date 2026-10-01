import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

import { DurationPicker, durationLabel } from './DurationPicker'

/**
 * jsdom has no `matchMedia`, so PickerSheet's `useIsMobile` stays false and
 * these exercise the dialog branch. The rows are the same either way.
 */
function open() {
    fireEvent.click(screen.getByTestId('d-open'))
}

function option(name: string | RegExp) {
    return screen.getByRole('option', { name }) as HTMLButtonElement
}

describe('DurationPicker: the field takes anything, unchanged', () => {
    it('is a text field with a numeric keypad, never a number input', () => {
        // AUTM-1507 — `type="number"` is what draws the native spinner Don
        // screenshotted. There is no spinner to suppress rather than a
        // suppressed one, which is why this also holds in Firefox and Safari.
        render(<DurationPicker value="90" onChange={() => {}} testId="d" />)
        const input = screen.getByTestId('d') as HTMLInputElement
        expect(input.getAttribute('type')).toBe('text')
        expect(input.getAttribute('inputmode')).toBe('numeric')
    })

    it.each(['abc', '12.5', '-30', '0', '4320', '1e3', '  '])(
        'passes %o straight through without rewriting it',
        (typed) => {
            const onChange = vi.fn()
            render(<DurationPicker value="" onChange={onChange} testId="d" />)
            fireEvent.change(screen.getByTestId('d'), { target: { value: typed } })
            expect(onChange).toHaveBeenCalledWith(typed)
        },
    )

    it('shows an invalid value exactly as typed, because the consumer owns validity', () => {
        // QA types arbitrary strings here to assert the three messages
        // `serviceDurationError` produces. A field that corrected itself
        // would make those assertions unreachable.
        render(<DurationPicker value="12.5" onChange={() => {}} invalid testId="d" />)
        const input = screen.getByTestId('d') as HTMLInputElement
        expect(input.value).toBe('12.5')
        expect(input.getAttribute('aria-invalid')).toBe('true')
    })
})

describe('DurationPicker: the summary reads the value back', () => {
    it.each([
        ['45', '45 min'],
        ['90', '1 hr 30 min'],
        ['120', '2 hr'],
        ['1440', '24 hr'],
        // Over the cap and still read back truthfully: seeing "72 hr" is how
        // the merchant notices, and the validator is what refuses it.
        ['4320', '72 hr'],
        // Canonicalised, not rejected.
        ['0090', '1 hr 30 min'],
    ])('reads %o as %o', (value, expected) => {
        render(<DurationPicker value={value} onChange={() => {}} testId="d" />)
        expect(screen.getByTestId('d-open').textContent).toContain(expected)
    })

    it('omits the zero part rather than saying "2 hr 0 min"', () => {
        render(<DurationPicker value="120" onChange={() => {}} testId="d" />)
        expect(screen.getByTestId('d-open').textContent).not.toContain('0 min')
    })

    it.each(['', '12.5', '-30', 'abc', '1.0'])(
        'shows no summary at all for %o, rather than a wrong one',
        (value) => {
            render(<DurationPicker value={value} onChange={() => {}} testId="d" />)
            // Only the trigger's own accessible name is left.
            expect(screen.getByTestId('d-open').textContent).toBe('Choose duration')
        },
    )

    it('keeps a 44px target on the trigger even with no summary to widen it', () => {
        // Measured in the browser at 42px wide before `min-w-11` was added:
        // the glyph plus its padding, in the EMPTY state, which is where
        // every merchant starts. jsdom has no layout engine, so this asserts
        // the classes that produce the geometry, as `tap-targets.test.tsx`
        // explains at length.
        render(<DurationPicker value="" onChange={() => {}} testId="d" />)
        const trigger = screen.getByTestId('d-open')
        expect(trigger.className).toContain('min-h-11')
        expect(trigger.className).toContain('min-w-11')
        // MINIMUMS, so 200% text scale grows the control instead of clipping.
        // Matched on whole class tokens: `\bh-11\b` also matches inside
        // `min-h-11`, because `-` is a word boundary, so that spelling of
        // this assertion fails against the correct code.
        expect(trigger.className).not.toMatch(/(?:^|\s)[hw]-11(?=\s|$)/)
    })

    it('names the trigger so its visible text is part of the name, not replaced by it', () => {
        // WCAG 2.5.3. An `aria-label` would have hidden "1 hr 30 min" from
        // anyone speaking what they can see.
        render(<DurationPicker value="90" onChange={() => {}} testId="d" />)
        expect(screen.getByRole('button', { name: 'Choose duration 1 hr 30 min' })).toBeTruthy()
    })
})

describe('DurationPicker: picking from the sheet', () => {
    it('emits the minute total for the hour and minute chosen', () => {
        const onChange = vi.fn()
        render(<DurationPicker value="" onChange={onChange} testId="d" />)
        open()
        fireEvent.click(option('1 hr'))
        fireEvent.click(option('1 hr 30 min'))
        expect(onChange).toHaveBeenCalledWith('90')
    })

    it('emits a whole hour as its minutes, with no zero-minute step needed', () => {
        const onChange = vi.fn()
        render(<DurationPicker value="" onChange={onChange} testId="d" />)
        open()
        fireEvent.click(option('2 hr'))
        fireEvent.click(option('2 hr'))
        expect(onChange).toHaveBeenCalledWith('120')
    })

    it('reaches the short durations under the first hour', () => {
        const onChange = vi.fn()
        render(<DurationPicker value="" onChange={onChange} testId="d" />)
        open()
        // "0 hr" is not how anyone says it.
        fireEvent.click(option('Under 1 hr'))
        fireEvent.click(option('45 min'))
        expect(onChange).toHaveBeenCalledWith('45')
    })

    it('marks the hour holding the current value, so the root level is not anonymous', () => {
        render(<DurationPicker value="90" onChange={() => {}} testId="d" />)
        open()
        expect(option('1 hr Current')).toBeTruthy()
    })

    it('marks the exact row the value came from', () => {
        render(<DurationPicker value="90" onChange={() => {}} testId="d" />)
        open()
        fireEvent.click(option('1 hr Current'))
        expect(option('1 hr 30 min').getAttribute('aria-selected')).toBe('true')
        expect(option('1 hr 15 min').getAttribute('aria-selected')).toBe('false')
    })

    it('marks nothing when the value is off the 15-minute steps, and keeps it anyway', () => {
        // The mirror of TimePicker's off-grid value: 95 is not one of the
        // rows, so no row claims it, and the field still holds it.
        render(<DurationPicker value="95" onChange={() => {}} testId="d" />)
        expect((screen.getByTestId('d') as HTMLInputElement).value).toBe('95')
        expect(screen.getByTestId('d-open').textContent).toContain('1 hr 35 min')
        open()
        fireEvent.click(option('1 hr Current'))
        expect(
            screen.getAllByRole('option').filter((o) => o.getAttribute('aria-selected') === 'true'),
        ).toHaveLength(0)
    })
})

describe('DurationPicker: the 24 hour cap', () => {
    it('offers 24 hr and refuses to offer a minute past it', () => {
        render(<DurationPicker value="" onChange={() => {}} testId="d" />)
        open()
        fireEvent.click(option('24 hr'))
        expect(option('24 hr').disabled).toBe(false)
        for (const label of ['24 hr 15 min', '24 hr 30 min', '24 hr 45 min']) {
            expect(option(new RegExp(`^${label}`)).disabled).toBe(true)
        }
    })

    it('says why, rather than leaving a row merely faint', () => {
        render(<DurationPicker value="" onChange={() => {}} testId="d" />)
        open()
        fireEvent.click(option('24 hr'))
        expect(option(/^24 hr 15 min/).textContent).toContain('over 24 hr')
    })

    it('offers no hour above the cap', () => {
        render(<DurationPicker value="" onChange={() => {}} testId="d" />)
        open()
        expect(screen.getAllByRole('option')).toHaveLength(25)
        expect(screen.queryByRole('option', { name: '25 hr' })).toBeNull()
    })

    it('holds a lower cap when a caller sets one', () => {
        render(<DurationPicker value="" onChange={() => {}} maxMinutes={90} testId="d" />)
        open()
        expect(screen.getAllByRole('option')).toHaveLength(2)
        fireEvent.click(option('1 hr'))
        expect(option('1 hr 30 min').disabled).toBe(false)
        expect(option(/^1 hr 45 min/).disabled).toBe(true)
        expect(option(/^1 hr 45 min/).textContent).toContain('over 1 hr 30 min')
    })

    it('will not offer zero, which the validator refuses anyway', () => {
        const onChange = vi.fn()
        render(<DurationPicker value="" onChange={onChange} testId="d" />)
        open()
        fireEvent.click(option('Under 1 hr'))
        const zero = option(/^0 min/)
        expect(zero.disabled).toBe(true)
        expect(zero.textContent).toContain('too short')
        fireEvent.click(zero)
        expect(onChange).not.toHaveBeenCalled()
    })
})

describe('DurationPicker: disabled', () => {
    it('cannot be typed in and cannot be opened', () => {
        render(<DurationPicker value="90" onChange={() => {}} disabled testId="d" />)
        expect((screen.getByTestId('d') as HTMLInputElement).disabled).toBe(true)
        expect((screen.getByTestId('d-open') as HTMLButtonElement).disabled).toBe(true)
        fireEvent.click(screen.getByTestId('d-open'))
        expect(screen.queryByRole('option')).toBeNull()
    })
})

describe('DurationPicker with a caller-written <label htmlFor> (AUTM-1267)', () => {
    it('puts the id on the typable input, is named by the label, and a click on the label focuses it', () => {
        // The id has to land on the INPUT: QA's suite locates
        // `#service-duration` and drives it with `.fill()`
        // (autara-web-automation, ServiceFormPage.ts). Unlike DatePicker and
        // TimePicker, this control HAS a labelable element, so the native
        // `for` association does the naming and the focusing on its own.
        render(
            <>
                <label htmlFor="service-duration">Duration (min)</label>
                <DurationPicker id="service-duration" value="" onChange={() => {}} testId="d" />
            </>,
        )
        const input = screen.getByTestId('d')
        expect(document.getElementById('service-duration')).toBe(input)
        expect(screen.getByLabelText('Duration (min)')).toBe(input)

        fireEvent.click(screen.getByText('Duration (min)'))
        expect(document.activeElement).toBe(input)
    })

    it('falls back to its own name when no label points at it', () => {
        render(<DurationPicker value="" onChange={() => {}} testId="d" />)
        expect(screen.getByLabelText('Duration')).toBe(screen.getByTestId('d'))
    })

    it('carries a caller’s extra input props, so the consumer’s form still works', () => {
        const onBlur = vi.fn()
        render(
            <DurationPicker
                value="90"
                onChange={() => {}}
                onBlur={onBlur}
                name="duration"
                required
                testId="d"
            />,
        )
        const input = screen.getByTestId('d') as HTMLInputElement
        expect(input.name).toBe('duration')
        expect(input.required).toBe(true)
        fireEvent.blur(input)
        expect(onBlur).toHaveBeenCalled()
    })
})

describe('durationLabel', () => {
    it.each([
        [0, '0 min'],
        [1, '1 min'],
        [15, '15 min'],
        [59, '59 min'],
        [60, '1 hr'],
        [75, '1 hr 15 min'],
        [120, '2 hr'],
        [1440, '24 hr'],
    ])('%i is %o', (minutes, expected) => {
        expect(durationLabel(minutes)).toBe(expected)
    })
})
