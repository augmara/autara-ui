import type { Meta, StoryObj } from '@storybook/react-vite'
import { Reveal } from './Reveal'
import { GlassSurface, GradientGround } from './GlassSurface'

/**
 * # Reveal
 *
 * A block that arrives once as it scrolls into view, with no JavaScript.
 * AUTM-1475.
 *
 * `.reveal-view` does nothing by default. Only an engine with CSS
 * scroll-driven animations (Chromium 115+, Safari 26+) and a user without
 * `prefers-reduced-motion` get the animation, tied to the block's own
 * progress through the viewport. Everyone else sees the content at rest,
 * which is also what the server HTML is.
 *
 * Scroll this story. Each panel fades and rises over the first 40% of its
 * entry, then stays.
 */
const meta = {
    title: 'Marketing/Reveal',
    component: Reveal,
    parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Reveal>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
    render: () => (
        <GradientGround className="p-10">
            <p className="mb-[70vh] text-sm text-[var(--text-muted)]">Scroll down.</p>
            <div className="grid max-w-2xl gap-[40vh]">
                {['One reveal per section.', 'Nothing waits for a script.', 'Reduced motion sees it at rest.'].map(
                    (t) => (
                        <Reveal key={t}>
                            <GlassSurface className="p-7">
                                <h3 className="text-xl font-bold text-[var(--text-strong)]">{t}</h3>
                            </GlassSurface>
                        </Reveal>
                    )
                )}
            </div>
        </GradientGround>
    ),
}

/** `as` renders another element, so a list of steps stays a list. */
export const AsListItems: Story = {
    name: 'as="li"',
    render: () => (
        <GradientGround className="p-10">
            <ol className="grid max-w-2xl gap-4">
                {['List your services', 'Get verified', 'Take paid bookings'].map((t, i) => (
                    <Reveal as="li" key={t}>
                        <GlassSurface className="p-5">
                            <span className="text-sm tabular-nums text-[var(--text-subtle)]">0{i + 1}</span>
                            <h3 className="mt-1 text-lg font-bold text-[var(--text-strong)]">{t}</h3>
                        </GlassSurface>
                    </Reveal>
                ))}
            </ol>
        </GradientGround>
    ),
}

/**
 * AUTM-1678: `stagger` keeps the list still and reveals each item one step
 * after the one before, on the item's own scroll progress. A row enters
 * together and so steps; at rest under reduced motion and without
 * scroll-driven animations, as the plain reveal is.
 */
export const Stagger: Story = {
    name: 'stagger',
    render: () => (
        <GradientGround className="p-10">
            <p className="mb-[70vh] text-sm text-[var(--text-muted)]">Scroll down.</p>
            <Reveal as="ul" stagger className="m-0 grid max-w-4xl list-none gap-4 p-0 sm:grid-cols-3">
                {['List your services', 'Get verified', 'Take paid bookings'].map((t, i) => (
                    <li key={t}>
                        <GlassSurface className="h-full p-5">
                            <span className="text-sm tabular-nums text-[var(--text-subtle)]">0{i + 1}</span>
                            <h3 className="mt-1 text-lg font-bold text-[var(--text-strong)]">{t}</h3>
                        </GlassSurface>
                    </li>
                ))}
            </Reveal>
            <div className="h-[60vh]" />
        </GradientGround>
    ),
}
