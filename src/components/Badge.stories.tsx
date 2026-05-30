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
                // marker tones
                'trending',
                'new',
                'new-light',
                'featured',
                // status tones
                'info',
                'success',
                'warning',
                'destructive',
                'neutral',
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
    args: { children: 'Verified', variant: 'light-default', shape: 'pill' },
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

// ─── Status tones — booking + availability state on cream ──────────
export const StatusTones: Story = {
    name: 'Vocabulary — status tones',
    parameters: { layout: 'padded' },
    render: () => (
        <div className="flex max-w-xl flex-wrap gap-2 rounded-xl bg-[var(--background)] p-6 ring-1 ring-inset ring-[var(--border-subtle)]">
            <Badge variant="info">In review</Badge>
            <Badge variant="success">Confirmed</Badge>
            <Badge variant="warning">Pending</Badge>
            <Badge variant="destructive">Cancelled</Badge>
            <Badge variant="neutral">Archived</Badge>
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
