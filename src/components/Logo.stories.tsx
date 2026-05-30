import type { Meta, StoryObj } from '@storybook/react-vite'
import { Logo } from './Logo'

const meta: Meta<typeof Logo> = {
    title: 'Design System/Logo',
    component: Logo,
    parameters: { layout: 'centered' },
}
export default meta
type Story = StoryObj<typeof Logo>

export const Default: Story = {}

export const TextOnly: Story = { args: { textOnly: true } }

export const Small: Story = { args: { className: 'h-5 w-auto' } }
export const Medium: Story = { args: { className: 'h-7 w-auto' } }
export const Large: Story = { args: { className: 'h-12 w-auto' } }

export const InTopBar: Story = {
    name: 'In context — TopBar chrome',
    parameters: { layout: 'padded' },
    render: () => (
        <div className="flex w-[640px] items-center gap-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] px-4 py-3">
            <Logo className="h-6 w-auto text-[var(--text-strong)]" />
            <span className="ml-auto text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
                Merchant portal
            </span>
        </div>
    ),
}

export const InvertedInk: Story = {
    name: 'On dark surface — wordmark white',
    parameters: { layout: 'padded' },
    render: () => (
        <div className="grid h-40 w-[640px] place-items-center rounded-2xl bg-[#0E0A1A] text-white">
            <Logo className="h-9 w-auto" />
        </div>
    ),
}
