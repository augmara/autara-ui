import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { SearchInput } from './SearchInput'

const meta: Meta<typeof SearchInput> = {
    title: 'Atoms/SearchInput',
    component: SearchInput,
    parameters: { layout: 'padded' },
}
export default meta
type Story = StoryObj<typeof SearchInput>

export const Default: Story = {
    render: () => {
        const [q, setQ] = useState('')
        return (
            <div className="w-[420px]">
                <SearchInput
                    placeholder="Search customer, service or vehicle"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                />
            </div>
        )
    },
}

export const WithValue: Story = {
    render: () => {
        const [q, setQ] = useState('ceramic')
        return (
            <div className="w-[420px]">
                <SearchInput
                    placeholder="Search services"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                />
            </div>
        )
    },
}

export const InToolbar: Story = {
    name: 'In context — list toolbar',
    render: () => {
        const [q, setQ] = useState('')
        return (
            <div className="w-[640px] space-y-3">
                <SearchInput
                    placeholder="Search customer, service or vehicle"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                />
                <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
                    {q ? `Filtering by "${q}"` : 'No filter active'}
                </div>
            </div>
        )
    },
}
