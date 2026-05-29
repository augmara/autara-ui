import type { Meta, StoryObj } from '@storybook/react-vite'
import { useEffect, useRef } from 'react'
import { Button } from './Button'
import {
    ToastProvider,
    toast,
    useToast,
    type ToastPosition,
} from './Toast'

/**
 * Toast — Torph-style ink capsule. Single-line, leading Solar-Bold
 * status icon, lime/aqua accents, no shadow.
 *
 * Stories trigger toasts via the singleton `toast()` API. The
 * "Processing transaction" morph demo updates a single toast in
 * place — the canonical Torph status-pill pattern.
 */
const meta: Meta = {
    title: 'Atoms/Toast',
    parameters: { layout: 'padded' },
    decorators: [
        (Story) => (
            <ToastProvider>
                <Story />
            </ToastProvider>
        ),
    ],
}
export default meta
type Story = StoryObj

const Panel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="space-y-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] p-5">
        <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]">
            Trigger
        </div>
        <div className="flex flex-wrap gap-2">{children}</div>
    </div>
)

// ─── One of each type ──────────────────────────────────────────────
export const SingleCapsules: Story = {
    name: 'Single capsules — one of each type',
    render: () => (
        <Panel>
            <Button
                variant="outline"
                size="sm"
                onClick={() => toast('Synced your bookings calendar.')}
            >
                Default
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={() => toast.success('Booking confirmed for 09:30 tomorrow.')}
            >
                Success
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={() =>
                    toast.error("Couldn't reach the booking service — retrying in 5s.")
                }
            >
                Error
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={() =>
                    toast.warning('Your ABN verification expires in 3 days.')
                }
            >
                Warning
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={() => toast.info('Two services were auto-categorised.')}
            >
                Info
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={() =>
                    toast.loading('Submitting your booking request…')
                }
            >
                Loading
            </Button>
        </Panel>
    ),
}

// ─── Stack — multiple toasts at once ───────────────────────────────
export const Stack: Story = {
    name: 'Stack — multiple toasts at once',
    render: () => (
        <Panel>
            <Button
                variant="dark"
                size="sm"
                onClick={() => {
                    toast.loading('Submitting your booking request…')
                    setTimeout(
                        () => toast.success('Booking confirmed for 09:30 tomorrow.'),
                        450
                    )
                    setTimeout(
                        () => toast.info('Calendar invite sent to maya@example.com.'),
                        900
                    )
                }}
            >
                Fire 3 toasts
            </Button>
        </Panel>
    ),
}

// ─── The canonical Torph morph — single toast updates in place ─────
export const StatusMorph: Story = {
    name: 'Status morph — Processing → Confirmed',
    render: () => {
        const idRef = useRef<string | null>(null)
        useEffect(() => {
            return () => {
                if (idRef.current) toast.dismiss(idRef.current)
            }
        }, [])
        return (
            <Panel>
                <Button
                    variant="acid"
                    size="sm"
                    onClick={() => {
                        const id = toast.loading('Processing transaction')
                        idRef.current = id
                        setTimeout(
                            () =>
                                toast.update(id, {
                                    type: 'loading',
                                    description: 'Capturing deposit',
                                }),
                            800
                        )
                        setTimeout(
                            () =>
                                toast.update(id, {
                                    type: 'loading',
                                    description: 'Notifying merchant',
                                }),
                            1700
                        )
                        setTimeout(() => {
                            toast.update(id, {
                                type: 'success',
                                description: 'Booking confirmed',
                                duration: 3500,
                            })
                            idRef.current = null
                        }, 2600)
                    }}
                >
                    Run morph
                </Button>
                <p className="basis-full text-xs text-[var(--text-muted)]">
                    A single capsule morphs across three statuses then resolves
                    to a success in ~2.6s — the Torph status-pill pattern.
                </p>
            </Panel>
        )
    },
}

// ─── Positions — six anchor edges/corners ──────────────────────────
const POSITIONS: ToastPosition[] = [
    'top-left',
    'top-center',
    'top-right',
    'bottom-left',
    'bottom-center',
    'bottom-right',
]

/** Each tile fires through its own provider via `useToast` so the
 *  six-anchor demo doesn't fight the singleton `toast()` (which only
 *  binds to the last-mounted provider). */
