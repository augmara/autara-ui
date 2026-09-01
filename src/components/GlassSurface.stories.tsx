import type { Meta, StoryObj } from '@storybook/react-vite'
import { GlassSurface, GradientGround } from './GlassSurface'
import { Badge } from './Badge'
import { Button } from './Button'
import { Input } from './Input'

/**
 * # GlassSurface
 *
 * The one glass material every other Autara surface composes. AUTM-948, for
 * the **Autara Glass** direction Don settled on 2026-09-01.
 *
 * Translucent fill + `backdrop-filter: blur() saturate()` + a **1px inset top
 * highlight**. The highlight is load-bearing — the `WithoutTheHighlight` story
 * below shows what the direction collapses to without it.
 *
 * **Glass is meaningless on a flat canvas.** Every story here renders on
 * `.gradient-ground`, which is why they look different from the rest of the
 * library. A glass panel on a white Storybook canvas is a bordered box, and
 * reviewing it there is how the previous `Card variant="glass"` shipped at
 * 1.001:1 for months.
 *
 * Flip the **Theme** toolbar. Dark is the primary expression.
 */
const meta = {
    title: 'Design System/Glass',
    component: GlassSurface,
    parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof GlassSurface>

export default meta
type Story = StoryObj<typeof meta>

/** Shared wrapper so every story sits on a real ground rather than a canvas. */
function Ground({
    children,
    className = '',
}: {
    children: React.ReactNode
    className?: string
}) {
    return (
        <GradientGround className={`min-h-[26rem] p-10 ${className}`}>
            {children}
        </GradientGround>
    )
}

export const Default: Story = {
    render: () => (
        <Ground>
            <GlassSurface className="max-w-md p-7">
                <p className="text-[0.6875rem] font-medium uppercase tracking-[0.22em] text-[var(--text-subtle)]">
                    Next booking
                </p>
                <h3 className="mt-2 text-xl font-bold text-[var(--text-strong)]">
                    Full interior and exterior detail
                </h3>
                <p className="mt-2 text-sm text-[var(--text-muted)]">
                    Saturday 14 September, 10:00 with Northside Mobile Detailing.
                    They come to you.
                </p>
            </GlassSurface>
        </Ground>
    ),
}

/**
 * `tone="strong"` for surfaces carrying **dense body text** — admin tables,
 * long booking lists, anything a user reads rather than scans. Less of the
 * ground comes through, so the ink has more to sit on.
 *
 * Admin's light-mode tables are the hardest case in the system. If glass
 * survives there it survives everywhere, and `strong` is what it survives on.
 */
export const Tones: Story = {
    name: 'Default vs strong',
    render: () => (
        <Ground>
            <div className="grid max-w-3xl gap-5 sm:grid-cols-2">
                <GlassSurface className="p-6">
                    <p className="text-sm font-medium text-[var(--text-strong)]">
                        tone=&quot;default&quot;
                    </p>
                    <p className="mt-2 text-sm text-[var(--text-muted)]">
                        Cards, panels, sheets. Scanned, not read.
                    </p>
                    <p className="mt-2 text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--text-subtle)]">
                        Smallest ink on the surface
                    </p>
                </GlassSurface>
                <GlassSurface tone="strong" className="p-6">
                    <p className="text-sm font-medium text-[var(--text-strong)]">
                        tone=&quot;strong&quot;
                    </p>
                    <p className="mt-2 text-sm text-[var(--text-muted)]">
                        Tables, long lists, dense forms. Read, not scanned.
                    </p>
                    <p className="mt-2 text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--text-subtle)]">
                        Smallest ink on the surface
                    </p>
                </GlassSurface>
            </div>
        </Ground>
    ),
}

/**
 * **The highlight is the direction.** Left panel is `.glass-surface`. Right
 * panel is identical with `box-shadow: none` — same fill, same blur, same
 * edge.
 *
 * The right one is a grey box. That single `inset 0 1px 0` is the difference
 * between "glass" and "a translucent div", which is why it is pinned by a
 * test rather than left to a review to catch.
 */
export const WithoutTheHighlight: Story = {
    name: 'Edge — the 1px highlight removed',
    render: () => (
        <Ground>
            <div className="grid max-w-3xl gap-5 sm:grid-cols-2">
                <GlassSurface className="p-6">
                    <p className="text-sm font-medium text-[var(--text-strong)]">
                        With the inset highlight
                    </p>
                    <p className="mt-2 text-sm text-[var(--text-muted)]">
                        Reads as a lit edge. This is glass.
                    </p>
                </GlassSurface>
                <GlassSurface className="p-6 shadow-none">
                    <p className="text-sm font-medium text-[var(--text-strong)]">
                        Highlight removed
                    </p>
                    <p className="mt-2 text-sm text-[var(--text-muted)]">
                        Same fill, same blur. Reads as grey.
                    </p>
                </GlassSurface>
            </div>
        </Ground>
    ),
}

/**
 * ## Performance — what to test on the iPad Pro 11"
 *
 * `backdrop-filter` is GPU work, **per surface, per frame**. A long booking
 * list is where it drops frames first, and that is a real-device test, not a
 * browser one. The Browser pane in particular throttles rAF, so it cannot
 * answer this question at all.
 *
 * **What blurs, after AUTM-948:**
 *
 * | Surface | Blurs? | Notes |
 * |---|---|---|
 * | `.glass-surface` / `GlassSurface` | yes | `blur={false}` opts out |
 * | `Card variant="glass"` (the default) | yes | composes `.glass-surface` |
 * | `Card variant="glass-flat"` / `"service"` | no | for list rows |
 * | `Card variant="surface"` / `"light"` | no | opaque |
 * | `.glass-card` | yes | v1.x alias, same material |
 * | `.nav-glass` | yes | one per app shell |
 * | `.field-input--glass` / `Input surface="glass"` | yes | opt-in only |
 * | `.service-card` | no | deliberately — it lives in lists |
 * | `Button variant="glass"`, `MetaChip tone="glass"` | no | small and numerous |
 * | `.merchant-form` | yes | pre-existing, marketing only |
 *
 * **How to count them on a real page**, in Safari Web Inspector against the
 * device:
 *
 * ```js
 * document.querySelectorAll('[data-glass="blur"]').length
 * ```
 *
 * `GlassSurface` stamps `data-glass="blur"` or `"flat"` so a device test can
 * find every blurring surface without knowing which component produced it.
 *
 * **The rule of thumb:** a handful of blurred surfaces per screen is fine;
 * one per row of a scrolling list is not. Reach for `blur={false}` /
 * `variant="glass-flat"` inside lists — at row density the frost was never
 * visible anyway.
 *
 * **Two more things this material brings**, both handled in `glass.css`:
 * `@supports` raises the fill where `backdrop-filter` is missing, and
 * `prefers-reduced-transparency: reduce` drops to the opaque surface. Neither
 * changes the contrast numbers, because those are measured on the composite
 * rather than on the blur.
 */
export const PerformanceNotes: Story = {
    name: 'Performance — blur inventory',
    render: () => (
        <Ground>
            <div className="max-w-2xl">
                <GlassSurface className="p-6">
                    <p className="text-[0.6875rem] font-medium uppercase tracking-[0.22em] text-[var(--text-subtle)]">
                        Blur inventory
                    </p>
                    <p className="mt-3 text-sm text-[var(--text-muted)]">
                        Read the docs panel for the full table and the
                        one-liner that counts blurring surfaces on a real
                        device. The two panels below are the same component
                        with the blur on and off — at this size the difference
                        is visible; at list-row size it is not, which is the
                        whole argument for <code>blur=&#123;false&#125;</code>{' '}
                        in lists.
                    </p>
                </GlassSurface>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <GlassSurface className="p-5">
                        <p className="text-sm font-medium text-[var(--text-strong)]">
                            blur (default)
                        </p>
                        <p className="mt-1 text-xs text-[var(--text-subtle)]">
                            data-glass=&quot;blur&quot;
                        </p>
                    </GlassSurface>
                    <GlassSurface blur={false} className="p-5">
                        <p className="text-sm font-medium text-[var(--text-strong)]">
                            blur=&#123;false&#125;
                        </p>
                        <p className="mt-1 text-xs text-[var(--text-subtle)]">
                            data-glass=&quot;flat&quot;
                        </p>
                    </GlassSurface>
                </div>
            </div>
        </Ground>
    ),
}

/**
 * Both themes side by side, so the pair can be judged without the toolbar.
 * Dark is the primary expression of this direction; the light ground stays
 * warm cream `#FBFAF6` and never goes clinical white.
 *
 * Note the fill model is not symmetric. Light glass is white at 0.80 and
 * lifts its ground; dark glass is `--surface` at 0.76 and **dims** its
 * ground. A dark panel that lifts toward a bright bloom is how the previous
 * implementation put `--text-subtle` at 2.73:1 over aqua.
 */
export const BothThemes: Story = {
    name: 'Both themes',
    parameters: { layout: 'fullscreen' },
    render: () => (
        <div className="grid sm:grid-cols-2">
            {(['light', 'dark'] as const).map((theme) => (
                <div key={theme} data-theme={theme}>
                    <GradientGround className="min-h-[24rem] p-8">
                        <p className="mb-4 text-[0.6875rem] font-medium uppercase tracking-[0.22em] text-[var(--text-subtle)]">
                            {theme}
                        </p>
                        <GlassSurface className="p-6">
                            <div className="flex items-start justify-between gap-3">
                                <h3 className="text-base font-bold text-[var(--text-strong)]">
                                    Northside Mobile Detailing
                                </h3>
                                <Badge variant="flight">On the way</Badge>
                            </div>
                            <p className="mt-2 text-sm text-[var(--text-muted)]">
                                Arriving 10:00. Two-hour minimum, comes to you
                                across the inner north.
                            </p>
                            <p className="mt-2 text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--text-subtle)]">
                                Deposit paid $48.00
                            </p>
                            <div className="mt-5 flex gap-2">
                                <Button size="sm">Track</Button>
                                <Button variant="glass" size="sm">
                                    Message
                                </Button>
                            </div>
                        </GlassSurface>
                    </GradientGround>
                </div>
            ))}
        </div>
    ),
}

/**
 * In context — a merchant dashboard header, which is the shape that made the
 * direction necessary. Every rule is doing something visible here:
 *
 * - **Rule 1** — the only skewed things on screen are the two status pills.
 *   The buttons, the panel, the search field and the avatar are all normal
 *   geometry.
 * - **Rule 3** — the status fills are solid, not tinted, even against glass.
 * - **Rule 4** — purple ACTS (the primary button), aqua is IN FLIGHT (the job
 *   running now), lime is DONE and money-in (today's takings). One accent per
 *   zone; aqua and lime do not compete inside the same block.
 * - **Rule 6** — nothing casts a shadow. The depth is blur and one 1px edge.
 */
export const InContextDashboard: Story = {
    name: 'In context — merchant dashboard',
    render: () => (
        <Ground className="min-h-[34rem]">
            <div className="mx-auto max-w-4xl">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="text-[0.6875rem] font-medium uppercase tracking-[0.22em] text-[var(--text-subtle)]">
                            Today
                        </p>
                        <h2 className="text-2xl font-bold text-[var(--text-strong)]">
                            Monday 1 September
                        </h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <Input
                            surface="glass"
                            placeholder="Find a booking"
                            aria-label="Find a booking"
                            className="w-56"
                            data-testid="dashboard-search-input"
                        />
                        <Button data-testid="dashboard-new-booking">
                            New booking
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                    <GlassSurface className="p-5">
                        <p className="text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-[var(--text-subtle)]">
                            Earned today
                        </p>
                        <p className="mt-1 text-2xl font-bold text-[var(--money)]">
                            $612.00
                        </p>
                        <p className="mt-1 text-xs text-[var(--text-muted)]">
                            Four jobs settled
                        </p>
                    </GlassSurface>
                    <GlassSurface className="p-5">
                        <p className="text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-[var(--text-subtle)]">
                            Running now
                        </p>
                        <p className="mt-1 text-2xl font-bold text-[var(--flight)]">
                            1 job
                        </p>
                        <p className="mt-1 text-xs text-[var(--text-muted)]">
                            Started 09:40, due 11:10
                        </p>
                    </GlassSurface>
                    <GlassSurface className="p-5">
                        <p className="text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-[var(--text-subtle)]">
                            Waiting on you
                        </p>
                        <p className="mt-1 text-2xl font-bold text-[var(--act)]">
                            2 requests
                        </p>
                        <p className="mt-1 text-xs text-[var(--text-muted)]">
                            Oldest sent 40 minutes ago
                        </p>
                    </GlassSurface>
                </div>

                <GlassSurface tone="strong" className="mt-4 overflow-hidden">
                    <p className="border-b border-[var(--glass-edge)] px-5 py-3 text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-[var(--text-subtle)]">
                        Schedule
                    </p>
                    {[
                        {
                            time: '09:40',
                            name: 'Priya N.',
                            job: 'Full detail · Mazda CX-5',
                            tone: 'flight' as const,
                            state: 'In progress',
                        },
                        {
                            time: '12:30',
                            name: 'Tom A.',
                            job: 'Interior only · Hilux',
                            tone: 'money' as const,
                            state: 'Paid',
                        },
                    ].map((row) => (
                        <div
                            key={row.time}
                            className="flex items-center gap-4 border-b border-[var(--glass-edge)] px-5 py-4 last:border-b-0"
                        >
                            <span className="w-14 shrink-0 text-sm font-medium text-[var(--text-strong)]">
                                {row.time}
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-[var(--text-strong)]">
                                    {row.name}
                                </p>
                                <p className="truncate text-xs text-[var(--text-muted)]">
                                    {row.job}
                                </p>
                            </div>
                            <Badge variant={row.tone}>{row.state}</Badge>
                        </div>
                    ))}
                </GlassSurface>
            </div>
        </Ground>
    ),
}
