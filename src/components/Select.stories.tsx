import type { Meta, StoryObj } from '@storybook/react-vite'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectSeparator,
    SelectTrigger,
    SelectValue,
} from './Select'

/**
 * Select — Radix select primitive on the Autara cream canvas.
 *
 * Trigger shares the `.field-input` grammar (44 high, hairline border,
 * 4 px brand-purple halo on focus). Content portals with a hairline
 * edge — no drop shadow, no backdrop blur. Items hover to a soft
 * `--surface-elevated`; the checked item carries a brand-purple tint
 * + Solar Bold check on the right.
 */
const meta: Meta = {
    title: 'Atoms/Select',
    parameters: { layout: 'padded' },
}
export default meta
type Story = StoryObj

const AU_STATES = [
    { value: 'nsw', label: 'New South Wales' },
    { value: 'vic', label: 'Victoria' },
    { value: 'qld', label: 'Queensland' },
    { value: 'wa', label: 'Western Australia' },
    { value: 'sa', label: 'South Australia' },
    { value: 'tas', label: 'Tasmania' },
    { value: 'act', label: 'ACT' },
    { value: 'nt', label: 'Northern Territory' },
]

// ─── Default — uncontrolled, no preselection ───────────────────────
export const Default: Story = {
    render: () => (
        <div className="max-w-sm">
            <Select>
                <SelectTrigger>
                    <SelectValue placeholder="Pick a state" />
                </SelectTrigger>
                <SelectContent>
                    {AU_STATES.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                            {s.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    ),
}

// ─── With preselected value ────────────────────────────────────────
export const Preselected: Story = {
    render: () => (
        <div className="max-w-sm">
            <Select defaultValue="vic">
                <SelectTrigger>
                    <SelectValue placeholder="Pick a state" />
                </SelectTrigger>
                <SelectContent>
                    {AU_STATES.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                            {s.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    ),
}

// ─── Disabled state ────────────────────────────────────────────────
export const Disabled: Story = {
    render: () => (
        <div className="max-w-sm">
            <Select disabled defaultValue="nsw">
                <SelectTrigger>
                    <SelectValue placeholder="Pick a state" />
                </SelectTrigger>
                <SelectContent>
                    {AU_STATES.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                            {s.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    ),
}

// ─── Invalid state — aria-invalid red ring ─────────────────────────
export const Invalid: Story = {
    name: 'Invalid — aria-invalid=true',
    render: () => (
        <div className="max-w-sm">
            <Select>
                <SelectTrigger aria-invalid="true">
                    <SelectValue placeholder="Pick a state" />
                </SelectTrigger>
                <SelectContent>
                    {AU_STATES.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                            {s.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    ),
}

// ─── Grouped — Label + Separator inside Content ────────────────────
export const Grouped: Story = {
    name: 'Grouped — Label + Separator',
    render: () => (
        <div className="max-w-sm">
            <Select>
                <SelectTrigger>
                    <SelectValue placeholder="Choose a service" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectLabel>Detail packages</SelectLabel>
                        <SelectItem value="express">
                            Express — 45 min
                        </SelectItem>
                        <SelectItem value="standard">
                            Standard — 90 min
                        </SelectItem>
                        <SelectItem value="premium">
                            Premium — 2.5 hrs
                        </SelectItem>
                    </SelectGroup>
                    <SelectSeparator />
                    <SelectGroup>
                        <SelectLabel>Add-ons</SelectLabel>
                        <SelectItem value="ceramic">Ceramic top-up</SelectItem>
                        <SelectItem value="headlight">
                            Headlight restoration
                        </SelectItem>
                        <SelectItem value="engine">Engine bay tidy</SelectItem>
                    </SelectGroup>
                </SelectContent>
            </Select>
        </div>
    ),
}

// ─── Long list — proves scroll behaviour ───────────────────────────
export const LongList: Story = {
    render: () => (
        <div className="max-w-sm">
            <Select>
                <SelectTrigger>
                    <SelectValue placeholder="Pick a timezone" />
                </SelectTrigger>
                <SelectContent>
                    {[
                        'Australia/Sydney',
                        'Australia/Melbourne',
                        'Australia/Brisbane',
                        'Australia/Adelaide',
                        'Australia/Perth',
                        'Australia/Hobart',
                        'Australia/Darwin',
                        'Pacific/Auckland',
                        'Pacific/Wellington',
                        'Europe/London',
                        'Europe/Dublin',
                        'Europe/Paris',
                        'Europe/Berlin',
                        'Asia/Singapore',
                        'Asia/Hong_Kong',
                        'Asia/Tokyo',
                        'America/Los_Angeles',
                        'America/New_York',
                    ].map((tz) => (
                        <SelectItem key={tz} value={tz}>
                            {tz}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    ),
}

// ─── In context — onboarding business-info form ────────────────────
export const InOnboardingForm: Story = {
    name: 'In context — onboarding business-info form',
    render: () => (
        <form className="max-w-md space-y-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] p-6">
            <div>
                <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]">
                    Step 2 of 5
                </div>
                <h3 className="mt-1 text-lg font-medium leading-tight text-[var(--text-strong)]">
                    Where do you operate from?
                </h3>
            </div>
            <label className="grid gap-1.5">
                <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]">
                    State
                </span>
                <Select defaultValue="nsw">
                    <SelectTrigger>
                        <SelectValue placeholder="Pick a state" />
                    </SelectTrigger>
                    <SelectContent>
                        {AU_STATES.map((s) => (
                            <SelectItem key={s.value} value={s.value}>
                                {s.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </label>
            <label className="grid gap-1.5">
                <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]">
                    Primary service area
                </span>
                <Select>
                    <SelectTrigger>
                        <SelectValue placeholder="Choose one" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="shop">
                            Customers come to my shop
                        </SelectItem>
                        <SelectItem value="mobile">
                            I drive to the customer (mobile)
                        </SelectItem>
                        <SelectItem value="hybrid">Both</SelectItem>
                    </SelectContent>
                </Select>
            </label>
        </form>
    ),
}
