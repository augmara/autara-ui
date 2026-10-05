import type { Meta, StoryObj } from '@storybook/react-vite'
import { InvoiceStatusBadge } from './InvoiceStatusBadge'
import { MoneyBreakdown } from './MoneyBreakdown'

/**
 * InvoiceStatusBadge — the one invoice status colour system (AUTM-1737).
 *
 * Due and overdue red, partially paid amber, paid green (lime), draft and
 * void neutral. The state is the server's `InvoiceBreakdown.paymentState`;
 * the consumer never picks a colour. Use the theme toolbar for dark.
 */
const meta = {
    title: 'Atoms/InvoiceStatusBadge',
    component: InvoiceStatusBadge,
    parameters: { layout: 'centered' },
    argTypes: {
        state: {
            control: { type: 'select' },
            options: ['DRAFT', 'DUE', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'VOID'],
        },
    },
    args: { state: 'DUE' },
} satisfies Meta<typeof InvoiceStatusBadge>

export default meta
type Story = StoryObj<typeof meta>

export const Due: Story = { args: { state: 'DUE' } }
export const Overdue: Story = { args: { state: 'OVERDUE' } }
export const PartiallyPaid: Story = { args: { state: 'PARTIALLY_PAID' } }
export const Paid: Story = { args: { state: 'PAID' } }
export const Draft: Story = { args: { state: 'DRAFT' } }
export const Void: Story = { args: { state: 'VOID' } }

/** Every state side by side, the way a list of invoices reads. */
export const AllStates: Story = {
    render: () => (
        <div className="flex flex-wrap items-center gap-2.5">
            {(['DUE', 'OVERDUE', 'PARTIALLY_PAID', 'PAID', 'DRAFT', 'VOID'] as const).map((s) => (
                <InvoiceStatusBadge key={s} state={s} />
            ))}
        </div>
    ),
}

/** Words overridden, tone still from the state. */
export const CustomWords: Story = {
    render: () => (
        <div className="flex flex-wrap items-center gap-2.5">
            <InvoiceStatusBadge state="PARTIALLY_PAID">$14.00 due</InvoiceStatusBadge>
            <InvoiceStatusBadge state="PAID">Paid 12 Oct</InvoiceStatusBadge>
            <InvoiceStatusBadge state="OVERDUE">Overdue 3 days</InvoiceStatusBadge>
        </div>
    ),
}

/** A state the badge does not know reads as its own words, in band. */
export const UnknownState: Story = { args: { state: 'REFUND_PENDING' } }

/**
 * In context: the invoice header and its breakdown, as the merchant portal and
 * customer web show the first live founder booking (a $20 service, $6 deposit
 * paid, $14 outstanding, the $5 extra never approved so not on the invoice).
 */
export const InvoiceHeaderInContext: Story = {
    parameters: { layout: 'padded' },
    render: () => (
        <div className="max-w-md">
            <div className="flex flex-wrap items-center gap-2">
                <InvoiceStatusBadge state="PARTIALLY_PAID" />
                <p className="text-[0.8125rem] font-medium text-[var(--text-muted)]">INV-0001</p>
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-[var(--text-strong)]">Sam Lee</h1>
            <MoneyBreakdown
                className="mt-5"
                card
                title="Payment"
                label="Invoice payment summary"
                rows={[
                    { label: 'Service', value: 'A$20.00' },
                    { label: 'Invoice total', value: 'A$20.00', emphasis: true },
                    { label: 'Deposit paid', value: 'A$6.00', muted: true },
                    { label: 'Paid so far', value: 'A$6.00' },
                ]}
                total={{ label: 'Outstanding', value: 'A$14.00' }}
            />
        </div>
    ),
}

/** Long words on a narrow phone row: the pill never wraps, the row does. */
export const NarrowRow: Story = {
    parameters: { layout: 'padded' },
    render: () => (
        <div className="flex w-[320px] items-center justify-between gap-3 border-b border-[var(--hairline)] py-3">
            <div className="min-w-0">
                <p className="truncate text-base font-medium text-[var(--text-strong)]">
                    Full interior and exterior car care, two days
                </p>
                <p className="text-[0.8125rem] text-[var(--text-muted)]">INV-0042 · Due 14 Oct</p>
            </div>
            <InvoiceStatusBadge state="PARTIALLY_PAID" />
        </div>
    ),
}
