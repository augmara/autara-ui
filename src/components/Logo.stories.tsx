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

/**
 * AUTM-1158 — the merchant-facing lockup.
 *
 * Merchant and customer are two products wearing one wordmark: a merchant
 * signing in to run their business saw exactly what a customer sees booking a
 * wash. Concept E from the 2026-09-07 sheet, chosen by Don out of six.
 *
 * The hairline is a separator, not emphasis, so it is not the outline rule 4
 * bans. Without it the two halves read as unrelated objects placed near each
 * other, which was the first cut and what he rejected.
 */
export const BusinessLockup: Story = {
    name: 'Business lockup',
    render: () => (
        <div className="flex flex-col gap-6 text-[var(--text-strong)]">
            <Logo lockup="business" size="xl" />
            <Logo lockup="business" size="lg" />
            <Logo lockup="business" size="md" />
            <Logo lockup="business" size="sm" />
        </div>
    ),
}

/**
 * The descriptor is never hidden at a breakpoint. Both consumers had
 * hand-composed this with `hidden sm:inline`, so on a phone — merchant
 * mobile's primary form factor — the distinction vanished exactly where the
 * two products are easiest to confuse. `size` shrinks the whole lockup
 * instead.
 */
export const BusinessLockupAtAppBarSize: Story = {
    name: 'Business lockup, app-bar size',
    render: () => (
        <div className="w-[22rem] rounded-xl border border-[var(--border-subtle)] p-3 text-[var(--text-strong)]">
            <Logo lockup="business" size="md" />
        </div>
    ),
}
