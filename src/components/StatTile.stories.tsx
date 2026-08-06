import type { Meta, StoryObj } from '@storybook/react-vite'
import { StatTile } from './StatTile'
import { StatsStrip } from './StatsStrip'

const meta: Meta<typeof StatTile> = {
    title: 'Merchant portal/StatTile',
    component: StatTile,
    parameters: { layout: 'padded' },
}
export default meta
type Story = StoryObj<typeof StatTile>

export const MoneyIn: Story = {
    name: 'money-in — revenue',
    args: {
        label: 'Today',
        value: '$480',
        caption: '3 jobs',
        tone: 'money-in',
    },
}

export const MoneyOut: Story = {
    name: 'money-out — payouts',
    args: {
        label: 'Next payout',
        value: '$1,240',
        caption: 'Fri 8 Aug',
        tone: 'money-out',
    },
}

export const Brand: Story = {
    name: 'brand — counts',
    args: { label: 'Customers', value: 48, caption: '6 new this month' },
}

export const NoTick: Story = {
    name: 'none — opt out of the tick',
    args: { label: 'Completed', value: 142, tone: 'none' },
}

export const Loading: Story = {
    args: { label: 'This month', value: null, tone: 'money-in' },
}

/**
 * The three tones side by side. This is the story to look at when deciding
 * which tone a new stat gets — the mapping is meaning, not palette, so a
 * screen that pairs lime with a payout is a bug even though it renders.
 */
export const ToneVocabulary: Story = {
    name: 'Tone vocabulary',
    render: () => (
        <div className="grid grid-cols-3 gap-3">
            <StatTile
                tone="money-in"
                label="Takings"
                value="$4,820"
                caption="money in"
            />
            <StatTile
                tone="money-out"
                label="Paid out"
                value="$3,910"
                caption="money out"
            />
            <StatTile
                tone="brand"
                label="Customers"
                value={48}
                caption="not money"
            />
        </div>
    ),
}

/**
 * In context — `StatsStrip` is this tile in a grid. Same component, so the
 * two can no longer drift the way `TodayKpi` and `StatsStrip` did.
 */
export const InStrip: Story = {
    name: 'In context — StatsStrip',
    render: () => (
        <StatsStrip
            stats={[
                { label: 'This month', value: '$4,820', tone: 'money-in' },
                { label: 'Paid out', value: '$3,910', tone: 'money-out' },
                { label: 'Pending', value: '$640', tone: 'money-out' },
                { label: 'Lifetime', value: '$24,580', caption: '142 jobs' },
            ]}
        />
    ),
}
