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
    return screen.getByTestId('d') as HTMLButtonElement
}
function openSheet() {
    fireEvent.click(screen.getByTestId('d'))
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

describe('DurationPicker: the field is a button that reads in words', () => {
    it('is a button, not a text field, and opens the sheet', () => {
        render(<DurationPicker value="150" onChange={() => {}} testId="d" />)
        const f = screen.getByTestId('d')
        expect(f.tagName).toBe('BUTTON')
        expect(f.getAttribute('aria-haspopup')).toBe('dialog')
        expect(screen.queryByRole('textbox')).toBeNull()
        fireEvent.click(f)
        expect(screen.getByRole('dialog')).toBeTruthy()
    })

    it.each([
        ['150', '2 hr 30 min'],
        ['50', '50 min'],
        ['143', '2 hr 23 min'],
        ['4320', '3 days'],
        ['1440', '24 hr'],
    ])('shows a stored %o as %o, never as raw minutes', (value, words) => {
        render(<DurationPicker value={value} onChange={() => {}} testId="d" />)
        expect(field().textContent).toBe(words)
    })

    it('says "Choose a length" when there is none', () => {
        render(<DurationPicker value="" onChange={() => {}} testId="d" />)
        expect(field().textContent).toBe('Choose a length')
    })

    it('shows a stored value it cannot read as it is, and the invalid edge', () => {
        render(<DurationPicker value="12.5" onChange={() => {}} invalid testId="d" />)
        expect(field().textContent).toBe('12.5')
        expect(field().getAttribute('aria-invalid')).toBe('true')
    })

    it('carries the value in its name, spoken in full', () => {
        render(<DurationPicker value="150" onChange={() => {}} testId="d" />)
        expect(screen.getByRole('button', { name: 'Duration, 2 hours 30 minutes' })).toBe(field())
    })

    it('submits minutes through a hidden input when it has a name', () => {
        const { container } = render(
            <DurationPicker value="150" onChange={() => {}} name="duration" testId="d" />,
        )
        const hidden = container.querySelector('input[type="hidden"][name="duration"]') as HTMLInputElement
        expect(hidden.value).toBe('150')
    })
})

describe('DurationPicker: typing a length inside the sheet', () => {
    function startTyping() {
        const sheet = openSheet()
        fireEvent.click(within(sheet).getByTestId('d-manual-open'))
        return { sheet, input: within(sheet).getByTestId('d-manual') as HTMLInputElement }
    }

    it('opens on the current value in words and reads what is typed, live', () => {
        render(<Controlled initial="150" />)
        const { sheet, input } = startTyping()
        expect(input.value).toBe('2 hr 30 min')
        fireEvent.change(input, { target: { value: '2h 23' } })
        expect(within(sheet).getByTestId('d-reading').textContent).toContain('2 hr 23 min')
    })

    it('commits an off-step length with Done, as minutes', () => {
        const onChange = vi.fn()
        render(<Controlled initial="150" onChange={onChange} />)
        const { sheet, input } = startTyping()
        fireEvent.change(input, { target: { value: '143' } })
        fireEvent.click(within(sheet).getByRole('button', { name: 'Done' }))
        expect(onChange).toHaveBeenLastCalledWith('143')
        expect(field().textContent).toBe('2 hr 23 min')
    })

    it('commits on Enter too', () => {
        const onChange = vi.fn()
        render(<Controlled onChange={onChange} />)
        const { input } = startTyping()
        fireEvent.change(input, { target: { value: '1.5 hours' } })
        fireEvent.keyDown(input, { key: 'Enter' })
        expect(onChange).toHaveBeenLastCalledWith('90')
    })

    it.each([
        ['12.5', 'Use whole minutes (90) or hours and minutes (1 hr 30).'],
        ['abc', 'Use whole minutes (90) or hours and minutes (1 hr 30).'],
        ['0', 'A length has to be at least 1 min.'],
        ['4320', 'That is 3 days. The most is 24 hr.'],
    ])('holds Done for %o and says why', (typed, why) => {
        const onChange = vi.fn()
        render(<Controlled onChange={onChange} />)
        const { sheet, input } = startTyping()
        fireEvent.change(input, { target: { value: typed } })
        expect(within(sheet).getByText(why)).toBeTruthy()
        expect(input.getAttribute('aria-invalid')).toBe('true')
        const done = within(sheet).getByRole('button', { name: 'Done' }) as HTMLButtonElement
        expect(done.disabled).toBe(true)
        fireEvent.keyDown(input, { key: 'Enter' })
        expect(onChange).not.toHaveBeenCalled()
    })

    it('goes back to the list without changing anything', () => {
        render(<Controlled initial="150" />)
        const { sheet } = startTyping()
        fireEvent.click(within(sheet).getByRole('button', { name: 'Pick from the list instead' }))
        expect(within(sheet).getByRole('radiogroup', { name: 'Hours' })).toBeTruthy()
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
        expect(field().textContent).toBe('3 hr 15 min')
        expect(screen.queryByRole('dialog')).toBeNull()
    })

    it('keeps the value when the sheet is cancelled', () => {
        const onChange = vi.fn()
        render(<Controlled initial="150" onChange={onChange} />)
        const sheet = openSheet()
        fireEvent.click(radio(sheet, 'Hours', '5 hours'))
        fireEvent.click(within(sheet).getByRole('button', { name: 'Cancel' }))
        expect(onChange).not.toHaveBeenCalled()
        expect(field().textContent).toBe('2 hr 30 min')
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
        expect(field().textContent).toBe('50 min')
    })

    it('opens a pre-cap 3-day value without breaking, and replaces it only if asked', () => {
        const onChange = vi.fn()
        render(<Controlled initial="4320" onChange={onChange} />)
        expect(field().textContent).toBe('3 days')
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

    it('keeps 44px targets on the field, the rows and the presets', () => {
        // jsdom has no layout, so this asserts the classes that produce it.
        render(<Controlled initial="90" />)
        // min-h-13 is 52px, and a minimum, so it grows at 200% text.
        expect(field().className).toContain('min-h-13')
        const sheet = openSheet()
        expect(radio(sheet, 'Hours', '1 hour').className).toContain('min-h-11')
        expect(within(sheet).getByRole('button', { name: '30 min' }).className).toContain('min-h-11')
    })
})

describe('DurationPicker: disabled', () => {
    it('cannot be opened', () => {
        render(<DurationPicker value="90" onChange={() => {}} disabled testId="d" />)
        expect(field().disabled).toBe(true)
        fireEvent.click(field())
        expect(screen.queryByRole('dialog')).toBeNull()
    })
})

describe('DurationPicker with a caller-written <label htmlFor> (AUTM-1267)', () => {
    it('puts the id on the field button, is named by the label and its value, and a label click reaches it', () => {
        // QA's suite locates `#service-duration`; it is the button now.
        render(
            <>
                <label htmlFor="service-duration">Duration</label>
                <DurationPicker id="service-duration" value="" onChange={() => {}} testId="d" />
            </>,
        )
        expect(document.getElementById('service-duration')).toBe(field())
        // Named by the label, then by its own text (the value).
        const label = screen.getByText('Duration')
        expect(field().getAttribute('aria-labelledby')).toBe(`${label.id} service-duration`)
        fireEvent.click(label)
        expect(document.activeElement).toBe(field())
    })

    it('falls back to its own name when no label points at it', () => {
        render(<DurationPicker value="" onChange={() => {}} testId="d" />)
        expect(screen.getByRole('button', { name: 'Duration, Choose a length' })).toBe(field())
    })

    it('carries a caller’s extra props, the form error’s describedby included', () => {
        const onBlur = vi.fn()
        render(
            <DurationPicker
                value="90"
                onChange={() => {}}
                onBlur={onBlur}
                aria-describedby="hint"
                testId="d"
            />,
        )
        expect(field().getAttribute('aria-describedby')).toBe('hint')
        fireEvent.blur(field())
        expect(onBlur).toHaveBeenCalled()
    })
})
