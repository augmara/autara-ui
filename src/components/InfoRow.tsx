import type { ReactNode } from 'react'
import { cn } from '../lib/cn'

/**
 * InfoRow — two-column key-value display.
 *
 * Used wherever a row of metadata reads as "label: value" — booking
 * detail summaries, customer profile cards, payment breakdowns,
 * invoice previews. Pair with a hairline-divided `<div>` parent for
 * the stacked-rows look (the parent owns the `divide-y` class so
 * InfoRow itself stays bare).
 *
 * Aesthetic:
 *   - Label muted ink, value strong ink
 *   - Tabular-nums on value for numeric alignment
 *   - `emphasised` bumps the value to font-bold (use for the row that
 *     anchors the group — e.g. the "Total" row in a payment summary)
 */

export interface InfoRowProps {
    label: string
    value: ReactNode
    /** Renders the value in font-bold instead of font-medium. */
    emphasised?: boolean
    className?: string
}

export function InfoRow({ label, value, emphasised = false, className }: InfoRowProps) {
    return (
        <div
            className={cn(
                'flex items-start justify-between gap-3 py-1.5',
                className,
            )}
        >
            <span className="text-sm text-[var(--text-muted)]">{label}</span>
            <span
                className={cn(
                    'text-right text-sm tabular-nums text-[var(--text-strong)]',
                    emphasised ? 'font-bold' : 'font-medium',
                )}
            >
                {value}
            </span>
        </div>
    )
}
