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

/*
 * AUTM-1594 — canvas v44 "Info row": 12px in, a hairline above and below,
 * 15px. A run of rows shares its rules (each draws the one below it, the
 * first also the one above), so the lines never double.
 */
export function InfoRow({ label, value, emphasised = false, className }: InfoRowProps) {
    return (
        <div
            className={cn(
                'flex items-start justify-between gap-3 border-b border-[var(--hairline)] py-3 first:border-t',
                className,
            )}
        >
            <span className="text-[0.9375rem] text-[var(--text-muted)]">{label}</span>
            <span
                className={cn(
                    'text-right text-[0.9375rem] tabular-nums text-[var(--text-strong)]',
                    emphasised ? 'font-bold' : 'font-medium',
                )}
            >
                {value}
            </span>
        </div>
    )
}
