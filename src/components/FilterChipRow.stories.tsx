import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { FilterChipRow, type FilterChipOption } from './FilterChipRow'

/**
 * FilterChipRow — the secondary filter on every filtered list in
 * merchant-mobile: booking status, inbox, service status, notifications.
 *
 * AUTM-974: the ACTIVE chip was already the solid ink capsule; the inactive
 * ones were hairline-bordered boxes sitting next to it. Rule 4 of the Autara
 * Glass direction bans outlines, and there is a second reason to lose them —
 * five outlined rectangles all draw themselves, which is exactly the attention
 * the one active chip is supposed to have. The inactive chip is now a quiet
 * `--surface-elevated` ground with muted ink and no edge.
 *
 * Check `BothThemes` and `FocusRing` below. Both are the stories a solid
 * emphasis fill puts at risk.
 */
const meta: Meta = {
    title: 'Molecules/FilterChipRow',
    parameters: { layout: 'padded' },
}
export default meta
type Story = StoryObj

const STATUS_OPTIONS: FilterChipOption<string | null>[] = [
    { value: null, label: 'All' },
    { value: 'REQUESTED', label: 'Pending' },
    { value: 'CONFIRMED', label: 'Confirmed' },
    { value: 'IN_PROGRESS', label: 'In progress' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' },
]

export const Default: Story = {
    render: () => {
        const [value, setValue] = useState<string | null>(null)
        return (
            <div className="w-[640px]">
                <FilterChipRow options={STATUS_OPTIONS} value={value} onChange={setValue} />
                <p className="mt-4 text-[12px] text-[var(--text-muted)]">
                    Selected: <strong>{String(value)}</strong>
                </p>
            </div>
        )
    },
}

export const ConfirmedActive: Story = {
    render: () => {
        const [value, setValue] = useState<string | null>('CONFIRMED')
        return (
            <div className="w-[640px]">
                <FilterChipRow options={STATUS_OPTIONS} value={value} onChange={setValue} />
            </div>
        )
    },
}

export const TwoOption: Story = {
    name: 'Two-option — Inbox tab',
    render: () => {
        const [tab, setTab] = useState<'all' | 'bookings'>('all')
        return (
            <div className="w-[320px]">
                <FilterChipRow<'all' | 'bookings'>
                    options={[
                        { value: 'all', label: 'All' },
                        { value: 'bookings', label: 'Bookings' },
                    ]}
                    value={tab}
                    onChange={setTab}
                />
            </div>
        )
    },
}

export const InToolbar: Story = {
    name: 'In context — under a SearchInput',
    render: () => {
        const [value, setValue] = useState<string | null>(null)
        return (
            <div className="w-[640px] space-y-3">
                <input
                    type="text"
                    placeholder="Search"
                    className="field-input w-full"
                />
                <FilterChipRow options={STATUS_OPTIONS} value={value} onChange={setValue} />
            </div>
        )
    },
}

export const BothThemes: Story = {
    name: 'In context — light and dark canvas',
    render: () => {
        const [light, setLight] = useState<string | null>('CONFIRMED')
        const [dark, setDark] = useState<string | null>('CONFIRMED')
        return (
            <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-3 rounded-autara-lg bg-[var(--background)] p-5">
                    <p className="text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]">
                        light
                    </p>
                    <FilterChipRow options={STATUS_OPTIONS} value={light} onChange={setLight} />
                </div>
                <div
                    data-theme="dark"
                    className="space-y-3 rounded-autara-lg bg-[var(--background)] p-5"
                >
                    <p className="text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]">
                        dark
                    </p>
                    <FilterChipRow options={STATUS_OPTIONS} value={dark} onChange={setDark} />
                </div>
            </div>
        )
    },
}

/**
 * Tab into the row and arrow across it. The indicator has to stay obvious on
 * the ACTIVE chip, which is the ink capsule — the case a translucent purple
 * ring drawn straight onto the fill fails at 1.8:1. It is now full-strength
 * `--accent` with a 2px offset band in the page canvas, so the band is what
 * separates ring from fill.
 */
export const FocusRing: Story = {
    name: 'A11y — focus ring on the solid active chip',
    render: () => {
        const [value, setValue] = useState<string | null>('CONFIRMED')
        return (
            <div className="w-[640px] space-y-3">
                <p className="text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]">
                    Tab in, then arrow across
                </p>
                <FilterChipRow options={STATUS_OPTIONS} value={value} onChange={setValue} />
            </div>
        )
    },
}
