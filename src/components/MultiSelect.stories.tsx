import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { MultiSelect, type MultiSelectOption } from './MultiSelect'

/**
 * MultiSelect — token-style multi-value picker on cream.
 *
 * Container shares the `.field-input` grammar (hairline border, 4 px
 * brand-purple halo on focus-within). Chips reuse the brand-tinted
 * MetaChip grammar. Free-text search filters as the user types,
 * Backspace removes the last chip, Enter selects the top result.
 *
 * `theme` prop accepted as a no-op for source-level compatibility;
 * dark companion deferred.
 */
const meta: Meta<typeof MultiSelect> = {
    title: 'Atoms/MultiSelect',
    component: MultiSelect,
    parameters: { layout: 'padded' },
}
export default meta
type Story = StoryObj<typeof MultiSelect>

const SERVICE_AREAS: MultiSelectOption[] = [
    { value: 'sydney', label: 'Sydney' },
    { value: 'parramatta', label: 'Parramatta' },
    { value: 'bondi', label: 'Bondi' },
    { value: 'manly', label: 'Manly' },
    { value: 'cronulla', label: 'Cronulla' },
    { value: 'newtown', label: 'Newtown' },
    { value: 'chatswood', label: 'Chatswood' },
    { value: 'hornsby', label: 'Hornsby' },
    { value: 'liverpool', label: 'Liverpool' },
    { value: 'penrith', label: 'Penrith' },
]

// ─── Default — empty, click to open ────────────────────────────────
export const Default: Story = {
    render: () => {
        const Demo = () => {
            const [value, setValue] = useState<string[]>([])
            return (
                <div className="max-w-md">
                    <MultiSelect
                        options={SERVICE_AREAS}
                        value={value}
                        onChange={setValue}
                        placeholder="Add service areas…"
                    />
                </div>
            )
        }
        return <Demo />
    },
}

// ─── Preselected — start with two chips ────────────────────────────
export const Preselected: Story = {
    render: () => {
        const Demo = () => {
            const [value, setValue] = useState<string[]>(['sydney', 'bondi'])
            return (
                <div className="max-w-md">
                    <MultiSelect
                        options={SERVICE_AREAS}
                        value={value}
                        onChange={setValue}
                        placeholder="Add service areas…"
                    />
                </div>
            )
        }
        return <Demo />
    },
}

// ─── Disabled state ────────────────────────────────────────────────
export const Disabled: Story = {
    render: () => (
        <div className="max-w-md">
            <MultiSelect
                options={SERVICE_AREAS}
                value={['sydney', 'parramatta']}
                disabled
                placeholder="Locked"
            />
        </div>
    ),
}

// ─── Invalid state — aria-invalid red ring ─────────────────────────
export const Invalid: Story = {
    name: 'Invalid — aria-invalid=true',
    render: () => {
        const Demo = () => {
            const [value, setValue] = useState<string[]>([])
            return (
                <div className="max-w-md">
                    <MultiSelect
                        options={SERVICE_AREAS}
                        value={value}
                        onChange={setValue}
                        placeholder="Pick at least one area"
                        aria-invalid
                    />
                </div>
            )
        }
        return <Demo />
    },
}

// ─── Long list — proves filter + scroll behaviour ──────────────────
export const LongList: Story = {
    name: 'Long list — type to filter',
    render: () => {
        const big = [
            ...SERVICE_AREAS,
            { value: 'wollongong', label: 'Wollongong' },
            { value: 'newcastle', label: 'Newcastle' },
            { value: 'gosford', label: 'Gosford' },
            { value: 'campbelltown', label: 'Campbelltown' },
            { value: 'blacktown', label: 'Blacktown' },
            { value: 'brisbane', label: 'Brisbane' },
            { value: 'melbourne', label: 'Melbourne' },
            { value: 'perth', label: 'Perth' },
            { value: 'adelaide', label: 'Adelaide' },
            { value: 'hobart', label: 'Hobart' },
            { value: 'canberra', label: 'Canberra' },
            { value: 'darwin', label: 'Darwin' },
        ]
        const Demo = () => {
            const [value, setValue] = useState<string[]>([])
            return (
                <div className="max-w-md">
                    <MultiSelect
                        options={big}
                        value={value}
                        onChange={setValue}
                        placeholder="Type to filter"
                    />
                    <p className="mt-2 text-xs text-[var(--text-muted)]">
                        Hits Enter to select the top match. Backspace on an
                        empty input removes the last chip.
                    </p>
                </div>
            )
        }
        return <Demo />
    },
}

// ─── In context — onboarding service-areas panel ──────────────────
export const InOnboardingForm: Story = {
    name: 'In context — onboarding service-areas',
    render: () => {
        const Demo = () => {
            const [value, setValue] = useState<string[]>([
                'sydney',
                'bondi',
                'manly',
            ])
            return (
                <form className="max-w-md space-y-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] p-6">
                    <div>
                        <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]">
                            Step 3 of 5
                        </div>
                        <h3 className="mt-1 text-lg font-medium leading-tight text-[var(--text-strong)]">
                            Where will you operate?
                        </h3>
                        <p className="mt-1 text-sm text-[var(--text-muted)]">
                            Add every suburb you&apos;re happy to drive to.
                            Customers searching from those areas see your
                            profile first.
                        </p>
                    </div>
                    <label className="grid gap-1.5">
                        <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]">
                            Service areas
                        </span>
                        <MultiSelect
                            options={SERVICE_AREAS}
                            value={value}
                            onChange={setValue}
                            placeholder="Add a suburb"
                        />
                        <span className="text-xs text-[var(--text-muted)]">
                            {value.length === 0
                                ? 'Pick at least one suburb to continue.'
                                : `${value.length} area${value.length === 1 ? '' : 's'} selected.`}
                        </span>
                    </label>
                </form>
            )
        }
        return <Demo />
    },
}
