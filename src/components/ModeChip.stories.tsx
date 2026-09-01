import { useEffect, type ReactNode } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Badge } from './Badge'
import { ModeChip } from './ModeChip'

/**
 * AUTM-969 — ModeChip answers one question for a merchant scanning a list:
 * am I driving to them, or are they coming to me? That decides whether they
 * have to leave, so it is checked at a glance and never read carefully.
 *
 * The chip was previously a `ring-1 ring-inset` box with a 9px muted label —
 * an outlined box (rule 4 of the Autara Glass direction bans those), frozen
 * against OS text scaling, and the faintest element on the row. It is now a
 * solid achromatic fill on the 8px chip rung, sized in rem and em.
 *
 * Check every story in BOTH themes with the Storybook toolbar; the
 * side-by-side stories below force both at once for the comparisons that
 * matter.
 */
const meta = {
    title: 'Merchant portal/ModeChip',
    component: ModeChip,
    parameters: { layout: 'centered' },
    args: { mode: 'MOBILE' },
} satisfies Meta<typeof ModeChip>

export default meta
type Story = StoryObj<typeof meta>

export const Mobile: Story = {}

export const InShop: Story = { args: { mode: 'IN_SHOP' } }

export const Small: Story = {
    name: 'Small — the booking-row size',
    args: { mode: 'MOBILE', size: 'sm' },
}

export const IconOnly: Story = {
    name: 'Icon only — carries an accessible name',
    args: { mode: 'MOBILE', iconOnly: true },
}

export const BothModesBothSizes: Story = {
    name: 'Both modes · both sizes',
    parameters: { layout: 'padded' },
    render: () => (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <ModeChip mode="MOBILE" />
                <ModeChip mode="IN_SHOP" />
                <ModeChip mode="MOBILE" iconOnly />
                <ModeChip mode="IN_SHOP" iconOnly />
            </div>
            <div className="flex items-center gap-3">
                <ModeChip mode="MOBILE" size="sm" />
                <ModeChip mode="IN_SHOP" size="sm" />
                <ModeChip mode="MOBILE" size="sm" iconOnly />
                <ModeChip mode="IN_SHOP" size="sm" iconOnly />
            </div>
        </div>
    ),
}

/**
 * The API sends `WORKSHOP`; `IN_SHOP` and `FIXED_LOCATION` are the contract
 * spellings. All three mean the same thing to a merchant, so all three render
 * the same chip.
 */
export const EveryAcceptedValue: Story = {
    name: 'Edge — every accepted spelling',
    parameters: { layout: 'padded' },
    render: () => (
        <div className="flex flex-wrap items-center gap-3">
            {['MOBILE', 'IN_SHOP', 'FIXED_LOCATION', 'WORKSHOP'].map((m) => (
                <div key={m} className="flex items-center gap-2">
                    <code className="text-[0.6875rem] text-[var(--text-subtle)]">{m}</code>
                    <ModeChip mode={m} />
                </div>
            ))}
        </div>
    ),
}

/**
 * The behaviour change in AUTM-969, shown rather than described.
 *
 * The old component branched `mode === 'MOBILE' ? mobile : inShop`, so null,
 * undefined and an unrecognised value all rendered "In-shop" — telling the
 * merchant the customer was coming to them, on no evidence at all. It now
 * renders nothing. A missing chip is a gap the merchant can see; a wrong chip
 * is a wrong answer to "do I need to leave?".
 */
export const UnknownMode: Story = {
    name: 'Edge — unknown or missing mode renders nothing',
    parameters: { layout: 'padded' },
    render: () => (
        <div className="space-y-2">
            {[
                { label: 'null', value: null },
                { label: 'undefined', value: undefined },
                { label: '"" (empty string)', value: '' },
                { label: '"SOMETHING_NEW"', value: 'SOMETHING_NEW' },
            ].map((c) => (
                <div key={c.label} className="flex items-center gap-3">
                    <code className="w-40 text-[0.6875rem] text-[var(--text-subtle)]">
                        {c.label}
                    </code>
                    <span className="rounded-autara-sm border border-dashed border-[var(--border-subtle)] px-3 py-1 text-[0.6875rem] text-[var(--text-subtle)]">
                        <ModeChip mode={c.value} />
                        nothing rendered
                    </span>
                </div>
            ))}
        </div>
    ),
}

// ─── In context ─────────────────────────────────────────────────────────

const ROWS = [
    { time: '9:00', day: 'Mon', service: 'Full detail — interior + exterior', customer: 'Priya N · Mazda CX-5', price: '$240.00', status: 'Confirmed', tone: 'flight' as const, mode: 'MOBILE' },
    { time: '11:30', day: 'Mon', service: 'Ceramic coating top-up', customer: 'Dan R · Ford Ranger', price: '$180.00', status: 'In progress', tone: 'act' as const, mode: 'WORKSHOP' },
    { time: '2:15', day: 'Mon', service: 'Express wash', customer: 'Alex T · Toyota Corolla', price: '$65.00', status: 'Completed', tone: 'money' as const, mode: 'MOBILE' },
    { time: '4:00', day: 'Mon', service: 'Paint correction — stage 2', customer: 'Sam K · BMW 3 Series', price: '$420.00', status: 'Confirmed', tone: 'flight' as const, mode: null },
]

