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
    testId?: string
    className?: string
}

function Row({ row, total }: { row: MoneyRow; total?: boolean }) {
    return (
        <div
            data-testid={row.testId}
            className={cn(
                'flex items-baseline justify-between gap-4 leading-snug text-[var(--text-strong)]',
                total ? 'text-base' : 'text-[0.9375rem]',
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
    testId,
    className,
}: MoneyBreakdownProps) {
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
                {total ? (
                    <div className="border-t border-[var(--hairline)] pt-2.5">
                        <Row row={total} total />
                    </div>
                ) : null}
            </dl>
            {note ? (
                <p className={cn('text-[0.8125rem] leading-relaxed text-[var(--text-subtle)]', !card && 'mt-2')}>{note}</p>
            ) : null}
        </div>
    )
}
