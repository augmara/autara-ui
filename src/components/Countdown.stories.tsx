import type { Meta, StoryObj } from '@storybook/react-vite'
import { Countdown } from './Countdown'

const meta = {
    title: 'Feedback/Countdown',
    component: Countdown,
    parameters: { layout: 'padded' },
} satisfies Meta<typeof Countdown>

export default meta
type Story = StoryObj<typeof meta>

const inMinutes = (m: number) => new Date(Date.now() + m * 60_000).toISOString()

export const Minutes: Story = {
    args: { until: inMinutes(27) },
}

export const Hours: Story = {
    args: { until: inMinutes(3 * 60 + 12) },
}

export const Days: Story = {
    args: { until: inMinutes(3 * 24 * 60) },
}

/** Under a minute: no seconds, because the live region ticks per minute. */
export const AlmostGone: Story = {
    args: { until: inMinutes(0.4) },
}

export const Expired: Story = {
    args: { until: inMinutes(-5) },
}

/** In context: the magic-link confirm page's hold on a slot. */
export const InContext: Story = {
    args: { until: inMinutes(42), prefix: 'Your slot is held for' },
    render: (args) => (
        <div className="glass-surface glass-surface--flat max-w-md p-5">
            <h3 className="text-base font-bold text-[var(--text-strong)]">
                Confirm your booking
            </h3>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
                Pay the deposit to lock in Saturday, 9:30 am.
            </p>
            <p className="mt-3 text-sm font-medium text-[var(--text-strong)]">
                <Countdown {...args} />
            </p>
        </div>
    ),
}
