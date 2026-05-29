import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { RadioGroup, RadioGroupItem } from './Radio'

/**
 * RadioGroup — Radix radio primitive on the cream canvas. Mirrors the
 * Checkbox grammar (hairline border, brand-purple checked accent).
 *
 * `theme` prop on the item is currently a no-op; dark-surface
 * companion deferred.
 */
const meta: Meta<typeof RadioGroup> = {
    title: 'Atoms/Radio',
    component: RadioGroup,
    parameters: { layout: 'padded' },
}
export default meta
type Story = StoryObj<typeof RadioGroup>

// ─── Default — three options, second pre-selected ──────────────────
export const Default: Story = {
    render: () => (
        <div className="max-w-sm">
            <RadioGroup defaultValue="standard" name="package">
                {[
                    {
                        v: 'express',
                        title: 'Express',
                        desc: '45 min · exterior only',
                    },
                    {
                        v: 'standard',
                        title: 'Standard',
                        desc: '90 min · exterior + interior',
                    },
                    {
                        v: 'premium',
                        title: 'Premium',
                        desc: '2.5 hrs · full detail + ceramic top-up',
                    },
                ].map((opt) => (
                    <label
                        key={opt.v}
                        className="flex cursor-pointer items-start gap-3 rounded-lg px-2 py-2 hover:bg-[var(--surface-elevated)]"
                    >
                        <RadioGroupItem
                            value={opt.v}
                            id={`pkg-${opt.v}`}
                            className="mt-[3px]"
                        />
                        <div className="min-w-0">
                            <div className="text-sm font-medium text-[var(--text-strong)]">
                                {opt.title}
                            </div>
                            <div className="text-xs text-[var(--text-muted)]">
                                {opt.desc}
                            </div>
                        </div>
                    </label>
                ))}
            </RadioGroup>
        </div>
    ),
}

// ─── Inline horizontal layout ──────────────────────────────────────
export const Inline: Story = {
    render: () => (
        <RadioGroup
            defaultValue="month"
            name="window"
            className="flex flex-row gap-4"
        >
            {[
                { v: 'week', label: 'This week' },
                { v: 'month', label: 'This month' },
                { v: 'quarter', label: 'This quarter' },
            ].map((opt) => (
                <label
                    key={opt.v}
                    className="inline-flex cursor-pointer items-center gap-2"
                >
                    <RadioGroupItem value={opt.v} id={`win-${opt.v}`} />
                    <span className="text-sm text-[var(--text-strong)]">
                        {opt.label}
                    </span>
                </label>
            ))}
        </RadioGroup>
    ),
}

// ─── Disabled option mid-group ─────────────────────────────────────
export const WithDisabledOption: Story = {
    render: () => (
        <div className="max-w-sm">
            <RadioGroup defaultValue="cream" name="paint">
                {[
                    { v: 'cream', label: 'Cream finish', disabled: false },
                    { v: 'pearl', label: 'Pearl finish (waitlist)', disabled: true },
                    { v: 'gloss', label: 'Gloss finish', disabled: false },
                ].map((opt) => (
                    <label
                        key={opt.v}
                        className={
                            'flex items-center gap-3 rounded-lg px-2 py-2 ' +
                            (opt.disabled
                                ? 'cursor-not-allowed text-[var(--text-subtle)]'
                                : 'cursor-pointer hover:bg-[var(--surface-elevated)] text-[var(--text-strong)]')
                        }
                    >
                        <RadioGroupItem
                            value={opt.v}
                            disabled={opt.disabled}
                            id={`paint-${opt.v}`}
                        />
                        <span className="text-sm">{opt.label}</span>
                    </label>
                ))}
            </RadioGroup>
        </div>
    ),
}

// ─── In context — controlled card-selection pattern ────────────────
export const InCardSelection: Story = {
    name: 'In context — card-selection pattern',
    render: () => {
        const Demo = () => {
            const [v, setV] = useState('standard')
            return (
                <RadioGroup
                    value={v}
                    onValueChange={setV}
                    name="package-cards"
                    className="grid max-w-2xl grid-cols-3 gap-3"
                >
                    {[
                        {
                            v: 'express',
                            title: 'Express',
                            price: '$79',
                            desc: '45 min · exterior only',
                        },
                        {
                            v: 'standard',
                            title: 'Standard',
                            price: '$129',
                            desc: '90 min · in + out',
                        },
                        {
                            v: 'premium',
                            title: 'Premium',
                            price: '$199',
                            desc: '2.5 hrs · full detail',
                        },
                    ].map((opt) => {
                        const active = v === opt.v
                        return (
                            <label
                                key={opt.v}
                                className={
                                    'cursor-pointer rounded-2xl border bg-[var(--surface)] p-4 transition-colors ' +
                                    (active
                                        ? 'border-[var(--color-autara-purple)]'
                                        : 'border-[var(--border-subtle)] hover:border-[var(--color-autara-purple)]/35')
                                }
                            >
                                <div className="mb-3 flex items-start justify-between gap-2">
                                    <div>
                                        <div className="text-sm font-medium text-[var(--text-strong)]">
                                            {opt.title}
                                        </div>
                                        <div className="text-xs text-[var(--text-muted)]">
                                            {opt.desc}
                                        </div>
                                    </div>
                                    <RadioGroupItem
                                        value={opt.v}
                                        id={`card-${opt.v}`}
                                    />
                                </div>
                                <div className="text-base font-medium text-[var(--text-strong)]">
                                    {opt.price}
                                </div>
                            </label>
                        )
                    })}
                </RadioGroup>
            )
        }
        return <Demo />
    },
}
