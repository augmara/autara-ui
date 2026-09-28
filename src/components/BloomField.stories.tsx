import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { BloomField } from './BloomField'
import { GlassSurface } from './GlassSurface'
import { LitGroup } from './LitGroup'
import { Button } from './Button'

/**
 * # BloomField
 *
 * The gradient ground, alive. AUTM-1475, Phase 0 of the web revamp Don
 * approved on 2026-09-28.
 *
 * A WebGL2 fragment shader paints the three blooms as a slow field that
 * drifts and leans toward the pointer. It reads `--background`, the three
 * `--bloom-*` colours and `--bloom-alpha` from the element's computed style,
 * so flip the **Theme** toolbar and it re-lights itself.
 *
 * **Where it goes:** the hero and the footer of a marketing page, nowhere
 * else. Sections between keep `GradientGround`.
 *
 * **Budget:** under 2 ms a frame on the iPad Pro 11", measured on the device.
 * Over that, the consumer ships `GradientGround`. It renders at half
 * resolution, caps at 30 fps, and stops when off-screen or hidden.
 * `prefers-reduced-motion` paints one frame. No WebGL2 means the static
 * ground, which is what the server HTML already is.
 */
const meta = {
    title: 'Design System/Bloom field',
    component: BloomField,
    parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof BloomField>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
    render: () => (
        <BloomField className="min-h-[32rem] p-10">
            <GlassSurface className="max-w-md p-7">
                <h3 className="text-xl font-bold text-[var(--text-strong)]">Same glass. Lit from behind, and moving.</h3>
                <p className="mt-2 text-sm text-[var(--text-muted)]">
                    Move the pointer across the ground. The blooms lean toward it by a few
                    percent; nothing else changes.
                </p>
            </GlassSurface>
        </BloomField>
    ),
}

function PausedDemo() {
    const [paused, setPaused] = useState(false)
    return (
        <BloomField paused={paused} className="min-h-[32rem] p-10">
            <GlassSurface className="max-w-md p-7">
                <p className="text-sm text-[var(--text-muted)]">
                    <code>paused</code> stops the loop and keeps the last frame. The
                    wrapper carries <code>data-ground</code> so a device test can count
                    live fields on a page.
                </p>
                <Button className="mt-4" onClick={() => setPaused((p) => !p)}>
                    {paused ? 'Resume' : 'Pause'}
                </Button>
            </GlassSurface>
        </BloomField>
    )
}

/** `paused` keeps the last frame; `data-ground` flips to `paused`. */
export const Paused: Story = {
    render: () => <PausedDemo />,
}

/**
 * The hero shape the merchant landing uses: a lit ground, a headline, and lit
 * glass on top of it inside one `LitGroup`. This is the whole Phase 0 stack
 * in one frame.
 */
export const HeroInContext: Story = {
    name: 'In context: a marketing hero',
    render: () => (
        <BloomField className="min-h-[36rem] px-10 py-16">
            <div className="max-w-3xl">
                <h1 className="text-[clamp(2.4rem,5vw,4.4rem)] font-bold leading-[0.98] tracking-[-0.035em] text-[var(--text-strong)]">
                    Grow your car care business with Autara.
                </h1>
                <p className="mt-5 max-w-xl text-lg text-[var(--text-muted)]">
                    List your services and get discovered by customers near you. Now
                    onboarding in Melbourne.
                </p>
            </div>
            <LitGroup className="mt-10 grid max-w-3xl gap-4 sm:grid-cols-3">
                {['$4,267 paid out this month', '3 jobs in progress', '2 requests waiting'].map((t) => (
                    <GlassSurface key={t} lit className="p-5">
                        <p className="text-sm font-medium text-[var(--text-strong)]">{t}</p>
                    </GlassSurface>
                ))}
            </LitGroup>
        </BloomField>
    ),
}
