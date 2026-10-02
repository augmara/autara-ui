import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import * as React from 'react'

import {
    DurationPicker,
    durationLabel,
    durationSpoken,
    parseDuration,
    type DurationPickerProps,
} from './DurationPicker'

/** A controlled field, the way every consumer holds it. */
function Controlled({
    initial = '',
    onChange,
    ...props
}: Partial<DurationPickerProps> & { initial?: string }) {
    const [value, setValue] = React.useState(initial)
    return (
        <DurationPicker
            testId="d"
            {...props}
            value={value}
            onChange={(next) => {
                setValue(next)
                onChange?.(next)
            }}
        />
    )
}

function field() {
    return screen.getByTestId('d') as HTMLInputElement
}
function openSheet() {
    fireEvent.click(screen.getByTestId('d-open'))
    return screen.getByRole('dialog')
}
function radio(sheet: HTMLElement, group: 'Hours' | 'Minutes', name: string) {
    return within(within(sheet).getByRole('radiogroup', { name: group })).getByRole('radio', {
        name,
    }) as HTMLButtonElement
}

describe('parseDuration: what a merchant can type', () => {
    it.each([
        ['90', 90],
        ['0090', 90],
        ['0', 0],
        ['4320', 4320],
        ['1 hr 30 min', 90],
        ['1hr 30min', 90],
        ['1h30', 90],
        ['1 h 30 m', 90],
        ['1 hr 30', 90],
        ['1.5 hours', 90],
        ['2 hrs', 120],
        ['2 hours and 15 minutes', 135],
        ['1:30', 90],
        ['45 min', 45],
        ['3 days', 4320],
        ['  2 HR  ', 120],
    ])('reads %o as %i minutes', (text, minutes) => {
        expect(parseDuration(text)).toBe(minutes)
    })

    it.each(['', '  ', 'abc', '12.5', '-30', '1e3', '1.5 min', '30 2', '2 hr 3 hr', '1:75', 'hr'])(
        'refuses %o, so the consumer sees it as typed',
        (text) => {
            expect(parseDuration(text)).toBeNull()
        },
    )
})

describe('durationLabel and durationSpoken', () => {
    it.each([
        [0, '0 min', '0 minutes'],
        [1, '1 min', '1 minute'],
        [15, '15 min', '15 minutes'],
        [50, '50 min', '50 minutes'],
        [60, '1 hr', '1 hour'],
        [90, '1 hr 30 min', '1 hour 30 minutes'],
        [150, '2 hr 30 min', '2 hours 30 minutes'],
        [1440, '24 hr', '24 hours'],
        // Past the cap, from before it existed: whole days read as days.
        [2880, '2 days', '2 days'],
        [4320, '3 days', '3 days'],
        [1500, '25 hr', '25 hours'],
    ])('%i reads %o and is spoken %o', (minutes, label, spoken) => {
        expect(durationLabel(minutes)).toBe(label)
        expect(durationSpoken(minutes)).toBe(spoken)
    })
})

describe('DurationPicker: the field reads in words', () => {
    it('is a text field, never a number input with a spinner', () => {
        render(<DurationPicker value="90" onChange={() => {}} testId="d" />)
        expect(field().getAttribute('type')).toBe('text')
    })

    it.each([
        ['150', '2 hr 30 min'],
        ['50', '50 min'],
        ['4320', '3 days'],
        ['1440', '24 hr'],
    ])('shows a stored %o as %o, never as raw minutes', (value, words) => {
        render(<DurationPicker value={value} onChange={() => {}} testId="d" />)
        expect(field().value).toBe(words)
    })

    it('shows something it cannot read exactly as it is', () => {
        render(<DurationPicker value="12.5" onChange={() => {}} invalid testId="d" />)
        expect(field().value).toBe('12.5')
        expect(field().getAttribute('aria-invalid')).toBe('true')
    })

    it('does not repeat the reading on the clock when the field already says it', () => {
        render(<DurationPicker value="150" onChange={() => {}} testId="d" />)
        expect(screen.getByTestId('d-open').textContent).toBe('Choose duration')
    })
})

