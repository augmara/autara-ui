'use client'

import * as React from 'react'
import { cn } from '../lib/cn'

/**
 * Table — the dense data surface. Admin's light-mode tables are the hardest
 * case in the design system, so this is where the rules get tested.
 *
 * ─── AUTM-974: the selected row ─────────────────────────────────────────
 *
 * `data-[state=selected]` used to paint `bg-autara-purple-50` (#f5f0ff) in
 * the light theme — a pastel tint of the accent, which is the FIRST thing
 * rule 4 of the Autara Glass direction bans, and one Don has rejected twice
 * (AUTM-211 for badges, then again on 2026-09-01 for everything). It measured
 * 1.05:1 against a white row: on a 12-row table you could not tell which row
 * you had selected without moving your head.
 *
 * A selected row is now a SOLID `--act-fill` with `--on-act` ink, which is
 * what selection looks like in every native table (Finder, Mail, Excel) and
 * the only treatment that survives at row density.
 *
 * The ink is forced onto the cells rather than left to inherit. `TableCell`
 * sets its own colour on the `<td>`, so a colour on the `<tr>` alone loses to
 * it and the row would go solid purple with purple-grade ink on top — the
 * exact trade the merchant-mobile booking-detail pass nearly shipped, a
 * banned outline swapped for a 3.40:1 sentence. `[&>td]` beats the cell's own
 * class on specificity, so the ink moves with the fill.
 *
 * The light branch also gave up `autara-gray-200` / `autara-gray-50` /
 * `autara-purple-50`. Those are Tailwind-shaped ramps that do not track the
 * theme (AUTM-936's finding on ErrorCard); the semantic tokens do.
 *
 * `theme="dark"` stays a STATIC ink treatment — it is the opt-in for a table
 * on a photo or ink surface, not the dark theme, which the tokens handle on
 * their own.
 */

const Table = React.forwardRef<
    HTMLTableElement,
    React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
    <div className="relative w-full overflow-auto">
        <table
            ref={ref}
            className={cn('w-full caption-bottom text-sm', className)}
            {...props}
        />
    </div>
))
Table.displayName = 'Table'

const TableHeader = React.forwardRef<
    HTMLTableSectionElement,
    React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
    <thead ref={ref} className={cn('[&_tr]:border-b', className)} {...props} />
))
TableHeader.displayName = 'TableHeader'

const TableBody = React.forwardRef<
    HTMLTableSectionElement,
    React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
    <tbody ref={ref} className={cn('[&_tr:last-child]:border-0', className)} {...props} />
))
TableBody.displayName = 'TableBody'

const TableFooter = React.forwardRef<
    HTMLTableSectionElement,
    React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
    <tfoot
        ref={ref}
        className={cn('border-t font-medium [&>tr]:last:border-b-0', className)}
        {...props}
    />
))
TableFooter.displayName = 'TableFooter'

const TableRow = React.forwardRef<
    HTMLTableRowElement,
    React.HTMLAttributes<HTMLTableRowElement> & { theme?: 'dark' | 'light' }
>(({ className, theme = 'dark', ...props }, ref) => (
    <tr
        ref={ref}
        className={cn(
            'border-b transition-colors',
            theme === 'dark'
                ? 'border-white/[0.06] hover:bg-white/[0.02]'
                : 'border-[var(--border-subtle)] hover:bg-[var(--surface-elevated)]',
            // Solid, and the same in both treatments — selection is not a
            // tone of the surface, it is its own object. See the header.
            'data-[state=selected]:bg-[var(--act-fill)]',
            'data-[state=selected]:[&>td]:text-[var(--on-act)]',
            'data-[state=selected]:[&>th]:text-[var(--on-act)]',
            className
        )}
        {...props}
    />
))
TableRow.displayName = 'TableRow'

const TableHead = React.forwardRef<
    HTMLTableCellElement,
    React.ThHTMLAttributes<HTMLTableCellElement> & { theme?: 'dark' | 'light' }
>(({ className, theme = 'dark', ...props }, ref) => (
    <th
        ref={ref}
        className={cn(
            'h-10 px-4 text-left align-middle text-xs font-medium [&:has([role=checkbox])]:pr-0',
            theme === 'dark' ? 'text-white/40' : 'text-[var(--text-muted)]',
            className
        )}
        {...props}
    />
))
TableHead.displayName = 'TableHead'

const TableCell = React.forwardRef<
    HTMLTableCellElement,
    React.TdHTMLAttributes<HTMLTableCellElement> & { theme?: 'dark' | 'light' }
>(({ className, theme = 'dark', ...props }, ref) => (
    <td
        ref={ref}
        className={cn(
            'px-4 py-3 align-middle text-sm [&:has([role=checkbox])]:pr-0',
            theme === 'dark' ? 'text-white/70' : 'text-[var(--text-strong)]',
            className
        )}
        {...props}
    />
))
TableCell.displayName = 'TableCell'

const TableCaption = React.forwardRef<
    HTMLTableCaptionElement,
    React.HTMLAttributes<HTMLTableCaptionElement> & { theme?: 'dark' | 'light' }
>(({ className, theme = 'dark', ...props }, ref) => (
    <caption
        ref={ref}
        className={cn(
            'mt-4 text-sm',
            theme === 'dark' ? 'text-white/30' : 'text-[var(--text-subtle)]',
            className
        )}
        {...props}
    />
))
TableCaption.displayName = 'TableCaption'

export {
    Table,
    TableHeader,
    TableBody,
    TableFooter,
    TableHead,
    TableRow,
    TableCell,
    TableCaption,
}
