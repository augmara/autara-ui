import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from './Button'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from './Tooltip'

/**
 * Tooltip — Radix tooltip in the Autara Torph ink aesthetic.
 *
 * Ink capsule (`#0E0A1A` + white text + hairline `white/10` ring), no
 * drop shadow. Matches the Toast capsule grammar so floating UI reads
 * as one family.
 *
 * Wrap your tree in `<TooltipProvider>` once near the app root; each
 * Tooltip composes via `Tooltip > TooltipTrigger > TooltipContent`.
 * Default `delayDuration` is Radix's 700ms — set `delayDuration={150}`
 * on the Provider for snappier hover behaviour.
 */
const meta: Meta = {
    title: 'Atoms/Tooltip',
    parameters: { layout: 'centered' },
    decorators: [
        (Story) => (
            <TooltipProvider delayDuration={150}>
                <Story />
            </TooltipProvider>
        ),
    ],
}
export default meta
type Story = StoryObj

// ─── Default — text trigger, top placement ─────────────────────────
export const Default: Story = {
    render: () => (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button variant="outline" size="sm">
                    Hover me
                </Button>
            </TooltipTrigger>
            <TooltipContent>Saved 2 minutes ago</TooltipContent>
        </Tooltip>
    ),
}

// ─── Four sides — top / right / bottom / left ──────────────────────
const Pill: React.FC<{ side: 'top' | 'right' | 'bottom' | 'left' }> = ({
    side,
}) => (
    <Tooltip>
        <TooltipTrigger asChild>
            <Button variant="outline" size="sm">
                {side}
            </Button>
        </TooltipTrigger>
        <TooltipContent side={side}>{`Appears on ${side}`}</TooltipContent>
    </Tooltip>
)

export const Sides: Story = {
    name: 'Sides — top × right × bottom × left',
    parameters: { layout: 'padded' },
    render: () => (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Pill side="top" />
            <Pill side="right" />
            <Pill side="bottom" />
            <Pill side="left" />
        </div>
    ),
}

// ─── Icon-only trigger — Solar Bold info icon ──────────────────────
const InfoIcon: React.FC = () => (
    <svg
        aria-hidden
        viewBox="0 0 24 24"
        width="16"
        height="16"
        className="text-[var(--text-muted)]"
        fill="currentColor"
    >
        <circle cx="12" cy="12" r="10" opacity="0.18" />
        <circle cx="12" cy="8" r="1.3" />
        <rect x="11" y="10.5" width="2" height="7" rx="1" />
    </svg>
)

export const IconTrigger: Story = {
    name: 'Icon trigger — Solar Bold info',
    render: () => (
        <div className="flex items-center gap-2 text-sm text-[var(--text-strong)]">
            <span>Platform fee</span>
            <Tooltip>
                <TooltipTrigger asChild>
                    <button
                        type="button"
                        aria-label="What is the platform fee?"
                        className="grid h-5 w-5 place-items-center rounded-full hover:bg-[var(--surface-elevated)]"
                    >
                        <InfoIcon />
                    </button>
                </TooltipTrigger>
                <TooltipContent>
                    15% of each booking, including Stripe processing.
                </TooltipContent>
            </Tooltip>
        </div>
    ),
}

// ─── Rich content — title + supporting line ────────────────────────
export const RichContent: Story = {
    render: () => (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button variant="outline" size="sm">
                    Booking SLA
                </Button>
            </TooltipTrigger>
            <TooltipContent className="px-3.5 py-2.5">
                <div className="text-[12px] font-medium uppercase tracking-[0.12em] text-white/55">
                    SLA
                </div>
                <div className="mt-1 text-[13px] leading-snug text-white">
                    Confirm a booking within 30 minutes to avoid auto-expiry.
                </div>
            </TooltipContent>
        </Tooltip>
    ),
}

// ─── In context — labelled metric row (admin dashboard pattern) ────
export const InMetricRow: Story = {
    name: 'In context — labelled metric row',
    parameters: { layout: 'padded' },
    render: () => (
        <div className="max-w-md space-y-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] p-5">
            <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]">
                This week
            </div>
            {[
                {
                    label: 'Gross bookings',
                    value: '$3,420',
                    help: 'All confirmed + completed bookings, before fees.',
                },
                {
                    label: 'Platform fee',
                    value: '$513',
                    help: '15% of gross. Settled to Autara weekly.',
                },
                {
                    label: 'Net to merchant',
                    value: '$2,907',
                    help: 'After platform fee + Stripe processing.',
                },
            ].map((row) => (
                <div
                    key={row.label}
                    className="flex items-center justify-between"
                >
                    <div className="flex items-center gap-1.5">
                        <span className="text-sm text-[var(--text-strong)]">
                            {row.label}
                        </span>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    type="button"
                                    aria-label={`About ${row.label}`}
                                    className="grid h-4 w-4 place-items-center rounded-full hover:bg-[var(--surface-elevated)]"
                                >
                                    <InfoIcon />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent>{row.help}</TooltipContent>
                        </Tooltip>
                    </div>
                    <span className="text-sm font-medium text-[var(--text-strong)]">
                        {row.value}
                    </span>
                </div>
            ))}
        </div>
    ),
}
