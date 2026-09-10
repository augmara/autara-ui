import type { Meta, StoryObj } from '@storybook/react-vite'
import { PolicyTimeline } from './PolicyTimeline'

const meta = {
    title: 'Feedback/PolicyTimeline',
    component: PolicyTimeline,
    parameters: { layout: 'padded' },
    args: {
        steps: [
            { label: 'Before the pro accepts', value: 'Free' },
            { label: 'More than 24h before', value: 'Free', current: true },
            { label: '24h to 4h before', value: '50% fee' },
            { label: 'Under 4h before', value: 'No refund' },
        ],
    },
} satisfies Meta<typeof PolicyTimeline>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
    render: (args) => (
        <div className="max-w-2xl">
            <PolicyTimeline {...args} />
        </div>
    ),
}

/** Inside four hours: the tier that costs the whole deposit is the live one. */
export const InsideTheLastTier: Story = {
    args: {
        steps: [
            { label: 'Before the pro accepts', value: 'Free' },
            { label: 'More than 24h before', value: 'Free' },
            { label: '24h to 4h before', value: '50% fee' },
            { label: 'Under 4h before', value: 'No refund', current: true },
        ],
    },
    render: (args) => (
        <div className="max-w-2xl">
            <PolicyTimeline {...args} />
        </div>
    ),
}

/** Two tiers, and a narrow container: the row becomes a list. */
export const Narrow: Story = {
    args: {
        steps: [
            { label: 'More than 24h before', value: 'Free', current: true },
            { label: 'Inside 24h', value: '50% fee' },
        ],
    },
    render: (args) => (
        <div className="max-w-[320px]">
            <PolicyTimeline {...args} />
        </div>
    ),
}

/** In context: beside the refund, on the cancellation panel. */
export const InContext: Story = {
    render: (args) => (
        <div className="glass-surface glass-surface--flat max-w-md space-y-4 p-5">
            <div className="flex items-baseline justify-between">
                <span className="text-sm text-[var(--text-muted)]">You get back</span>
                <span className="text-base font-bold tabular-nums text-[var(--text-strong)]">
                    A$54.00
                </span>
            </div>
            <div>
                <h4 className="text-sm font-medium text-[var(--text-strong)]">
                    Autara&apos;s cancellation policy
                </h4>
                <PolicyTimeline {...args} className="mt-3" />
            </div>
        </div>
    ),
}
