import type { Meta, StoryObj } from '@storybook/react-vite'
import { MoneyBreakdown } from './MoneyBreakdown'

const meta = {
    title: 'Molecules/MoneyBreakdown',
    component: MoneyBreakdown,
    parameters: { layout: 'padded' },
} satisfies Meta<typeof MoneyBreakdown>

export default meta
type Story = StoryObj<typeof meta>

export const CheckoutReview: Story = {
    args: {
        label: 'Payment summary',
        rows: [
            { label: 'Exterior detail', value: 'A$180.00' },
            { label: 'Deposit now (30%)', value: 'A$54.00', emphasis: true },
            { label: 'Balance after the job', value: 'A$126.00' },
        ],
        total: { label: 'Total', value: 'A$180.00' },
        note: 'GST included. The balance is charged when the pro marks the job complete.',
    },
    render: (args) => (
        <div className="max-w-sm rounded-autara-lg border border-[var(--border-subtle)] bg-[var(--surface)] p-5">
            <MoneyBreakdown {...args} />
        </div>
    ),
}

export const CancellationPreview: Story = {
    args: {
        label: 'If you cancel now',
        rows: [
            { label: 'Deposit paid', value: 'A$54.00' },
            { label: 'Cancellation fee (50%)', value: 'A$27.00', muted: true },
        ],
        total: { label: 'You get back', value: 'A$27.00' },
        note: 'Refunds land within 5 to 10 business days, depending on your bank.',
    },
    render: (args) => (
        <div className="max-w-sm">
            <MoneyBreakdown {...args} />
        </div>
    ),
}

export const NoTotal: Story = {
    args: {
        rows: [
            { label: 'Deposit paid', value: 'A$54.00' },
            { label: 'Refunded', value: 'A$54.00', emphasis: true },
        ],
    },
    render: (args) => (
        <div className="max-w-sm">
            <MoneyBreakdown {...args} />
        </div>
    ),
}

export const LongLabelsNarrow: Story = {
    args: {
        rows: [
            {
                label: 'Full interior and exterior detail with ceramic coating, two-day booking',
                value: 'A$1,240.00',
            },
            { label: 'Deposit now (30%)', value: 'A$372.00', emphasis: true },
        ],
        total: { label: 'Total', value: 'A$1,240.00' },
    },
    render: (args) => (
        <div className="w-[260px]">
            <MoneyBreakdown {...args} />
        </div>
    ),
}
