import type { Meta, StoryObj } from '@storybook/react-vite'
import { Disclosure } from './Disclosure'

/**
 * # Disclosure
 *
 * One question and its answer, opening and closing smoothly. AUTM-1679.
 *
 * A native `<details>` and `<summary>`: the summary is a button with its
 * expanded state for assistive technology, find-in-page opens a closed
 * answer, and with no JavaScript it still opens. The answer is in the HTML
 * whether open or closed.
 *
 * With JavaScript the height runs on `grid-template-rows` (0fr to 1fr) over
 * `--motion-settle`, the answer fades as it moves and the icon turns. Under
 * reduced motion it opens and closes at once.
 */
const meta = {
    title: 'Marketing/Disclosure',
    component: Disclosure,
    parameters: { layout: 'padded' },
    args: {
        summary: 'How long does approval take?',
        children:
            'Most applications are reviewed within one business day. Every one is reviewed by a person, not a script, and we email you the moment it is done.',
    },
} satisfies Meta<typeof Disclosure>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const OpenOnFirstPaint: Story = { args: { defaultOpen: true } }

/** `icon="plus"` turns to an × when open. */
export const PlusIcon: Story = { args: { icon: 'plus' } }

/** No surface, for a list that is already inside a card. */
export const Plain: Story = { args: { variant: 'plain' } }

/** A long question wraps beside the icon; a long answer opens to its own height. */
export const LongText: Story = {
    args: {
        summary: 'Can I take bookings for a mobile service and a workshop at the same time, and what do customers see?',
        children: Array.from({ length: 4 }, () =>
            'Customers choose where the job happens when they book, and you see it on the booking. '
        ).join(''),
    },
}

/** In context: a FAQ of paper cards on the brand-deep ground. */
export const FaqOnDeep: Story = {
    parameters: { layout: 'fullscreen' },
    render: () => (
        <div style={{ background: 'var(--hero)', padding: '3rem 1.5rem', minHeight: '100vh' }}>
            <div style={{ maxWidth: '44rem', margin: '0 auto', display: 'grid', gap: '0.75rem' }}>
                {[
                    ['How long does approval take?', 'Usually a business day. A person reviews every application.'],
                    ['What does it cost?', 'One plan, $129 a month, free for 60 days from when you go live.'],
                    ['How do customers find me before search opens?', 'Through your booking link: in your bio, your Google profile and your replies.'],
                ].map(([q, a], i) => (
                    <Disclosure key={q} summary={q} defaultOpen={i === 0} icon="plus">
                        {a}
                    </Disclosure>
                ))}
            </div>
        </div>
    ),
}
