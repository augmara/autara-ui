import type { Meta, StoryObj } from '@storybook/react-vite'
import { Badge } from './Badge'

/**
 * Badge — inline pill for status, category, and credibility markers.
 *
 * AUTAA-UI-006 folded the standalone `TrendingPill` into Badge as a
 * `shape` variant:
 *
 *   - `pill` (default) — the original capsule, rounded-full.
 *   - `parallelogram` — the editorial tilted slab; wrapper skews
 *     -12deg, the children counter-skew so the label sits upright.
 *
 * Marker tones (`trending` / `new` / `new-light` / `featured`) and
 * status tones (`info` / `success` / `warning` / `destructive` /
 * `neutral`) were pulled across at the same time. The legacy palette
 * (`default`, `primary`, `light-*` etc.) is still exported for
 * backward compatibility — prefer the marker/status vocab for new
 * code.
 */
const meta = {
    title: 'Atoms/Badge',
    component: Badge,
    parameters: { layout: 'centered' },
    argTypes: {
        variant: {
            control: { type: 'select' },
            options: [
                // default
                'default',
                // marker tones — the retired `trending` / `new` /
                // `new-light` / `featured` names were still listed here
                // long after v1.2.0 collapsed them into three accents,
                // so the control offered variants that render nothing.
                'purple',
                'aqua',
                'lime',
                // status tones
                'info',
                'success',
                'warning',
                'destructive',
                'neutral',
                // legacy dark
                'dark-default',
                'dark-aqua',
                'dark-lime',
                'primary',
                'live',
                // legacy light
                'light-default',
                'light-primary',
                'light-success',
                'light-warning',
                'light-destructive',
            ],
        },
        shape: {
            control: { type: 'radio' },
            options: ['pill', 'parallelogram'],
        },
    },
    args: { children: 'Verified', shape: 'pill' },
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

// ─── Light theme variants (cream canvas) ───────────────────────────
export const LightDefault: Story = {
    args: { variant: 'light-default', children: '15+ years' },
}
export const LightPrimary: Story = {
    args: { variant: 'light-primary', children: 'Highly rated' },
}
export const LightSuccess: Story = {
    args: { variant: 'light-success', children: 'Open today' },
}
export const LightWarning: Story = {
    args: { variant: 'light-warning', children: 'Closing soon' },
}
export const LightDestructive: Story = {
    args: { variant: 'light-destructive', children: 'Closed' },
}

// ─── Marker tones — parallelogram (corner-of-card use case) ────────
// Three Autara accent colors. The label is consumer-supplied — the
// same `purple` tone might say "FEATURED" on one rail and "VERIFIED"
// on another. Stories below show one canonical label per tone.
export const MarkerPurple: Story = {
    name: 'Marker — purple (parallelogram)',
    args: { variant: 'purple', shape: 'parallelogram', children: 'Featured' },
}
export const MarkerAqua: Story = {
    name: 'Marker — aqua (parallelogram)',
    args: { variant: 'aqua', shape: 'parallelogram', children: 'New' },
}
export const MarkerLime: Story = {
    name: 'Marker — lime (parallelogram)',
    args: { variant: 'lime', shape: 'parallelogram', children: 'Trending' },
}

// ─── Shape comparison — same tone, different silhouette ────────────
export const ShapeComparison: Story = {
    name: 'Shape — pill vs parallelogram',
    parameters: { layout: 'padded' },
    render: () => (
        <div className="space-y-6 rounded-xl bg-[var(--background)] p-6 ring-1 ring-inset ring-[var(--border-subtle)]">
            <div>
                <div className="mb-2 text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
                    pill
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <Badge variant="purple">Featured</Badge>
                    <Badge variant="aqua">New</Badge>
                    <Badge variant="lime">Trending</Badge>
                </div>
            </div>
            <div>
                <div className="mb-2 text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
                    parallelogram (marketing default)
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <Badge variant="purple" shape="parallelogram">
                        Featured
                    </Badge>
                    <Badge variant="aqua" shape="parallelogram">
                        New
                    </Badge>
                    <Badge variant="lime" shape="parallelogram">
                        Trending
                    </Badge>
                </div>
            </div>
        </div>
    ),
}

// ─── Status tones — SOLID, booking + availability state (AUTM-211) ─
// Solid semantic fills in both shapes. Pill = standalone status; the
// parallelogram row is the preferred Autara silhouette for status pills
// on a card corner / row.
export const StatusTones: Story = {
    name: 'Vocabulary — status tones (solid)',
    parameters: { layout: 'padded' },
    render: () => (
        <div className="flex max-w-xl flex-col gap-4 rounded-xl bg-[var(--background)] p-6 ring-1 ring-inset ring-[var(--border-subtle)]">
            <div className="flex flex-wrap gap-2">
                <Badge variant="info">In review</Badge>
                <Badge variant="success">Confirmed</Badge>
                <Badge variant="warning">Pending</Badge>
                <Badge variant="destructive">Cancelled</Badge>
                <Badge variant="neutral">Archived</Badge>
            </div>
            <div className="flex flex-wrap gap-2.5">
                <Badge variant="info" shape="parallelogram">In review</Badge>
                <Badge variant="success" shape="parallelogram">Confirmed</Badge>
                <Badge variant="warning" shape="parallelogram">Pending</Badge>
                <Badge variant="destructive" shape="parallelogram">Cancelled</Badge>
                <Badge variant="neutral" shape="parallelogram">Archived</Badge>
            </div>
        </div>
    ),
}

// ─── Vocabulary — every light variant on the cream canvas ──────────
export const LightVocabulary: Story = {
    name: 'Vocabulary — legacy light theme',
    parameters: { layout: 'padded' },
    render: () => (
        <div className="flex max-w-xl flex-wrap gap-1.5 rounded-xl bg-[var(--background)] p-6 ring-1 ring-inset ring-[var(--border-subtle)]">
            <Badge variant="light-default">15+ years</Badge>
            <Badge variant="light-primary">Highly rated</Badge>
            <Badge variant="light-success">Open today</Badge>
            <Badge variant="light-warning">Closing soon</Badge>
            <Badge variant="light-destructive">Closed</Badge>
        </div>
    ),
}

// ─── The bare default (AUTM-934) ───────────────────────────────────
/**
 * `<Badge>` with no `variant`. This is the story that did not exist,
 * which is how the default went unnoticed: the meta `args` pinned
 * `light-default`, so every control-driven story rendered a variant
 * nobody was actually getting by accident.
 *
 * Until AUTM-934 this measured 1.03:1 against the cream canvas —
 * `text-white/60` on `bg-white/[0.04]`. Flip the Storybook theme
 * toolbar: it now reads in both.
 */
export const BareDefault: Story = {
    name: 'Default — no variant passed',
    parameters: { layout: 'padded' },
    render: () => (
        <div className="flex max-w-xl flex-wrap items-center gap-3 rounded-xl bg-[var(--background)] p-6 ring-1 ring-inset ring-[var(--border-subtle)]">
            <Badge>Verified</Badge>
            <Badge shape="pill">Verified</Badge>
            <Badge>Mobile detailing</Badge>
        </div>
    ),
}

/**
 * Edge case — a long label, and a label alongside the tones it sits
 * next to in a real row. The parallelogram skew is what breaks first
 * when a label runs long, so it is worth looking at.
 */
export const LongLabel: Story = {
    name: 'Edge — long label beside status tones',
    parameters: { layout: 'padded' },
    render: () => (
        <div className="flex max-w-sm flex-wrap items-center gap-2 rounded-xl bg-[var(--background)] p-6 ring-1 ring-inset ring-[var(--border-subtle)]">
            <Badge>Interior and exterior full detail</Badge>
            <Badge variant="success">Confirmed</Badge>
            <Badge variant="warning">Pending</Badge>
        </div>
    ),
}

/**
 * In context — a marketplace card corner, which is where Badge earns
 * its keep. The default neutral carries the category, a status tone
 * carries the state.
 */
export const InCardContext: Story = {
    name: 'In context — marketplace card',
    parameters: { layout: 'padded' },
    render: () => (
        <div className="max-w-sm rounded-autara-lg border border-[var(--border-subtle)] bg-[var(--surface)] p-5">
            <div className="mb-3 flex items-start justify-between gap-3">
                <h3 className="text-[0.9375rem] font-bold text-[var(--text-strong)]">
                    Northside Mobile Detailing
                </h3>
                <Badge variant="success">Open now</Badge>
            </div>
            <p className="mb-4 text-sm text-[var(--text-muted)]">
                Comes to you across the inner north. Two-hour minimum.
            </p>
            <div className="flex flex-wrap gap-2">
                <Badge>Mobile</Badge>
                <Badge>Interior</Badge>
                <Badge>Ceramic coating</Badge>
            </div>
        </div>
    ),
}
