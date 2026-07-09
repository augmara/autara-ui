import type { Meta, StoryObj } from '@storybook/react-vite'
import { BackButton } from './BackButton'

const meta: Meta<typeof BackButton> = {
    title: 'Molecules/BackButton',
    component: BackButton,
    parameters: { layout: 'centered' },
}
export default meta
type Story = StoryObj<typeof BackButton>

export const IconOnly: Story = {
    args: { ariaLabel: 'Back' },
}

export const WithLabel: Story = {
    args: { label: 'Bookings' },
}

export const AsLink: Story = {
    name: 'asChild — framework link',
    render: () => (
        <BackButton asChild label="Bookings">
            {/* Stands in for next/link / react-router Link */}
            <a href="#bookings" />
        </BackButton>
    ),
}

export const LongLabel: Story = {
    name: 'Edge — long label',
    args: { label: 'Booking #EF51E4 · Full interior detail' },
}

export const InContext: Story = {
    name: 'In context — detail-screen header',
    parameters: { layout: 'padded' },
    render: () => (
        <div className="max-w-xl">
            <div className="mb-4">
                <BackButton asChild label="Bookings">
                    <a href="#bookings" />
                </BackButton>
            </div>
            <div className="text-micro font-medium uppercase tracking-[0.22em] text-[var(--text-muted)]">
                Booking #EF51E4
            </div>
            <h1 className="mt-2 text-3xl font-bold tracking-[-0.03em] text-[var(--text-strong)]">
                Full interior detail
            </h1>
        </div>
    ),
}