describe('DurationPicker: typing', () => {
    it('sends minutes for words, and keeps the words as typed', () => {
        const onChange = vi.fn()
        render(<Controlled onChange={onChange} />)
        fireEvent.change(field(), { target: { value: '1 hr 30' } })
        expect(onChange).toHaveBeenLastCalledWith('90')
        expect(field().value).toBe('1 hr 30')
        // The clock reads it back, since the field's text is not the reading.
        expect(screen.getByTestId('d-open').textContent).toContain('1 hr 30 min')
    })

    it.each(['abc', '12.5', '-30', '  ', '1e3'])(
        'passes %o straight through, for the consumer to refuse in its own words',
        (typed) => {
            const onChange = vi.fn()
            render(<Controlled onChange={onChange} />)
            fireEvent.change(field(), { target: { value: typed } })
            expect(onChange).toHaveBeenLastCalledWith(typed)
            expect(field().value).toBe(typed)
        },
    )

    it('keeps typed minutes as typed after blur, and reads them on the clock (QA toHaveValue)', () => {
        // autara-web-automation fills #service-duration with `720` and then
        // asserts the field still holds `720`. Normalising it to "12 hr" on
        // blur would fail that without the product being wrong.
        render(<Controlled initial="150" />)
        fireEvent.focus(field())
        fireEvent.change(field(), { target: { value: '720' } })
        fireEvent.blur(field())
        expect(field().value).toBe('720')
        expect(screen.getByTestId('d-open').textContent).toContain('12 hr')
    })

    it('describes the field with the reading in full words, beside any caller description', () => {
        render(<Controlled aria-describedby="hint" />)
        fireEvent.change(field(), { target: { value: '720' } })
        const ids = (field().getAttribute('aria-describedby') ?? '').split(' ')
        expect(ids[0]).toBe('hint')
        expect(document.getElementById(ids[1])?.textContent).toBe('12 hours')
    })

    it('reads an over-the-cap number truthfully, so the stray digit is visible', () => {
        render(<Controlled />)
        fireEvent.change(field(), { target: { value: '4320' } })
        expect(screen.getByTestId('d-open').textContent).toContain('3 days')
    })

    it('drops what was typed when the value changes from outside', () => {
        function Resettable() {
            const [value, setValue] = React.useState('')
            return (
                <>
                    <DurationPicker value={value} onChange={setValue} testId="d" />
                    <button type="button" onClick={() => setValue('120')}>
                        reset
                    </button>
                </>
            )
        }
        render(<Resettable />)
        fireEvent.change(field(), { target: { value: '45' } })
        expect(field().value).toBe('45')
        fireEvent.click(screen.getByText('reset'))
        expect(field().value).toBe('2 hr')
    })
})

