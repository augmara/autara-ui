import type { Meta, StoryObj } from '@storybook/react-vite'
import { StatsStrip } from './StatsStrip'

const meta: Meta<typeof StatsStrip> = {
    title: 'Merchant portal/StatsStrip',
    component: StatsStrip,
    parameters: { layout: 'padded' },
}
export default meta
type Story = StoryObj<typeof StatsStrip>

export const Default: Story = {
    args: {
        stats: [
            { label: 'Today', value: 3 },
            { label: 'Pending', value: 1 },
            { label: 'Upcoming', value: 7 },
            { label: 'Completed', value: 142 },
        ],
    },
}

export const ThreeColumn: Story = {
    name: '3-column — Customers',
    args: {
        stats: [
            { label: 'Total', value: 48 },
            { label: 'Lifetime', value: '$24,580' },
            { label: 'Avg per customer', value: '$512' },
        ],
    },
}

export const TwoColumn: Story = {
    args: {
        stats: [
            { label: 'Confirmed', value: 24 },
            { label: 'Cancelled', value: 2 },
        ],
    },
}

export const WithCaption: Story = {
    args: {
        stats: [
            { label: 'This month', value: '$4,820' },
            { label: 'Last month', value: '$3,910' },
            { label: 'Pending payouts', value: '$640' },
            {
                label: 'Lifetime',
                value: '$24,580',
                caption: '142 completed',
            },
        ],
    },
}

export const Loading: Story = {
    args: {
        loading: true,
        stats: [
            { label: 'Today', value: null },
            { label: 'Pending', value: null },
            { label: 'Upcoming', value: null },
            { label: 'Completed', value: null },
        ],
    },
}

export const PartialLoading: Story = {
    name: 'Partial loading — value null',
    args: {
        stats: [
            { label: 'Today', value: 3 },
            { label: 'Outstanding', value: null },
            { label: 'This week', value: '$1,240' },
            { label: 'Next payout', value: null },
        ],
    },
}
