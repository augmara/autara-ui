import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { Badge } from './Badge'
import { InvoiceStatusBadge, invoiceStatusLabel, invoiceStatusTone } from './InvoiceStatusBadge'

/**
 * AUTM-1737 — Don's one colour system for invoices: pending payments red,
 * paid green, partially paid amber, draft and void neutral. The colour is a
 * Badge sheet tone, so its contrast is the one palette-contrast.test.ts
 * already measures; these pin the MAPPING, which is the part a consumer used
 * to get wrong (ISSUED was aqua, PAID neutral, in the merchant portal).
 */
describe('InvoiceStatusBadge', () => {
    it.each([
        ['DUE', 'danger', 'Due'],
        ['OVERDUE', 'danger', 'Overdue'],
        ['PARTIALLY_PAID', 'amber', 'Partially paid'],
        ['PAID', 'lime', 'Paid'],
        ['DRAFT', 'band', 'Draft'],
        ['VOID', 'band', 'Void'],
    ] as const)('%s is %s and reads "%s"', (state, tone, label) => {
        expect(invoiceStatusTone(state)).toBe(tone)
        expect(invoiceStatusLabel(state)).toBe(label)
        // Renders exactly the Badge tone, so it inherits the sheet's solid
        // fill and measured ink rather than restating them.
        const a = render(<InvoiceStatusBadge state={state} />).container.firstElementChild!
        const b = render(<Badge variant={tone}>{label}</Badge>).container.firstElementChild!
        expect(a.className).toBe(b.className)
        expect(a.textContent).toBe(label)
        expect(a.getAttribute('data-state')).toBe(state)
    })

    it('accepts the state in any case', () => {
        expect(invoiceStatusTone('paid')).toBe('lime')
        expect(invoiceStatusLabel('partially_paid')).toBe('Partially paid')
    })

    it('never guesses a money colour for a state it does not know', () => {
        expect(invoiceStatusTone('REFUND_PENDING')).toBe('band')
        expect(invoiceStatusLabel('REFUND_PENDING')).toBe('Refund pending')
        const el = render(<InvoiceStatusBadge state="REFUND_PENDING" />).container.firstElementChild!
        expect(el.getAttribute('data-state')).toBe('UNKNOWN')
        expect(el.textContent).toBe('Refund pending')
    })

    it('says Unknown, not nothing, for a missing state', () => {
        expect(invoiceStatusTone(null)).toBe('band')
        expect(invoiceStatusLabel(undefined)).toBe('Unknown')
    })

    it('lets the words change while the tone follows the state', () => {
        const el = render(<InvoiceStatusBadge state="PARTIALLY_PAID">$14.00 due</InvoiceStatusBadge>).container
            .firstElementChild!
        expect(el.textContent).toBe('$14.00 due')
        expect(el.className).toContain('bg-[var(--amber)]')
    })

    it('passes through props such as a test id', () => {
        const el = render(<InvoiceStatusBadge state="PAID" data-testid="invoice-status" />).container
            .firstElementChild!
        expect(el.getAttribute('data-testid')).toBe('invoice-status')
    })
})
