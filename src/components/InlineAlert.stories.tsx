import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from './Button'
import { InlineAlert } from './InlineAlert'

const meta = {
    title: 'Atoms/InlineAlert',
    component: InlineAlert,
    parameters: { layout: 'padded' },
    args: {
        children: 'Check your connection and try again.',
    },
} satisfies Meta<typeof InlineAlert>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
    render: (args) => (
        <div className="max-w-md">
            <InlineAlert {...args} />
        </div>
    ),
}

export const Tones: Story = {
    render: () => (
        <div className="flex max-w-md flex-col gap-3">
            <InlineAlert tone="info" title="Saved on this device only">
                Marketing preferences are kept in this browser for now.
            </InlineAlert>
            <InlineAlert tone="success" title="Saved">
                Your details are up to date.
            </InlineAlert>
            <InlineAlert tone="warning" title="Almost out of time">
                Free cancellation ends in 3 hours.
            </InlineAlert>
            <InlineAlert tone="error" title="That code didn't match">
                Try again, or request a new one below.
            </InlineAlert>
        </div>
    ),
}

export const WithAction: Story = {
    args: {
        tone: 'error',
        title: "We couldn't save your booking",
        children:
            'Something failed on our side, not your connection. Try again in a moment.',
        action: (
            <Button variant="glass" size="sm">
                Try again
            </Button>
        ),
    },
    render: (args) => (
        <div className="max-w-md">
            <InlineAlert {...args} />
        </div>
    ),
}

export const LongCopyNarrow: Story = {
    args: {
        tone: 'warning',
        title: 'This sign-in has no customer profile',
        children:
            "You're signed in, but this sign-in has no Autara customer profile, so nothing that needs your account can go through. This usually means a sign-up didn't finish. Sign out and sign in with your email address, or email support and we'll repair your account.",
    },
    render: (args) => (
        <div className="w-[280px]">
            <InlineAlert {...args} />
        </div>
    ),
}
