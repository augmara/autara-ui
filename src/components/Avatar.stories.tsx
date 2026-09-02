import type { Meta, StoryObj } from '@storybook/react-vite'
import { Avatar, AvatarFallback, AvatarImage } from './Avatar'

/**
 * Avatar — a person, and the only thing besides an indicator dot that is
 * allowed to be fully round (rule 3 of the Autara Glass direction). Round now
 * means "a person or a state light" and never "an action", which is what
 * buttons giving up the pill radius bought.
 *
 * ─── AUTM-975: why this file exists now ─────────────────────────────────
 *
 * `AvatarFallback`'s `theme` prop defaulted to `'dark'`, so a bare
 * `<AvatarFallback>PN</AvatarFallback>` painted `text-white/70` initials on a
 * 20%-purple wash over the cream canvas — the initials all but disappeared.
 * `Button.stories.tsx` renders exactly that shape, so it was on screen in
 * Storybook the whole time with no story of its own pointing at it.
 *
 * The default is now the themed branch. `'dark'` is still available as the
 * opt-in STATIC ink treatment for a photo or marketing surface — it is not
 * the dark theme, which the tokens handle either way. `ThemedGround` below
 * is the story that separates those two ideas.
 */
const meta: Meta<typeof Avatar> = {
    title: 'Atoms/Avatar',
    component: Avatar,
    parameters: { layout: 'padded' },
}
export default meta
type Story = StoryObj<typeof Avatar>

const SIZES = ['sm', 'md', 'lg', 'xl'] as const

export const Default: Story = {
    name: 'Default — no theme prop',
    render: () => (
        <Avatar>
            <AvatarFallback>PN</AvatarFallback>
        </Avatar>
    ),
}

export const Sizes: Story = {
    name: 'Sizes — sm · md · lg · xl',
    render: () => (
        <div className="flex items-end gap-4">
            {SIZES.map((size) => (
                <div key={size} className="flex flex-col items-center gap-2">
                    <Avatar size={size}>
                        <AvatarFallback>DR</AvatarFallback>
                    </Avatar>
                    <span className="text-[0.6875rem] uppercase tracking-[0.18em] text-[var(--text-subtle)]">
                        {size}
                    </span>
                </div>
            ))}
        </div>
    ),
}

/**
 * With a photo. `AvatarImage` is a Radix image with its own load state, so the
 * fallback is what renders until the file arrives — and on a slow connection
 * that is the state a real user looks at longest, which is the whole reason
 * the fallback's default mattered.
 */
export const WithImage: Story = {
    name: 'With a photo, and the fallback behind it',
    render: () => (
        <div className="flex items-center gap-4">
            <Avatar size="lg">
                <AvatarImage
                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=128&q=70"
                    alt=""
                />
                <AvatarFallback>AT</AvatarFallback>
            </Avatar>
            <Avatar size="lg">
                {/* Deliberately unresolvable — Radix falls through to the initials. */}
                <AvatarImage src="/does-not-exist.jpg" alt="" />
                <AvatarFallback>AT</AvatarFallback>
            </Avatar>
        </div>
    ),
}

/**
 * Edge — the fallback is sized for two initials. A longer string is what a
 * consumer passes when it derives from a business name rather than a person,
 * and the circle does not grow, so it clips rather than reflowing the row.
 */
export const LongInitials: Story = {
    name: 'Edge — more than two characters',
    render: () => (
        <div className="flex items-center gap-4">
            {['P', 'PN', 'PNK', 'AUTARA'].map((initials) => (
                <Avatar key={initials}>
                    <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
            ))}
        </div>
    ),
}

/**
 * AUTM-975, and the distinction the prop name hides.
 *
 * Column one is the default in both themes: it tracks the canvas. Column two
 * forces `theme="dark"` on the cream canvas — that is what the old default
 * silently produced everywhere.
 *
 * FIXED in AUTM-936: the themed branch now paints `--accent-fill` with
 * `--on-accent`, so the disc moves with the theme instead of sitting at a
 * fixed `autara-purple-50`. It previously used that static Tailwind ramp plus
 * fill-grade purple as ink, so the dark pane below showed a bright pale disc
 * rather than a surface belonging to the card, and all four merchant-mobile
 * call sites shipped it.
 *
 * Compare the two panes below — that the disc DIFFERS between them is the
 * whole fix. Measured: white on `#4e1bbd` is 9.48:1 light, white on `#6d3dd4`
 * is 6.43:1 dark.
 */
export const ThemedGround: Story = {
    name: 'In context — the default in both themes, beside the ink opt-in',
    render: () => (
        <div className="grid gap-6 sm:grid-cols-3">
            {[
                { label: 'default · light', theme: undefined, opt: undefined },
                { label: 'default · dark', theme: 'dark' as const, opt: undefined },
                { label: 'theme="dark" on cream', theme: undefined, opt: 'dark' as const },
            ].map((col) => (
                <div
                    key={col.label}
                    data-theme={col.theme}
                    className="space-y-3 rounded-autara-lg bg-[var(--background)] p-5"
                >
                    <p className="text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]">
                        {col.label}
                    </p>
                    <div className="flex items-center gap-3 rounded-autara-lg bg-[var(--surface)] p-4">
                        <Avatar size="lg">
                            <AvatarFallback theme={col.opt}>PN</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-[var(--text-strong)]">
                                Priya N
                            </p>
                            <p className="truncate text-xs text-[var(--text-muted)]">
                                4 bookings this month
                            </p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    ),
}
