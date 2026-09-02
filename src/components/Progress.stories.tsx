import type { Meta, StoryObj } from '@storybook/react-vite'
import { Progress } from './Progress'

/**
 * Progress — a determinate bar: a track that says "out of what", and a filled
 * indicator that says "this far". Both halves have to be visible or the
 * control is a purple stub floating in space.
 *
 * ─── AUTM-975: why this file exists now ─────────────────────────────────
 *
 * `theme` defaulted to `'dark'`, and that branch paints the track
 * `bg-white/[0.1]` — 10% white over the near-white canvas. A bare
 * `<Progress value={40} />` therefore rendered its indicator and nothing else:
 * the total silently vanished. Nothing in the library or in any consumer
 * imports `Progress`, which is the only reason it was never on screen, and a
 * trap everybody routes around files no bug reports.
 *
 * The default is now the themed branch. Read `'light'` as "tracks the theme",
 * not as "light mode" — `'dark'` is the static ink opt-in for a photo or
 * marketing surface, and the tokens handle the actual theme either way. The
 * value names are published API, so they are not being renamed for clarity.
 *
 * ─── One thing this story does not hide ─────────────────────────────────
 *
 * `--surface-elevated` is roughly 1.06:1 from `--surface` in light, so on a
 * white card the track is faint even now. That is the token ladder, not the
 * default, so it is out of scope here — `OnSurfaces` shows it honestly rather
 * than staging every story on the one ground where it reads best.
 */
const meta: Meta<typeof Progress> = {
    title: 'Atoms/Progress',
    component: Progress,
    parameters: { layout: 'padded' },
    argTypes: {
        value: { control: { type: 'range', min: 0, max: 100, step: 1 } },
    },
}
export default meta
type Story = StoryObj<typeof Progress>

export const Default: Story = {
    name: 'Default — no theme prop',
    args: { value: 40 },
    render: (args) => (
        <div className="max-w-md">
            <Progress {...args} />
        </div>
    ),
}

/**
 * The range, including both ends. Zero has to still show a track — that is the
 * state where the missing track was invisible AND indistinguishable from a
 * component that had not rendered.
 */
export const Range: Story = {
    name: 'Range — 0 · 25 · 50 · 75 · 100',
    render: () => (
        <div className="max-w-md space-y-4">
            {[0, 25, 50, 75, 100].map((value) => (
                <div key={value} className="space-y-1.5">
                    <p className="text-xs text-[var(--text-muted)]">{value}%</p>
                    <Progress value={value} />
                </div>
            ))}
        </div>
    ),
}

/**
 * Edge — `value` is optional on the underlying Radix root, and an omitted or
 * out-of-range value must not render a bar wider than its track. The component
 * treats a missing value as 0.
 */
export const MissingAndOutOfRange: Story = {
    name: 'Edge — no value, and a value past 100',
    render: () => (
        <div className="max-w-md space-y-4">
            {[
                { label: 'value omitted', node: <Progress /> },
                { label: 'value={-10}', node: <Progress value={-10} /> },
                { label: 'value={140}', node: <Progress value={140} /> },
            ].map((row) => (
                <div key={row.label} className="space-y-1.5">
                    <p className="text-xs text-[var(--text-muted)]">{row.label}</p>
                    {row.node}
                </div>
            ))}
        </div>
    ),
}

/**
 * The grounds a progress bar actually sits on, in both themes, plus the
 * `theme="dark"` opt-in on cream — which is what the old default silently
 * produced everywhere.
 *
 * The middle column is the honest one: `--surface-elevated` on `--surface` is
 * a ~1.06:1 step in light, so the track is faint on a white card. It is
 * legible on the canvas and on a glass panel, and it is a token-ladder
 * question rather than a default-selection one.
 */
export const OnSurfaces: Story = {
    name: 'In context — both themes, on canvas and on a card',
    render: () => (
        <div className="grid gap-6 lg:grid-cols-3">
            {[
                { label: 'light', theme: undefined },
                { label: 'dark', theme: 'dark' as const },
            ].map((col) => (
                <div
                    key={col.label}
                    data-theme={col.theme}
                    className="space-y-4 rounded-autara-lg bg-[var(--background)] p-5"
                >
                    <p className="text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]">
                        {col.label} · on canvas
                    </p>
                    <Progress value={62} />
                    <p className="text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]">
                        {col.label} · on a card
                    </p>
                    <div className="rounded-autara-lg bg-[var(--surface)] p-4">
                        <Progress value={62} />
                    </div>
                </div>
            ))}
            <div className="space-y-4 rounded-autara-lg bg-[var(--ink)] p-5">
                <p className="text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-white/60">
                    theme=&quot;dark&quot; · the ink opt-in
                </p>
                <Progress value={62} theme="dark" />
                <p className="text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-white/60">
                    the same opt-in, on cream — the old default
                </p>
                <div className="rounded-autara-lg bg-[var(--background)] p-4">
                    <Progress value={62} theme="dark" />
                </div>
            </div>
        </div>
    ),
}

/**
 * Onboarding uses a progress bar above a step label, which is the only place
 * in the product it currently appears. `Stepper` composes its own bar rather
 * than importing this one — worth knowing before adding a second.
 */
export const OnboardingHeader: Story = {
    name: 'In context — an onboarding header',
    render: () => (
        <div className="max-w-md space-y-3 rounded-autara-lg bg-[var(--surface)] p-5">
            <Progress value={57} />
            <p className="editorial-eyebrow">
                Step 4 of 7
                <span className="normal-case tracking-normal text-[var(--text-strong)]">
                    {' '}
                    · Verification documents
                </span>
            </p>
        </div>
    ),
}
