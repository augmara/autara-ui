import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Checkbox } from './Checkbox'

/**
 * Checkbox — Radix checkbox primitive on the cream canvas.
 *
 * Unchecked = `--surface` fill + hairline border. Hover lifts to a
 * brand-purple border. Checked = autara-purple fill + white Solar
 * Bold-style check.
 *
 * The `theme` prop is currently a no-op for source-level compat;
 * dark-surface companion deferred.
 */
const meta: Meta<typeof Checkbox> = {
    title: 'Atoms/Checkbox',
    component: Checkbox,
    parameters: { layout: 'centered' },
}
export default meta
type Story = StoryObj<typeof Checkbox>

export const Unchecked: Story = {}

export const Checked: Story = {
    args: { defaultChecked: true },
}

export const Indeterminate: Story = {
    args: { defaultChecked: 'indeterminate' },
}

export const Disabled: Story = {
    args: { disabled: true },
}

export const DisabledChecked: Story = {
    args: { disabled: true, defaultChecked: true },
}

// ─── With label — controlled ───────────────────────────────────────
export const WithLabel: Story = {
    name: 'With label — controlled',
    parameters: { layout: 'padded' },
    render: () => {
        const Demo = () => {
            const [agreed, setAgreed] = useState(false)
            return (
                <label className="inline-flex cursor-pointer items-start gap-3">
                    <Checkbox
                        checked={agreed}
                        onCheckedChange={(v) => setAgreed(v === true)}
                        className="mt-[2px]"
                        id="terms"
                    />
                    <span className="text-sm text-[var(--text-strong)]">
                        I agree to the{' '}
                        <span className="underline decoration-[var(--text-muted)] underline-offset-2">
                            Autara Merchant Terms
                        </span>{' '}
                        and acknowledge the platform fee policy.
                    </span>
                </label>
            )
        }
        return <Demo />
    },
}

// ─── In context — onboarding consent block ─────────────────────────
export const ConsentBlock: Story = {
    name: 'In context — onboarding consent block',
    parameters: { layout: 'padded' },
    render: () => {
        const Demo = () => {
            const [a, setA] = useState(true)
            const [b, setB] = useState(false)
            const [c, setC] = useState(false)
            return (
                <div className="max-w-md space-y-2 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] p-5">
                    <div className="mb-1 text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]">
                        Before you finish
                    </div>
                    {[
                        {
                            v: a,
                            set: setA,
                            label:
                                'I confirm the business details above are accurate.',
                        },
                        {
                            v: b,
                            set: setB,
                            label:
                                'I authorise Autara to verify my ABN with the Australian Business Register.',
                        },
                        {
                            v: c,
                            set: setC,
                            label:
                                'Send me product updates and best-practice tips once a month.',
                        },
                    ].map((row, i) => (
                        <label
                            key={i}
                            className="flex cursor-pointer items-start gap-3 rounded-lg px-2 py-2 hover:bg-[var(--surface-elevated)]"
                        >
                            <Checkbox
                                checked={row.v}
                                onCheckedChange={(val) => row.set(val === true)}
                                className="mt-[3px]"
                            />
                            <span className="text-sm text-[var(--text-strong)]">
                                {row.label}
                            </span>
                        </label>
                    ))}
                </div>
            )
        }
        return <Demo />
    },
}