const PositionTile: React.FC<{ pos: ToastPosition }> = ({ pos }) => {
    const { addToast } = useToast()
    return (
        <div className="space-y-2 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] p-4">
            <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]">
                {pos}
            </div>
            <Button
                variant="outline"
                size="sm"
                onClick={() =>
                    addToast({
                        type: 'success',
                        description: `Fired from ${pos}`,
                    })
                }
            >
                Fire toast
            </Button>
        </div>
    )
}

/**
 * Six independent ToastProviders mounted on the same page, each
 * pinned to a different anchor. Click any tile to fire a toast at
 * that position — enter direction mirrors the anchor so top stacks
 * come down from above and bottom stacks rise from below.
 *
 * In real consumer code, you mount **one** ToastProvider at the app
 * root with the position your product wants — the singleton `toast()`
 * binds to that provider. The grid below is a Storybook-only
 * convenience for previewing all six at once.
 */
export const Positions: Story = {
    name: 'Positions — six anchors',
    decorators: [(Story) => <Story />], // suppress the global ToastProvider
    render: () => (
        <div className="grid grid-cols-3 gap-3">
            {POSITIONS.map((pos) => (
                <ToastProvider key={pos} position={pos}>
                    <PositionTile pos={pos} />
                </ToastProvider>
            ))}
        </div>
    ),
}

// ─── Light variant — cream-canvas companion ────────────────────────
/** Fires through the local provider via useToast so the singleton
 *  (still bound to the global dark provider) doesn't capture the click. */
const LightTriggers: React.FC = () => {
    const { addToast } = useToast()
    return (
        <div className="flex flex-wrap gap-2">
            <Button
                variant="outline"
                size="sm"
                onClick={() =>
                    addToast({ description: 'Synced your bookings calendar.' })
                }
            >
                Default
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={() =>
                    addToast({
                        type: 'success',
                        description: 'Booking confirmed for 09:30 tomorrow.',
                    })
                }
            >
                Success
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={() =>
                    addToast({
                        type: 'error',
                        description:
                            "Couldn't reach the booking service — retrying.",
                    })
                }
            >
                Error
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={() =>
                    addToast({
                        type: 'warning',
                        description: 'ABN verification expires in 3 days.',
                    })
                }
            >
                Warning
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={() =>
                    addToast({
                        type: 'info',
                        description: 'Two services were auto-categorised.',
                    })
                }
            >
                Info
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={() =>
                    addToast({
                        type: 'loading',
                        description: 'Submitting your booking request…',
                        duration: 0,
                    })
                }
            >
                Loading
            </Button>
        </div>
    )
}

export const LightVariant: Story = {
    name: 'Light variant — cream-canvas companion',
    decorators: [(Story) => <Story />],
    render: () => (
        <ToastProvider variant="light">
            <div className="space-y-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] p-5">
                <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]">
                    Trigger — provider variant="light"
                </div>
                <LightTriggers />
                <p className="text-xs text-[var(--text-muted)]">
                    White surface, ink text, hairline ring. Same Solar Bold
                    icons; accents shift to AA-readable variants on light.
                </p>
            </div>
        </ToastProvider>
    ),
}

// ─── Per-toast variant override ────────────────────────────────────
/** Same provider, two capsules — one inheriting the dark default,
 *  one overriding to light per call. */
const MixedTriggers: React.FC = () => {
    const { addToast } = useToast()
    return (
        <div className="flex flex-wrap gap-2">
            <Button
                variant="outline"
                size="sm"
                onClick={() =>
                    addToast({
                        type: 'success',
                        description: 'Inherits provider variant (dark).',
                    })
                }
            >
                Inherit (dark)
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={() =>
                    addToast({
                        type: 'success',
                        description: 'Override per-toast to light.',
                        variant: 'light',
                    })
                }
            >
                Override to light
            </Button>
        </div>
    )
}

export const MixedVariants: Story = {
    name: 'Mixed variants — per-toast override',
    decorators: [(Story) => <Story />],
    render: () => (
        <ToastProvider variant="dark">
            <Panel>
                <MixedTriggers />
            </Panel>
        </ToastProvider>
    ),
}

// ─── With action button ────────────────────────────────────────────
export const WithAction: Story = {
    render: () => (
        <Panel>
            <Button
                variant="outline"
                size="sm"
                onClick={() =>
                    toast({
                        type: 'info',
                        description: 'Profile draft autosaved.',
                        duration: 6000,
                        action: {
                            label: 'View',
                            onClick: () =>
                                toast.success('Opened draft from autosave.'),
                        },
                    })
                }
            >
                Toast with action
            </Button>
        </Panel>
    ),
}
