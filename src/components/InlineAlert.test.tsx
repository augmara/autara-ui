import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { InlineAlert } from './InlineAlert'
import { NativeSelect } from './NativeSelect'
import { MoneyBreakdown } from './MoneyBreakdown'

/** AUTM-1185 — semantics the sweep relies on. */
describe('InlineAlert', () => {
    it('is assertive only when it is an error', () => {
        render(
            <>
                <InlineAlert tone="error" testId="e">
                    That code didn't match.
                </InlineAlert>
                <InlineAlert tone="success" testId="s">
                    Saved.
                </InlineAlert>
            </>,
        )
        expect(screen.getByTestId('e').getAttribute('role')).toBe('alert')
        expect(screen.getByTestId('s').getAttribute('role')).toBe('status')
    })
})

describe('NativeSelect', () => {
    it('is a real select with the placeholder as a disabled empty option', () => {
        render(
            <NativeSelect placeholder="Choose a make" testId="make" aria-invalid="true">
                <option value="Toyota">Toyota</option>
            </NativeSelect>,
        )
        const el = screen.getByTestId('make') as HTMLSelectElement
        expect(el.tagName).toBe('SELECT')
        expect(el.value).toBe('')
        expect(el.options[0].disabled).toBe(true)
        expect(el.getAttribute('aria-invalid')).toBe('true')
        expect(el.className).toContain('field-input')
    })
})

describe('MoneyBreakdown', () => {
    it('reads as a definition list with the total last', () => {
        render(
            <MoneyBreakdown
                label="If you cancel now"
                rows={[{ label: 'Deposit paid', value: 'A$54.00', testId: 'row-deposit' }]}
                total={{ label: 'You get back', value: 'A$27.00', testId: 'row-total' }}
            />,
        )
        const values = screen.getAllByRole('definition')
        expect(values).toHaveLength(2)
        expect(values[0].tagName).toBe('DD')
        expect(screen.getByTestId('row-deposit').textContent).toContain('A$54.00')
        expect(screen.getByTestId('row-total').textContent).toContain('You get back')
    })
})
