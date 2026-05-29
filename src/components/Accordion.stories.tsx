import type { Meta, StoryObj } from '@storybook/react-vite'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from './Accordion'

/**
 * Accordion — Radix accordion in the Autara cream-canvas grammar.
 *
 * Items separated by hairlines, Solar Bold chevron, ink text on
 * triggers, muted body. Use single-open mode for FAQ patterns;
 * multiple-open for expandable settings.
 */
const meta: Meta<typeof Accordion> = {
    title: 'Atoms/Accordion',
    parameters: { layout: 'padded' },
}
export default meta
type Story = StoryObj

const FAQ_ITEMS = [
    {
        q: 'What does Autara charge for a booking?',
        a: 'A 15 % platform fee applies on every confirmed booking, including Stripe processing. Payouts settle weekly to your linked Stripe Connect account.',
    },
    {
        q: 'How long do I have to confirm a booking?',
        a: 'Bookings expire 30 minutes after the customer hits "Book". After that the customer hold is released and the slot reopens. Push + email reminders fire 12 hours before expiry.',
    },
    {
        q: 'Can I cancel after I confirm?',
        a: 'Yes, but merchant-initiated cancellations refund the customer the full deposit immediately. Repeated cancellations affect your verification status.',
    },
    {
        q: 'What if the customer is a no-show?',
        a: 'Mark the booking as a no-show from the booking detail screen. The deposit is yours; Autara does not refund.',
    },
]

// ─── Single open — canonical FAQ pattern ───────────────────────────
export const SingleOpen: Story = {
    name: 'Single open — FAQ pattern',
    render: () => (
        <div className="max-w-xl rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] px-6">
            <Accordion type="single" collapsible defaultValue="q-0">
                {FAQ_ITEMS.map((item, i) => (
                    <AccordionItem key={i} value={`q-${i}`}>
                        <AccordionTrigger>{item.q}</AccordionTrigger>
                        <AccordionContent>{item.a}</AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    ),
}

// ─── Multiple open — settings / expandable rows ────────────────────
export const MultipleOpen: Story = {
    name: 'Multiple open — settings rows',
    render: () => (
        <div className="max-w-xl rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] px-6">
            <Accordion
                type="multiple"
                defaultValue={['notifications', 'payouts']}
            >
                {[
                    {
                        v: 'notifications',
                        title: 'Notification preferences',
                        body: 'Choose which booking events ping you in-app, via push, or via email. Granular controls in Settings → Notifications.',
                    },
                    {
                        v: 'payouts',
                        title: 'Payout schedule',
                        body: 'Default: weekly on Mondays. Change to daily (Stripe Connect dashboard) if cash flow needs it.',
                    },
                    {
                        v: 'tax',
                        title: 'Tax + GST',
                        body: 'Australian merchants: GST applies on the platform fee, not the gross booking. We surface a quarterly statement in Settings → Tax.',
                    },
                    {
                        v: 'integrations',
                        title: 'Calendar integrations',
                        body: 'Two-way sync with Google Calendar and Apple Calendar. Bookings appear within 60 seconds of confirmation.',
                    },
                ].map((row) => (
                    <AccordionItem key={row.v} value={row.v}>
                        <AccordionTrigger>{row.title}</AccordionTrigger>
                        <AccordionContent>{row.body}</AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    ),
}

// ─── With prefix icon — Solar Bold icon per row ────────────────────
const PinIcon: React.FC = () => (
    <svg
        aria-hidden
        viewBox="0 0 24 24"
        width="18"
        height="18"
        className="shrink-0 text-[var(--color-autara-purple)]"
        fill="currentColor"
    >
        <circle cx="12" cy="12" r="10" opacity="0.18" />
        <circle cx="12" cy="10" r="3" />
        <path d="M12 22c4-5 7-8 7-12a7 7 0 1 0-14 0c0 4 3 7 7 12z" opacity="0.18" />
    </svg>
)

export const WithPrefixIcon: Story = {
    name: 'With prefix icon — Solar Bold',
    render: () => (
        <div className="max-w-xl rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] px-6">
            <Accordion type="single" collapsible defaultValue="sydney">
                {[
                    {
                        v: 'sydney',
                        title: 'Sydney — 12 merchants',
                        body: 'Inner-city, Eastern Suburbs, Northern Beaches. Average response time: 18 minutes.',
                    },
                    {
                        v: 'melbourne',
                        title: 'Melbourne — 8 merchants',
                        body: 'CBD, Fitzroy, Richmond, St Kilda. Average response time: 24 minutes.',
                    },
                    {
                        v: 'brisbane',
                        title: 'Brisbane — 4 merchants',
                        body: 'CBD, Fortitude Valley, New Farm. Average response time: 36 minutes.',
                    },
                ].map((row) => (
                    <AccordionItem key={row.v} value={row.v}>
                        <AccordionTrigger className="gap-3">
                            <div className="flex items-center gap-3">
                                <PinIcon />
                                <span>{row.title}</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pl-9">
                            {row.body}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    ),
}

// ─── Disabled item ─────────────────────────────────────────────────
export const WithDisabledItem: Story = {
    name: 'With disabled item',
    render: () => (
        <div className="max-w-xl rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] px-6">
            <Accordion type="single" collapsible>
                <AccordionItem value="a">
                    <AccordionTrigger>Booking radius</AccordionTrigger>
                    <AccordionContent>
                        How far you&apos;re willing to drive from your home
                        suburb. Default 10 km.
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="b">
                    <AccordionTrigger disabled>
                        Premium scheduling (upgrade required)
                    </AccordionTrigger>
                </AccordionItem>
                <AccordionItem value="c">
                    <AccordionTrigger>Vacation hold</AccordionTrigger>
                    <AccordionContent>
                        Pause all bookings for up to 14 days. Existing
                        confirmations are unaffected.
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    ),
}

// ─── In context — marketing FAQ block on cream ─────────────────────
export const MarketingFAQ: Story = {
    name: 'In context — marketing FAQ block',
    render: () => (
        <div className="max-w-3xl space-y-8">
            <div>
                <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]">
                    Common questions
                </div>
                <h2 className="mt-2 text-3xl font-medium leading-tight text-[var(--text-strong)]">
                    Merchant FAQ
                </h2>
                <p className="mt-2 max-w-prose text-[15px] text-[var(--text-muted)]">
                    Everything detailers ask in the first 24 hours. Can&apos;t
                    find your answer? Email{' '}
                    <span className="underline decoration-[var(--text-muted)] underline-offset-2">
                        support@autara.au
                    </span>{' '}
                    — we reply within 4 business hours.
                </p>
            </div>
            <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] px-6">
                <Accordion type="single" collapsible defaultValue="q-0">
                    {FAQ_ITEMS.map((item, i) => (
                        <AccordionItem key={i} value={`q-${i}`}>
                            <AccordionTrigger>{item.q}</AccordionTrigger>
                            <AccordionContent>{item.a}</AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </div>
    ),
}
