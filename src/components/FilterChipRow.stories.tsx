import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { FilterChipRow, type FilterChipOption } from './FilterChipRow'

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