describe('DurationPicker: one sheet, hours and minutes together', () => {
    it('shows both columns at once, labelled, with the current value chosen', () => {
        render(<Controlled initial="150" />)
        const sheet = openSheet()
        expect(within(sheet).getByRole('radiogroup', { name: 'Hours' })).toBeTruthy()
        expect(within(sheet).getByRole('radiogroup', { name: 'Minutes' })).toBeTruthy()
        expect(radio(sheet, 'Hours', '2 hours').getAttribute('aria-checked')).toBe('true')
        expect(radio(sheet, 'Minutes', '30 minutes').getAttribute('aria-checked')).toBe('true')
        expect(within(sheet).getByTestId('d-reading').textContent).toContain('2 hr 30 min')
        // Spoken in full words for screen readers.
        expect(within(sheet).getByText('2 hours 30 minutes')).toBeTruthy()
    })

    it('offers minutes in 15-minute steps and hours 0 to 24', () => {
        render(<Controlled />)
        const sheet = openSheet()
        const minutes = within(within(sheet).getByRole('radiogroup', { name: 'Minutes' })).getAllByRole(
            'radio',
        )
        expect(minutes.map((m) => m.getAttribute('aria-label'))).toEqual([
            '0 minutes',
            '15 minutes',
            '30 minutes',
            '45 minutes',
        ])
        expect(
            within(within(sheet).getByRole('radiogroup', { name: 'Hours' })).getAllByRole('radio'),
        ).toHaveLength(25)
    })

    it('commits the hour and minute chosen together on Done, as minutes', () => {
        const onChange = vi.fn()
        render(<Controlled initial="150" onChange={onChange} />)
        const sheet = openSheet()
        fireEvent.click(radio(sheet, 'Hours', '3 hours'))
        fireEvent.click(radio(sheet, 'Minutes', '15 minutes'))
        expect(within(sheet).getByTestId('d-reading').textContent).toContain('3 hr 15 min')
        fireEvent.click(within(sheet).getByRole('button', { name: 'Done' }))
        expect(onChange).toHaveBeenLastCalledWith('195')
        expect(field().value).toBe('3 hr 15 min')
        expect(screen.queryByRole('dialog')).toBeNull()
    })

    it('keeps the value when the sheet is cancelled', () => {
        const onChange = vi.fn()
        render(<Controlled initial="150" onChange={onChange} />)
        const sheet = openSheet()
        fireEvent.click(radio(sheet, 'Hours', '5 hours'))
        fireEvent.click(within(sheet).getByRole('button', { name: 'Cancel' }))
        expect(onChange).not.toHaveBeenCalled()
        expect(field().value).toBe('2 hr 30 min')
    })

    it('commits a common length in one tap', () => {
        const onChange = vi.fn()
        render(<Controlled onChange={onChange} />)
        const sheet = openSheet()
        const group = within(sheet).getByRole('group', { name: 'Common lengths' })
        expect(within(group).getAllByRole('button').map((b) => b.textContent)).toEqual([
            '30 min',
            '45 min',
            '1 hr',
            '1 hr 30 min',
            '2 hr',
            '3 hr',
            '4 hr',
        ])
        fireEvent.click(within(group).getByRole('button', { name: '1 hr 30 min' }))
        expect(onChange).toHaveBeenLastCalledWith('90')
        expect(screen.queryByRole('dialog')).toBeNull()
    })

    it('marks the common length the value already is', () => {
        render(<Controlled initial="90" />)
        const sheet = openSheet()
        expect(
            within(sheet).getByRole('button', { name: '1 hr 30 min' }).getAttribute('aria-pressed'),
        ).toBe('true')
    })

    it('opens an off-step stored value with nothing chosen, says so, and keeps it', () => {
        const onChange = vi.fn()
        render(<Controlled initial="50" onChange={onChange} />)
        const sheet = openSheet()
        expect(within(sheet).getByTestId('d-reading').textContent).toContain('50 min')
        expect(within(sheet).getByText(/Not on the 15-minute steps/)).toBeTruthy()
        expect(
            within(sheet)
                .getAllByRole('radio')
                .filter((r) => r.getAttribute('aria-checked') === 'true'),
        ).toHaveLength(0)
        expect(
            (within(sheet).getByRole('button', { name: 'Done' }) as HTMLButtonElement).disabled,
        ).toBe(true)
        fireEvent.click(within(sheet).getByRole('button', { name: 'Cancel' }))
        expect(onChange).not.toHaveBeenCalled()
        expect(field().value).toBe('50 min')
    })

    it('opens a pre-cap 3-day value without breaking, and replaces it only if asked', () => {
        const onChange = vi.fn()
        render(<Controlled initial="4320" onChange={onChange} />)
        expect(field().value).toBe('3 days')
        const sheet = openSheet()
        expect(within(sheet).getByTestId('d-reading').textContent).toContain('3 days')
        // Choosing an hour on its own means that hour, on the hour.
        fireEvent.click(radio(sheet, 'Hours', '8 hours'))
        expect(within(sheet).getByTestId('d-reading').textContent).toContain('8 hr')
        fireEvent.click(within(sheet).getByRole('button', { name: 'Done' }))
        expect(onChange).toHaveBeenLastCalledWith('480')
    })

    it('has no minutes past the 24 hr cap, and 24 hr clears them', () => {
        render(<Controlled initial="90" />)
        const sheet = openSheet()
        fireEvent.click(radio(sheet, 'Hours', '24 hours'))
        expect(radio(sheet, 'Minutes', '0 minutes').getAttribute('aria-checked')).toBe('true')
        for (const name of ['15 minutes', '30 minutes', '45 minutes']) {
            expect(radio(sheet, 'Minutes', name).disabled).toBe(true)
        }
        expect(within(sheet).getByTestId('d-reading').textContent).toContain('24 hr')
    })

    it('will not commit zero, and says why', () => {
        const onChange = vi.fn()
        render(<Controlled initial="30" onChange={onChange} />)
        const sheet = openSheet()
        fireEvent.click(radio(sheet, 'Minutes', '0 minutes'))
        expect(within(sheet).getByText('Pick at least 15 min.')).toBeTruthy()
        const done = within(sheet).getByRole('button', { name: 'Done' }) as HTMLButtonElement
        expect(done.disabled).toBe(true)
        fireEvent.click(done)
        expect(onChange).not.toHaveBeenCalled()
    })

    it('holds a lower cap when a caller sets one, presets included', () => {
        render(<Controlled maxMinutes={90} />)
        const sheet = openSheet()
        expect(
            within(within(sheet).getByRole('radiogroup', { name: 'Hours' })).getAllByRole('radio'),
        ).toHaveLength(2)
        const group = within(sheet).getByRole('group', { name: 'Common lengths' })
        expect(within(group).getAllByRole('button').map((b) => b.textContent)).toEqual([
            '30 min',
            '45 min',
            '1 hr',
            '1 hr 30 min',
        ])
        fireEvent.click(radio(sheet, 'Hours', '1 hour'))
        expect(radio(sheet, 'Minutes', '30 minutes').disabled).toBe(false)
        expect(radio(sheet, 'Minutes', '45 minutes').disabled).toBe(true)
    })

    it('moves and selects with the arrow keys, one tab stop per column', () => {
        render(<Controlled initial="120" />)
        const sheet = openSheet()
        const hours = within(sheet).getByRole('radiogroup', { name: 'Hours' })
        const tabbable = within(hours)
            .getAllByRole('radio')
            .filter((r) => r.tabIndex === 0)
        expect(tabbable.map((r) => r.getAttribute('aria-label'))).toEqual(['2 hours'])
        fireEvent.keyDown(hours, { key: 'ArrowDown' })
        expect(radio(sheet, 'Hours', '3 hours').getAttribute('aria-checked')).toBe('true')
        fireEvent.keyDown(hours, { key: 'Home' })
        expect(radio(sheet, 'Hours', '0 hours').getAttribute('aria-checked')).toBe('true')
    })

    it('opens with focus on the sheet, not on a preset that would then look chosen', () => {
        render(<Controlled initial="150" />)
        const sheet = openSheet()
        expect(document.activeElement).toBe(sheet)
    })

    it('keeps 44px targets on the clock, the rows and the presets', () => {
        // jsdom has no layout, so this asserts the classes that produce it.
        render(<Controlled initial="90" />)
        expect(screen.getByTestId('d-open').className).toContain('min-h-11')
        expect(screen.getByTestId('d-open').className).toContain('min-w-11')
        const sheet = openSheet()
        expect(radio(sheet, 'Hours', '1 hour').className).toContain('min-h-11')
        expect(within(sheet).getByRole('button', { name: '30 min' }).className).toContain('min-h-11')
    })
})

