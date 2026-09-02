import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { PhoneInput } from './PhoneInput'
import { DEFAULT_COUNTRIES, findCountryByIso } from './PhoneCountries'

/**
 * The bug these lock down (AUTM-780): PhoneInput concatenated the dial
 * code onto the user's typed digits, so an Australian mobile entered the
 * only way an Australian writes it — 0491 570 156 — became
 * +610491570156. Cognito ACCEPTED that, no customer profile was created
 * against it, and checkout then reported the failure as the customer's
 * connection. Silent acceptance of a malformed number is worse than
 * rejection, which is why these are unit tests and not a lint rule.
 */
describe('PhoneInput — E.164 emission', () => {
    const type = (digits: string, onChange: (v: string) => void, props = {}) => {
        render(<PhoneInput onChange={onChange} {...props} />)
        fireEvent.change(screen.getByRole('textbox'), {
            target: { value: digits },
        })
    }

    it('strips the AU trunk zero — the reported defect', () => {
        const onChange = vi.fn()
        type('0491570156', onChange)
        expect(onChange).toHaveBeenLastCalledWith('+61491570156')
        expect(onChange).not.toHaveBeenLastCalledWith('+610491570156')
    })

    it('accepts a number already in national form, without a zero', () => {
        const onChange = vi.fn()
        type('491570156', onChange)
        expect(onChange).toHaveBeenLastCalledWith('+61491570156')
    })

    it('strips only ONE leading zero, not a run of them', () => {
        const onChange = vi.fn()
        type('00491570156', onChange)
        // The second zero is not a trunk prefix; keeping it means the
        // number stays visibly wrong to a human rather than silently
        // becoming a different valid-looking number.
        expect(onChange).toHaveBeenLastCalledWith('+610491570156')
    })

    it('KEEPS the leading zero for Italy, where it is part of the number', () => {
        const onChange = vi.fn()
        type('0612345678', onChange, { defaultCountry: 'IT' })
        expect(onChange).toHaveBeenLastCalledWith('+390612345678')
    })

    it('leaves NANP numbers untouched — there is no trunk prefix to strip', () => {
        const onChange = vi.fn()
        type('2125550123', onChange, { defaultCountry: 'US' })
        expect(onChange).toHaveBeenLastCalledWith('+12125550123')
    })

    it('strips punctuation as well as the trunk zero', () => {
        const onChange = vi.fn()
        type('(0491) 570-156', onChange)
        expect(onChange).toHaveBeenLastCalledWith('+61491570156')
    })

    it('applies the per-country rule to the SAME digits', () => {
        // The country control is a Radix Select, which cannot be driven by
        // fireEvent in jsdom, so this drives `defaultCountry` instead. It
        // covers the risk that matters — identical keystrokes must emit
        // differently depending on the country's numbering plan — without
        // pretending to test the dropdown's interaction.
        //
        // Unmounting between the two is deliberate: re-rendering in place
        // and firing the SAME value is a no-op, because React does not
        // dispatch change when the input's value has not moved. That
        // silently produced zero calls and an `undefined` assertion.
        const DIGITS = '0612345678'

        const au = vi.fn()
        const first = render(<PhoneInput onChange={au} defaultCountry="AU" />)
        fireEvent.change(screen.getByRole('textbox'), {
            target: { value: DIGITS },
        })
        expect(au).toHaveBeenLastCalledWith('+61612345678')
        first.unmount()

        const it_ = vi.fn()
        render(<PhoneInput onChange={it_} defaultCountry="IT" />)
        fireEvent.change(screen.getByRole('textbox'), {
            target: { value: DIGITS },
        })
        // Same ten keystrokes, opposite rule: Italy's zero is the number.
        expect(it_).toHaveBeenLastCalledWith('+390612345678')
    })

    it('strips the trunk zero for GB too, not just the launch market', () => {
        const onChange = vi.fn()
        type('07911123456', onChange, { defaultCountry: 'GB' })
        expect(onChange).toHaveBeenLastCalledWith('+447911123456')
    })

    it('keeps the typed zero VISIBLE while emitting the stripped form', () => {
        // Regression guard for the display buffer. Deriving the input's
        // value from the emitted E.164 would make the 0 disappear under
        // the cursor, which reads as the field eating keystrokes.
        const onChange = vi.fn()
        type('0491570156', onChange)
        expect(screen.getByRole('textbox')).toHaveValue('0491570156')
        expect(onChange).toHaveBeenLastCalledWith('+61491570156')
    })
})

describe('PhoneCountries — trunkPrefix data', () => {
    it('declares a trunk prefix ONLY where it is unambiguous', () => {
        const declared = DEFAULT_COUNTRIES.filter((c) => c.trunkPrefix)
            .map((c) => c.iso)
            .sort()
        expect(declared).toEqual(['AU', 'GB', 'IE', 'NZ'])
    })

    it('never declares one for Italy or NANP', () => {
        for (const iso of ['IT', 'US', 'CA']) {
            expect(findCountryByIso(iso, DEFAULT_COUNTRIES)?.trunkPrefix)
                .toBeUndefined()
        }
    })
})
