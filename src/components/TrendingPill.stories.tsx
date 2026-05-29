import type { Meta, StoryObj } from '@storybook/react-vite'
import { TrendingPill } from './TrendingPill'

const TrendingFlameIcon = () => (
    <svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor" aria-hidden>
        <path d="M13.5 0.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z" />
    </svg>
)

const DotIcon = ({ color }: { color: string }) => (
    <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${color}`} />
)

const meta: Meta<typeof TrendingPill> = {
    title: 'Marketing/TrendingPill',
    component: TrendingPill,
    args: {
        label: 'Trending',
    },
    parameters: {
        layout: 'centered',
    },
}
export default meta
type Story = StoryObj<typeof TrendingPill>

export const Default: Story = {}

// ─── Marker tones (v1.0) — corner markers on hero imagery ──────────

export const TrendingTone: Story = {
    args: { label: 'Trending', tone: 'trending', icon: <TrendingFlameIcon /> },
}

export const NewTone: Story = {
    name: 'Tone — new (dark theme — lime on ink)',
    args: { label: 'New', tone: 'new' },
}

export const NewLightTone: Story = {
    name: 'Tone — new-light (light theme — ink on lime)',
    args: { label: 'New', tone: 'new-light' },
}

export const FeaturedTone: Story = {
    args: { label: 'Featured', tone: 'featured' },
}

export const PillFallback: Story = {
    name: 'Shape — pill (legacy fallback)',
    args: { label: 'Trending', shape: 'pill', icon: <TrendingFlameIcon /> },
}

export const Sizes: Story = {
    render: () => (
        <div className="flex items-center gap-3">
            <TrendingPill label="Trending" size="sm" />
            <TrendingPill label="Trending" size="md" />
            <TrendingPill label="Trending" size="lg" />
        </div>
    ),
}

export const MarkerTones: Story = {
    name: 'Marker tones — all four',
    render: () => (
        <div className="flex items-center gap-3">
            <TrendingPill label="Trending" tone="trending" icon={<TrendingFlameIcon />} />
            <TrendingPill label="New" tone="new" />
            <TrendingPill label="New" tone="new-light" />
            <TrendingPill label="Featured" tone="featured" />
        </div>
    ),
}

// ─── Status tones (v1.3+) — booking / availability state on cream ──

export const StatusInfo: Story = {
    name: 'Status — info (booking confirmed / in progress)',
    args: { label: 'Confirmed', tone: 'info' },
}

export const StatusSuccess: Story = {
    name: 'Status — success (open / completed)',
    args: { label: 'Completed', tone: 'success' },
}

export const StatusWarning: Story = {
    name: 'Status — warning (pending / paused)',
    args: { label: 'Pending', tone: 'warning' },
}

export const StatusDestructive: Story = {
    name: 'Status — destructive (cancelled / failed)',
    args: { label: 'Cancelled', tone: 'destructive' },
}

export const StatusNeutral: Story = {
    name: 'Status — neutral (no-show / unknown)',
    args: { label: 'No-show', tone: 'neutral' },
}

export const StatusTones: Story = {
    name: 'Status tones — all five',
    render: () => (
        <div className="flex flex-wrap items-center gap-3">
            <TrendingPill label="Confirmed" tone="info" />
            <TrendingPill label="Completed" tone="success" />
            <TrendingPill label="Pending" tone="warning" />
            <TrendingPill label="Cancelled" tone="destructive" />
            <TrendingPill label="No-show" tone="neutral" />
        </div>
    ),
}

// ─── Status tones with a leading dot — open/paused availability ────

export const AvailabilityOpen: Story = {
    name: 'Availability — Open · accepting bookings',
    args: {
        label: 'Open · accepting bookings',
        tone: 'success',
        icon: <DotIcon color="bg-[#3a6b14]" />,
    },
}

export const AvailabilityPaused: Story = {
    name: 'Availability — Paused',
    args: {
        label: 'Paused',
        tone: 'warning',
        icon: <DotIcon color="bg-[var(--color-autara-warning-text)]" />,
    },
}

/**
 * `new-light` (ink on lime) — the cream-surface marker. Pairs with
 * `Badge variant="new"`.
 */
export const NewLightOnCream: Story = {
    name: 'New-light — on cream surface',
    parameters: { layout: 'padded' },
    render: () => (
        <div className="flex items-center gap-3 rounded-xl bg-[var(--background)] p-6 ring-1 ring-inset ring-[var(--border-subtle)]">
            <TrendingPill label="New" tone="new-light" />
            <span className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                on cream surface
            </span>
        </div>
    ),
}

// In-context — on a hero image, matching MerchantCard's left-3/top-3 placement.
export const OnHeroImage: Story = {
    name: 'In context — on hero image',
    parameters: { layout: 'padded' },
    render: () => (
        <div className="relative h-56 w-72 overflow-hidden rounded-2xl bg-[var(--surface-warm)]">
            <img
                src="https://images.unsplash.com/photo-1611016186353-9af58c69a533?w=400&q=80"
                alt=""
                className="h-full w-full object-cover"
            />
            <TrendingPill
                label="Trending"
                tone="trending"
                icon={<TrendingFlameIcon />}
                className="absolute left-3 top-3"
            />
        </div>
    ),
}

// In-context — booking row showing status pills in mixed-status list.
export const InBookingRow: Story = {
    name: 'In context — booking list row',
    parameters: { layout: 'padded' },
    render: () => (
        <div className="w-[460px] space-y-2">
            {[
                {
                    time: '09:00',
                    service: 'Premium wash',
                    customer: 'Sarah Chen · Bondi',
                    tone: 'info' as const,
                    label: 'Confirmed',
                },
                {
                    time: '10:30',
                    service: 'Ceramic coating',
                    customer: 'Marcus Lee · Surry Hills',
                    tone: 'warning' as const,
                    label: 'Pending',
                },
                {
                    time: '13:00',
                    service: 'Interior detail',
                    customer: 'Priya Patel · Newtown',
                    tone: 'success' as const,
                    label: 'Completed',
                },
                {
                    time: '15:00',
                    service: 'Engine bay',
                    customer: 'Tom Briggs · Paddington',
                    tone: 'destructive' as const,
                    label: 'Cancelled',
                },
            ].map((row) => (
                <div
                    key={row.time}
                    className="flex items-center gap-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] p-4"
                >
                    <div className="w-[64px] shrink-0 border-r border-[var(--border-subtle)] pr-3">
                        <p className="text-[15px] font-bold tabular-nums text-[var(--text-strong)]">
                            {row.time}
                        </p>
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-[14px] font-semibold text-[var(--text-strong)]">
                            {row.service}
                        </p>
                        <p className="mt-0.5 truncate text-[12px] text-[var(--text-muted)]">
                            {row.customer}
                        </p>
                    </div>
                    <TrendingPill label={row.label} tone={row.tone} />
                </div>
            ))}
        </div>
    ),
}
