import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from './Button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from './Dialog'

/**
 * Dialog — Radix dialog on the cream canvas.
 *
 * - `--surface` (white) fill, `--text-strong` ink, hairline ring.
 * - Ink overlay at 55% opacity, no backdrop blur — flat editorial scrim.
 * - Solar Bold close at the top-right.
 *
 * Header / Footer / Title / Description are typographic helpers — pick
 * the ones you need and arrange freely inside `DialogContent`.
 */
const meta: Meta = {
    title: 'Atoms/Dialog',
    parameters: { layout: 'centered' },
}
export default meta
type Story = StoryObj

// ─── Default — confirm action ──────────────────────────────────────
export const ConfirmAction: Story = {
    render: () => (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    Confirm action
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Cancel this booking?</DialogTitle>
                    <DialogDescription>
                        The customer will be refunded the $25 deposit
                        immediately. You won&apos;t be able to undo this
                        action.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" size="sm">
                        Keep booking
                    </Button>
                    <Button variant="destructive" size="sm">
                        Cancel booking
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    ),
}

// ─── With form fields ──────────────────────────────────────────────
export const WithForm: Story = {
    render: () => (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="dark" size="sm">
                    Edit service
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit service</DialogTitle>
                    <DialogDescription>
                        Change the name and base price. Customers see the
                        update next time they open your profile.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-3">
                    <label className="grid gap-1.5">
                        <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]">
                            Service name
                        </span>
                        <input
                            defaultValue="Full interior detail"
                            className="h-10 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface)] px-3 text-sm text-[var(--text-strong)] outline-none focus:border-[var(--color-autara-purple)]/35 focus:ring-2 focus:ring-[var(--color-autara-purple)]/15"
                        />
                    </label>
                    <label className="grid gap-1.5">
                        <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]">
                            Base price (AUD)
                        </span>
                        <input
                            defaultValue="129"
                            inputMode="numeric"
                            className="h-10 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface)] px-3 text-sm text-[var(--text-strong)] outline-none focus:border-[var(--color-autara-purple)]/35 focus:ring-2 focus:ring-[var(--color-autara-purple)]/15"
                        />
                    </label>
                </div>
                <DialogFooter>
                    <Button variant="outline" size="sm">
                        Cancel
                    </Button>
                    <Button variant="dark" size="sm">
                        Save changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    ),
}

// ─── Long content — proves scroll behaviour inside content ─────────
export const LongContent: Story = {
    render: () => (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    Read terms
                </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Merchant terms — summary</DialogTitle>
                    <DialogDescription>
                        Highlights from the merchant terms. Full text linked
                        below.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-3 text-sm leading-relaxed text-[var(--text-muted)]">
                    {[
                        'Autara collects a 15% platform fee on every confirmed booking, including Stripe processing.',
                        'Payouts settle weekly to your linked Stripe Connect account.',
                        'Bookings unconfirmed after 30 minutes auto-expire and release the customer hold.',
                        'Disputes opened within 24 hours of completion are reviewed by Autara support; outcomes published within 7 days.',
                        'Suspension can occur for repeated no-shows, fraudulent ABN, or safety-related complaints.',
                    ].map((p, i) => (
                        <p key={i}>{p}</p>
                    ))}
                </div>
                <DialogFooter>
                    <Button variant="outline" size="sm">
                        View full terms
                    </Button>
                    <Button variant="dark" size="sm">
                        I agree
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    ),
}
