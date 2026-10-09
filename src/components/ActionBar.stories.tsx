import type { Meta, StoryObj } from '@storybook/react-vite'
import { ActionBar, type ActionBarAction } from './ActionBar'
import { ArrowGlyph, CardGlyph, ChatGlyph, ClockGlyph, CloseGlyph, HelpGlyph, PhoneGlyph } from './_shellGlyphs'

/**
 * AUTM-1781: a detail screen's actions, only the ones that are true now. A
 * dock on a phone (switch the viewport), a list for a side panel from lg.
 */
const meta: Meta<typeof ActionBar> = {
    title: 'App shell/ActionBar',
    component: ActionBar,
    parameters: { layout: 'fullscreen' },
}
export default meta
type Story = StoryObj<typeof ActionBar>

const confirmed: ActionBarAction[] = [
    { key: 'message', label: 'Message', icon: <ChatGlyph />, primary: true, onSelect: () => {} },
    { key: 'directions', label: 'Directions', icon: <ArrowGlyph />, href: 'https://maps.google.com', external: true },
    { key: 'change', label: 'Change time', icon: <ClockGlyph />, description: 'Ask the pro to move it', onSelect: () => {} },
    { key: 'cancel', label: 'Cancel', icon: <CloseGlyph />, tone: 'danger', onSelect: () => {} },
    { key: 'help', label: 'Help', icon: <HelpGlyph />, onSelect: () => {} },
]

const Page = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-[32rem] bg-[var(--surface)] p-4 pb-32 lg:grid lg:grid-cols-[1fr_20rem] lg:gap-8">
        <div className="text-[var(--text-muted)]">The booking reads here. On a phone the bar is docked below.</div>
        <aside className="lg:sticky lg:top-4 lg:self-start">{children}</aside>
    </div>
)

/** A confirmed booking: Message leads, then directions, change, cancel, help. */
export const Default: Story = {
    parameters: { viewport: { defaultViewport: 'phone' } },
    render: () => (
        <Page>
            <ActionBar label="Booking actions" actions={confirmed} />
        </Page>
    ),
}

/** The same actions as the desktop side panel's list. */
export const Panel: Story = {
    parameters: { viewport: { defaultViewport: 'desktop' } },
    render: () => (
        <Page>
            <ActionBar label="Booking actions" actions={confirmed} />
        </Page>
    ),
}

/** On the day: Message, Call, Directions. */
export const OnTheDay: Story = {
    parameters: { viewport: { defaultViewport: 'phone' } },
    render: () => (
        <Page>
            <ActionBar
                label="Booking actions"
                actions={[
                    confirmed[0],
                    { key: 'call', label: 'Call', icon: <PhoneGlyph />, href: 'tel:+61400000000' },
                    confirmed[1],
                ]}
            />
        </Page>
    ),
}

/** One or two actions are pills: a balance to pay. */
export const TwoActions: Story = {
    parameters: { viewport: { defaultViewport: 'phone' } },
    render: () => (
        <Page>
            <ActionBar
                label="Booking actions"
                actions={[
                    { key: 'pay', label: 'Pay $126.00', icon: <CardGlyph />, primary: true, href: '#' },
                    { key: 'help', label: 'Help', icon: <HelpGlyph />, onSelect: () => {} },
                ]}
            />
        </Page>
    ),
}

/** Edge: 200% text on a small phone. Labels wrap; the caller may return the bar to the flow. */
export const LargeText: Story = {
    parameters: { viewport: { defaultViewport: 'phoneSmall' } },
    render: () => (
        <div className="text-[200%]">
            <Page>
                <ActionBar label="Booking actions" actions={confirmed.slice(0, 4)} />
            </Page>
        </div>
    ),
}