describe('DurationPicker: disabled', () => {
    it('cannot be typed in and cannot be opened', () => {
        render(<DurationPicker value="90" onChange={() => {}} disabled testId="d" />)
        expect(field().disabled).toBe(true)
        expect((screen.getByTestId('d-open') as HTMLButtonElement).disabled).toBe(true)
        fireEvent.click(screen.getByTestId('d-open'))
        expect(screen.queryByRole('dialog')).toBeNull()
    })
})

describe('DurationPicker with a caller-written <label htmlFor> (AUTM-1267)', () => {
    it('puts the id on the typable input, is named by the label, and a label click focuses it', () => {
        // QA's suite locates `#service-duration` and drives it with `.fill()`.
        render(
            <>
                <label htmlFor="service-duration">Duration</label>
                <DurationPicker id="service-duration" value="" onChange={() => {}} testId="d" />
            </>,
        )
        expect(document.getElementById('service-duration')).toBe(field())
        expect(screen.getByLabelText('Duration')).toBe(field())
        fireEvent.click(screen.getByText('Duration'))
        expect(document.activeElement).toBe(field())
    })

    it('falls back to its own name when no label points at it', () => {
        render(<DurationPicker value="" onChange={() => {}} testId="d" />)
        expect(screen.getByLabelText('Duration')).toBe(field())
    })

    it('carries a caller’s extra input props', () => {
        const onBlur = vi.fn()
        render(
            <DurationPicker
                value="90"
                onChange={() => {}}
                onBlur={onBlur}
                name="duration"
                required
                aria-describedby="hint"
                testId="d"
            />,
        )
        expect(field().name).toBe('duration')
        expect(field().required).toBe(true)
        expect(field().getAttribute('aria-describedby')).toBe('hint')
        fireEvent.blur(field())
        expect(onBlur).toHaveBeenCalled()
    })
})
