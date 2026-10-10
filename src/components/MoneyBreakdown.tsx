import type { ReactNode } from 'react'
import { cn } from '../lib/cn'

/**
 * MoneyBreakdown — lines of money, then the one that matters.
 *
 * Deposit now, balance after the job, cancellation fee, refund, total: the
 * customer web hand-built this list on the checkout review, both cancel
 * pages and the booking detail, each with its own alignment and its own
 * idea of which line is bold (AUTM-1185). This is the one shape.
 *
 * A `<dl>`, because a label/value list is what it is: screen readers read
 * "Deposit paid, 54 dollars" as a pair. Values are right-aligned on tabular
 * figures so amounts line up. `total` sits under a hairline and carries
 * the weight; `note` is the small print under it ("within 5 to 10 business
 * days", "GST included").
 *
 * AUTM-1594 — canvas v44 "Money breakdown": 15px rows in ink with the
 * amount in Bold, 10px apart; the total at 16px under a hairline. `title`
 * and `card` draw the sheet's specimen whole (a band card, 24px, 20px in,
 * a 16px Bold title); leave them off where the page already supplies the
 * card. Amounts come from the server and are never summed here.
 *
 * The values are ReactNode on purpose: the consumer formats money in its
 * own locale and currency (`A$54.00`); this component never touches a
 * number.
 *
 * AUTM-1797 / AUTM-1799: `variant="chips"` draws each row as a chip, the
 * amount in Black over its few words ("$54" over "On hold"), side by side,
 * coloured by what the money IS, in the house palette: `money` lime (paid,
 * refunded), `flight` aqua (on hold, a refund on its way), `act` purple
 * (yours to pay or confirm), `neutral` band (after the job, kept by the
 * pro). The same `<dl>`, the same ids: only the drawing changes, the value
 * still comes first for a screen reader as "On hold, 54 dollars".
 *
 * A chip's amount is never split: "$25.18" stays one figure on one line, at
 * any text size (it used to break mid-number at 200% text). The chips sit
 * side by side down to 8rem each.
 */
export interface MoneyRow {
    label: ReactNode
    value: ReactNode
    /** Dim the row: a fee already covered, a line that is context not money owed. */
    muted?: boolean
    /** Bold the row without making it the total. */
    emphasis?: boolean
    /** `data-testid` on the row, so a spec can read one line. */
    testId?: string
    /** `variant="chips"`: what the money is. */
    tone?: MoneyTone
}

/** The chips' palette: lime money in, aqua in flight, purple yours to act on, band otherwise. */
export type MoneyTone = 'money' | 'flight' | 'act' | 'neutral'

const CHIP_TONE: Record<MoneyTone, string> = {
    money: 'bg-[var(--lime)] text-[var(--on-lime)] [&>dt]:text-[color-mix(in_srgb,var(--on-lime)_78%,transparent)]',
    flight: 'bg-[var(--aqua)] text-[var(--on-aqua)] [&>dt]:text-[color-mix(in_srgb,var(--on-aqua)_78%,transparent)]',
    act: 'bg-[var(--brand)] text-[var(--on-brand)] [&>dt]:text-[var(--on-deep-muted)]',
    neutral: 'bg-[var(--band)] text-[var(--text-strong)] [&>dt]:text-[var(--text-muted)]',
}

export interface MoneyBreakdownProps {
    rows: MoneyRow[]
    /** The line under the hairline, bold. */
    total?: MoneyRow
    /** Small print under the total. */
    note?: ReactNode
    /** Accessible name for the list, e.g. "Payment summary". */
    label?: string
    /** A visible heading over the rows ("If you cancel now"). */
    title?: ReactNode
    /** Draw the band card around it, as the sheet's specimen. */
    card?: boolean
    /** `list` (default): label and amount on a line. `chips`: each row a chip. */
    variant?: 'list' | 'chips'
    testId?: string
    className?: string
}

function Chip({ row }: { row: MoneyRow }) {
    return (
        <div
            data-testid={row.testId}
            data-tone={row.tone ?? 'neutral'}
            className={cn(
                'flex min-w-0 flex-col-reverse justify-end gap-0.5 rounded-[1.25rem] px-4 pt-3.5 pb-[0.9375rem]',
                CHIP_TONE[row.tone ?? 'neutral'],
            )}
        >
            <dt className="min-w-0 text-[0.9375rem] leading-snug font-medium">{row.label}</dt>
            {/* Whole: an amount never breaks mid-number. */}
            <dd className="m-0 text-[2rem] leading-[1.1] font-black tracking-[-0.02em] whitespace-nowrap tabular-nums">
                {row.value}
            </dd>
        </div>
    )
}

function Row({ row, total }: { row: MoneyRow; total?: boolean }) {
    return (
        <div
            data-testid={row.testId}
            className={cn(
                'flex items-baseline justify-between gap-4 leading-snug text-[var(--text-strong)]',
                total ? 'border-t border-[var(--hairline)] pt-2.5 text-base' : 'text-[0.9375rem]',
                row.emphasis && !total && 'font-bold',
                row.muted && 'text-[var(--text-subtle)]',
            )}
        >
            <dt className="min-w-0">{row.label}</dt>
            <dd className="shrink-0 font-bold tabular-nums">{row.value}</dd>
        </div>
    )
}

export function MoneyBreakdown({
    rows,
    total,
    note,
    label,
    title,
    card = false,
    variant = 'list',
    testId,
    className,
}: MoneyBreakdownProps) {
    if (variant === 'chips') {
        return (
            <div data-testid={testId} className={cn('flex flex-col gap-2.5', className)}>
                {title ? <p className="text-base leading-snug font-bold text-[var(--text-strong)]">{title}</p> : null}
                <dl
                    aria-label={label}
                    data-variant="chips"
                    className="m-0 grid grid-cols-[repeat(auto-fit,minmax(min(100%,8rem),1fr))] gap-2.5"
                >
                    {rows.map((row, i) => (
                        <Chip key={i} row={row} />
                    ))}
                    {total ? <Chip row={total} /> : null}
                </dl>
                {note ? <p className="m-0 text-[0.8125rem] leading-relaxed text-[var(--text-subtle)]">{note}</p> : null}
            </div>
        )
    }
    return (
        <div
            data-testid={testId}
            className={cn(
                card && 'flex flex-col gap-2.5 rounded-[1.5rem] bg-[var(--band)] p-5 text-[var(--text-strong)]',
                className,
            )}
        >
            {title ? <p className="text-base leading-snug font-bold text-[var(--text-strong)]">{title}</p> : null}
            <dl aria-label={label} className="flex flex-col gap-2.5">
                {rows.map((row, i) => (
                    <Row key={i} row={row} />
                ))}
                {/* AUTM-1781: the total row carries its own rule. It was
                    wrapped in a div, which put its dt and dd two levels
                    under the dl (axe definition-list, dlitem). */}
                {total ? <Row row={total} total /> : null}
            </dl>
            {note ? (
                <p className={cn('text-[0.8125rem] leading-relaxed text-[var(--text-subtle)]', !card && 'mt-2')}>{note}</p>
            ) : null}
        </div>
    )
}