/**
 * Mirrors `autara-merchant-mobile/src/components/BookingCard.tsx` — the chip
 * sits under the status badge in the row's right-hand column, which is the
 * pairing the design has to survive. Colour is the status; the mode is
 * achromatic, so the two do not compete (rule 5 — purple ACTS, aqua is IN
 * FLIGHT, lime is DONE, and a delivery mode is none of those).
 *
 * The last row has no mode from the API, which is what that looks like now.
 */
function BookingRows({ dense = false }: { dense?: boolean }) {
    return (
        <div className="overflow-hidden rounded-autara-lg border border-[var(--border-subtle)] bg-[var(--surface)]">
            {ROWS.map((r, i) => (
                <div
                    key={r.service}
                    className={`flex items-start gap-4 p-4 ${i === ROWS.length - 1 ? '' : 'border-b border-[var(--border-subtle)]'}`}
                >
                    <div className="w-20 shrink-0 border-r border-[var(--border-subtle)] pr-4">
                        <p className="text-[0.625rem] font-medium uppercase tracking-[0.14em] text-[var(--text-subtle)]">
                            {r.day}
                        </p>
                        <p className="text-base font-bold tabular-nums text-[var(--text-strong)]">
                            {r.time}
                        </p>
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-base font-medium text-[var(--text-strong)]">
                            {r.service}
                        </p>
                        <p className="mt-0.5 truncate text-[0.8125rem] text-[var(--text-muted)]">
                            {r.customer}
                        </p>
                    </div>
                    <p className="shrink-0 text-[0.8125rem] font-medium tabular-nums text-[var(--text-strong)]">
                        {r.price}
                    </p>
                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                        <Badge variant={r.tone} shape="parallelogram">
                            {r.status}
                        </Badge>
                        <ModeChip mode={r.mode} size={dense ? 'sm' : 'md'} />
                    </div>
                </div>
            ))}
        </div>
    )
}

export const InContextBookingList: Story = {
    name: 'In context — the merchant booking list',
    parameters: { layout: 'padded' },
    render: () => (
        <div className="max-w-3xl">
            <BookingRows dense />
        </div>
    ),
}

export const BothThemes: Story = {
    name: 'In context — light and dark canvas',
    parameters: { layout: 'padded' },
    render: () => (
        <div className="grid gap-6 lg:grid-cols-2">
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
                        {col.label}
                    </p>
                    <div className="flex items-center gap-3">
                        <ModeChip mode="MOBILE" />
                        <ModeChip mode="IN_SHOP" />
                        <ModeChip mode="MOBILE" size="sm" />
                        <ModeChip mode="IN_SHOP" size="sm" />
                    </div>
                    <BookingRows dense />
                </div>
            ))}
        </div>
    ),
}

/**
 * The defect this ticket exists for, made visible.
 *
 * The old chip was `text-[9px]` with a pixel-sized SVG, so at 200% OS text
 * scale it stayed 9px while every line around it doubled — the same failure
 * the merchant-mobile pass found eleven times in one afternoon. Everything
 * here is rem (the label, the padding) or em (the glyph), so the whole chip
 * grows together: measured 11px → 22px and 12px → 24px.
 *
 * This story scales the ROOT font size, not a wrapper. That distinction is
 * the whole point — the first draft of this story set `font-size: 200%` on a
 * container and both rows rendered identically, because `rem` resolves
 * against `<html>` and ignores an ancestor entirely. A story that cannot fail
 * is worse than no story, so it does what the browser's own "very large font"
 * setting does, and restores the root on unmount.
 *
 * Compare against any other story in this file for the 100% baseline.
 */
function RootScaled({ percent, children }: { percent: number; children: ReactNode }) {
    useEffect(() => {
        const root = document.documentElement
        const previous = root.style.fontSize
        root.style.fontSize = `${percent}%`
        return () => {
            root.style.fontSize = previous
        }
    }, [percent])
    return <>{children}</>
}

export const TextScale200: Story = {
    name: 'A11y — 200% text scale (scales the root)',
    parameters: { layout: 'padded' },
    render: () => (
        <RootScaled percent={200}>
            <div className="space-y-5">
                <p className="text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]">
                    Root font size 200%
                </p>
                <div className="flex flex-wrap items-center gap-3">
                    <ModeChip mode="MOBILE" />
                    <ModeChip mode="IN_SHOP" />
                    <ModeChip mode="MOBILE" size="sm" />
                    <ModeChip mode="IN_SHOP" size="sm" iconOnly />
                </div>
                <BookingRows dense />
            </div>
        </RootScaled>
    ),
}
