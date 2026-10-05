import * as React from 'react'
import { Badge, type BadgeProps } from './Badge'

/**
 * InvoiceStatusBadge — one colour system for an invoice's payment state, on
 * every surface that shows one (AUTM-1737).
 *
 * Don, 2026-10-05: "invoices follow one colour system: pending payments red,
 * completed invoices green, other statuses in their own colours". Before this
 * the merchant portal mapped ISSUED to aqua and PAID to a neutral pill, the
 * customer web had its own map, and the PDF a third, so the same unpaid
 * invoice read three different ways.
 *
 * The state is the server's `InvoiceBreakdown.paymentState`, which merchant-api
 * and customer-api both derive the same way, so no consumer decides it:
 *
 *   DUE, OVERDUE     danger   money is owed (red)
 *   PARTIALLY_PAID   amber    some came in, the rest is owed
 *   PAID             lime     settled (the sheet's done-and-money-in colour)
 *   DRAFT, VOID      band     not asking for money
 *
 * Solid fills only, from Badge's own sheet tones, so the text contrast is the
 * one `tokens/palette-contrast.test.ts` already measures (on-danger-fill 6.57:1,
 * on-amber and on-lime well above AA) in both themes. No tints, no outlines.
 *
 * One placement rule from the sheet: lime is never set on a band card (1.03:1
 * against it, pinned in the palette test). Put a Paid badge on paper.
 *
 * `children` overrides the words ("Paid 12 Oct", "$14.00 due") while the tone
 * keeps following the state, so a consumer can say more without choosing a
 * colour. An unknown state renders its own words in band rather than guessing
 * a colour for money.
 */
export type InvoicePaymentState = 'DRAFT' | 'DUE' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE' | 'VOID'

export type InvoiceStatusTone = 'danger' | 'amber' | 'lime' | 'band'

const TONE: Record<InvoicePaymentState, InvoiceStatusTone> = {
    DUE: 'danger',
    OVERDUE: 'danger',
    PARTIALLY_PAID: 'amber',
    PAID: 'lime',
    DRAFT: 'band',
    VOID: 'band',
}

const LABEL: Record<InvoicePaymentState, string> = {
    DUE: 'Due',
    OVERDUE: 'Overdue',
    PARTIALLY_PAID: 'Partially paid',
    PAID: 'Paid',
    DRAFT: 'Draft',
    VOID: 'Void',
}

function known(state: string | null | undefined): InvoicePaymentState | null {
    const key = (state ?? '').toUpperCase()
    return key in TONE ? (key as InvoicePaymentState) : null
}

/** The badge tone for a payment state. Unknown states are band. */
export function invoiceStatusTone(state: string | null | undefined): InvoiceStatusTone {
    const k = known(state)
    return k ? TONE[k] : 'band'
}

/** Sentence-case words for a payment state. Unknown states are humanised. */
export function invoiceStatusLabel(state: string | null | undefined): string {
    const k = known(state)
    if (k) return LABEL[k]
    const words = String(state ?? '').toLowerCase().split('_').join(' ').trim()
    return words ? words.charAt(0).toUpperCase() + words.slice(1) : 'Unknown'
}

export interface InvoiceStatusBadgeProps extends Omit<BadgeProps, 'variant'> {
    /** `InvoiceBreakdown.paymentState` from merchant-api or customer-api. */
    state: InvoicePaymentState | string | null | undefined
}

export const InvoiceStatusBadge = React.forwardRef<HTMLDivElement, InvoiceStatusBadgeProps>(
    ({ state, children, ...props }, ref) => (
        <Badge
            ref={ref}
            variant={invoiceStatusTone(state)}
            data-state={known(state) ?? 'UNKNOWN'}
            {...props}
        >
            {children ?? invoiceStatusLabel(state)}
        </Badge>
    )
)
InvoiceStatusBadge.displayName = 'InvoiceStatusBadge'
