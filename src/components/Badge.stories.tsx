import type { Meta, StoryObj } from '@storybook/react-vite'
import { Badge } from './Badge'
import { TrendingPill } from './TrendingPill'

/**
 * Badge — inline pill for status, category, and credibility markers.
 *
 * This story file showcases the **light theme** vocabulary (the
 * cream-canvas surface every Autara web app uses by default). The
 * pre-existing dark-theme variants (`default`, `primary`, `aqua`,
 * `lime`, `success`, `warning`, `destructive`, `pill`, `live`) are
 * still exported by the component for consumers that need them; new
 * stories for them are deferred to a future PR alongside the matching
 * dark-surface companions for `acid`, `new`, etc.
 *
 * Light variants in this pass were refreshed to drop the raw tailwind
 * `green-50 / yellow-50 / red-50` palette in favour of brand-aligned
 * ink (same grammar as `MetaChip`).
 */
const meta = {
    title: 'Atoms/Badge',
    component: Badge,
    parameters: { layout: 'centered' },
    argTypes: {
        variant: {
            control: { type: 'select' },
            options: [
                'light-default',
                'light-primary',
                'light-success',
                'light-warning',
                'light-destructive',
                'new',
            ],
        },
    },
    args: { children: 'Verified', variant: 'light-default' },
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

// ─── Editorial marker ──────────────────────────────────────────────
export const New: Story = {
    name: 'New — editorial marker (cream surface)',
    args: { variant: 'new', children: 'New' },
}

// ─── Vocabulary — every light variant on the cream canvas ──────────
export const LightVocabulary: Story = {
    name: 'Vocabulary — light theme',
    parameters: { layout: 'padded' },
    render: () => (
        <div className="flex max-w-xl flex-wrap gap-1.5 rounded-xl bg-[var(--background)] p-6 ring-1 ring-inset ring-[var(--border-subtle)]">
            <Badge variant="new">New</Badge>
            <Badge variant="light-default">15+ years</Badge>
            <Badge variant="light-primary">Highly rated</Badge>
            <Badge variant="light-success">Open today</Badge>
            <Badge variant="light-warning">Closing soon</Badge>
            <Badge variant="light-destructive">Closed</Badge>
        </div>
    ),
}

/** In context — Badge sits beside TrendingPill of the same `new`
 *  family on the cream surface. Proves they read as one editorial
 *  vocabulary. */
export const NewFamily: Story = {
    name: 'In context — Badge × TrendingPill (new family)',
    parameters: { layout: 'padded' },
    render: () => (
        <div className="space-y-3 rounded-xl bg-[var(--background)] p-6 ring-1 ring-inset ring-[var(--border-subtle)]">
            <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
                light surface
            </div>
            <div className="flex flex-wrap items-center gap-3">
                <Badge variant="new">New</Badge>
                <TrendingPill label="New" tone="new-light" />
            </div>
        </div>
    ),
}
