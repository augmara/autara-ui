import type { Meta, StoryObj } from '@storybook/react-vite'
import { InfoRow } from './InfoRow'

const meta: Meta<typeof InfoRow> = {
    title: 'Molecules/InfoRow',
    component: InfoRow,
    parameters: { layout: 'padded' },
}
export default meta
type Story = StoryObj<typeof InfoRow>

export const Default: Story = {
    args: { label: 'Subtotal', value: '$230.00' },
}

export const Emphasised: Story = {
    args: { label: 'Total', value: '$253.00', emphasised: true },
}

export const TextValue: Story = {
    args: { label: 'Status', value: 'Deposit captured' },
}

export const InPaymentSummary: Story = {
    name: 'In context — payment summary card',
    render: () => (
        <div className="w-[420px] rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] p-5">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--text-subtle)]">
                Payment
            </p>
            <div className="mt-2 divide-y divide-[var(--border-subtle)]">
                <InfoRow label="Subtotal" value="$230.00" />
                <InfoRow label="Deposit captured" value="$50.00" />
                <InfoRow label="Add-on — interior" value="$45.00" />
                <InfoRow label="Total" value="$320.00" emphasised />
            </div>
        </div>
    ),
}
