import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FormField } from './FormField'
import { Input } from './Input'

/**
 * AUTM-935 — FormField's whole job is the wiring. These assert the four
 * things that were missing, plus the precedence rule that makes the change
 * safe to ship to pinned consumers: the caller always wins.
 */
describe('FormField', () => {
    it('associates the label with the control without an explicit htmlFor', () => {
        render(
            <FormField label="Business name">
                <Input defaultValue="" />
            </FormField>
        )
        // Throws if the label is not associated — which is the bug.
        expect(screen.getByLabelText(/business name/i)).toBeTruthy()
    })

    it('marks the control invalid and announces the error while error is set', () => {
        render(
            <FormField label="Email" error="Enter an email we can reach you on">
                <Input defaultValue="" />
            </FormField>
        )
        const input = screen.getByLabelText(/email/i)
        expect(input.getAttribute('aria-invalid')).toBe('true')

        const alert = screen.getByRole('alert')
        expect(alert.textContent).toContain('reach you on')
        // The error must be IN the control's accessible description, not
        // merely nearby — otherwise focusing the field reads the label and
        // stops.
        expect(input.getAttribute('aria-describedby')).toContain(
            alert.getAttribute('id')
        )
    })

    it('describes the control with the description when there is no error', () => {
        render(
            <FormField label="ABN" description="11 digits, no spaces">
                <Input defaultValue="" />
            </FormField>
        )
        const input = screen.getByLabelText(/abn/i)
        const desc = screen.getByText('11 digits, no spaces')
        expect(input.getAttribute('aria-describedby')).toContain(
            desc.getAttribute('id')
        )
        expect(input.getAttribute('aria-invalid')).toBeNull()
    })

    it('gives required an accessible name, not just a red asterisk', () => {
        render(
            <FormField label="First name" required>
                <Input defaultValue="" />
            </FormField>
        )
        const input = screen.getByLabelText(/first name/i)
        expect(input.getAttribute('aria-required')).toBe('true')
        // The asterisk itself must not reach the accessibility tree.
        expect(screen.getByText('*').getAttribute('aria-hidden')).toBe('true')
    })

    it('never clobbers an id or aria-invalid the caller set', () => {
        render(
            <FormField label="Phone" htmlFor="phone" error="Check the number">
                <Input id="phone" aria-invalid={false} defaultValue="" />
            </FormField>
        )
        const input = screen.getByLabelText(/phone/i)
        expect(input.getAttribute('id')).toBe('phone')
        expect(input.getAttribute('aria-invalid')).toBe('false')
    })

    /**
     * merchant-mobile's MeScreen points describedby at a CharCount. Replacing
     * rather than merging would trade one announcement for another, so this
     * is the assertion that keeps the change safe for the pinned consumer.
     */
    it('merges the callers aria-describedby instead of replacing it', () => {
        render(
            <FormField label="Description" error="Too long">
                <Input aria-describedby="description-count" defaultValue="" />
                <span id="description-count">240 / 200</span>
            </FormField>
        )
        const described =
            screen.getByLabelText(/description/i).getAttribute('aria-describedby') ?? ''
        expect(described).toContain('description-count')
        expect(described).toContain('error')
    })

    it('wires only the first element child, leaving adornments alone', () => {
        render(
            <FormField label="Notes">
                <Input defaultValue="" />
                <span data-testid="adornment">0 / 200</span>
            </FormField>
        )
        expect(screen.getByTestId('adornment').getAttribute('id')).toBeNull()
    })

    it('wireControl={false} restores the pre-AUTM-935 hands-off behaviour', () => {
        render(
            <FormField label="Business type" required wireControl={false}>
                <div data-testid="group" role="radiogroup" />
            </FormField>
        )
        const group = screen.getByTestId('group')
        expect(group.getAttribute('id')).toBeNull()
        expect(group.getAttribute('aria-required')).toBeNull()
    })
})
