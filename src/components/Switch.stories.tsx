import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Switch } from './Switch'

/**
 * Switch — Radix switch primitive on the cream canvas.
 *
 * Unchecked track = `--surface-elevated` + hairline border. Checked
 * track = autara-purple. Thumb is a clean white pill with no drop
 * shadow.
 *
 * The `theme` prop is currently a no-op for source-level compat;
 * dark-surface companion is deferred.
 */
const meta: Meta<typeof Switch> = {
    title: 'Atoms/Switch',
    component: Switch,
    parameters: { layout: 'centered' },
}
export default meta
type Story = StoryObj<typeof Switch>

export const Unchecked: Story = {}

export const Checked: Story = {
    args: { defaultChecked: true },
}

export const Disabled: Story = {
    args: { disabled: true },
}

export const DisabledChecked: Story = {
    args: { disabled: true, defaultChecked: true },
}

// ─── Controlled + with label ───────────────────────────────────────
export const WithLabel: Story = {
    name: 'With label — controlled',
    parameters: { layout: 'padded' },
    render: () => {
        const Demo = () => {
            const [on, setOn] = useState(true)
            return (
                <label className="inline-flex cursor-pointer items-center gap-3">
                    <Switch checked={on} onCheckedChange={setOn} id="sms" />
                    <span className="text-sm text-[var(--text-strong)]">
                        Send me SMS reminders 24h before each booking
                    </span>
                </label>
            )
        }
        return <Demo />
    },
}

// ─── In context — settings row inside a Card surface ───────────────
export const InSettingsRow: Story = {
    name: 'In context — settings row',
    parameters: { layout: 'padded' },
    render: () => (
        <div className="max-w-md space-y-1 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] p-2">
            {[
                {
                    title: 'Accept new bookings',
                    desc: 'Show your services in customer search results.',
                    on: true,
                },
                {
                    title: 'Marketing emails',
                    desc: 'Tips, product updates, and seasonal campaigns.',
                    on: false,
                },
                {
                    title: 'Allow same-day requests',
                    desc: 'Bookings starting within the next 12 hours.',
                    on: true,
                },
            ].map((row) => (
                <label
                    key={row.title}
                    className="flex cursor-pointer items-start justify-between gap-4 rounded-xl px-3 py-3 hover:bg-[var(--surface-elevated)]"
                >
                    <div className="min-w-0">
                        <div className="text-sm font-medium text-[var(--text-strong)]">
                            {row.title}
                        </div>
                        <div className="mt-0.5 text-xs text-[var(--text-muted)]">
                            {row.desc}
                        </div>
                    </div>
                    <Switch defaultChecked={row.on} className="mt-0.5" />
                </label>
            ))}
        </div>
    ),
}
