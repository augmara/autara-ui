import * as React from 'react'
import type { ReactNode } from 'react'
import { cn } from '../lib/cn'

/**
 * ListSection + ListSectionRow — the canonical Autara
 * settings / account / preferences list pattern.
 *
 *   Group title
 *   ┌─────────────────────────────────────────────┐
 *   │ [Icon] Row label                  Value  ›  │
 *   │ ────────────────────────────────────────── │
 *   │ [Icon] Row label                  Value  ›  │
 *   └─────────────────────────────────────────────┘
 *
 * Used across merchant-mobile Settings, customer-web account hub,
 * admin user-profile sections. The visual treatment matches Autara's
 * editorial cream surface — hairline borders, no drop shadows, ink
 * label color over a `--surface` fill.
 *
 * The chevron auto-renders when `onTap` is provided. `trailing` slots
 * a custom value (e.g. a status pill, a Switch, a price) before the
 * chevron.
 *
 * Section title is optional — for a single group of rows without a
 * label (e.g. a sign-out row at the bottom of a settings screen) omit
 * `title`.
 *
 * AUTM-1138 — the section title is SENTENCE CASE, not a letterspaced
 * uppercase eyebrow.
 *
 * It shipped as `text-[10px] uppercase tracking-[0.18em]`, which is the
 * treatment Don has rejected repeatedly across the surfaces. It is also the
 * loudest possible way to render the least important text on the screen: a
 * group label is scaffolding, and tracking it out to 0.18em turns four quiet
 * words into a banner while the rows underneath — the actual content — sit at
 * a normal weight. Sentence case at `--text-muted` lets the rows lead.
 *
 * AUTM-1594 — canvas v44 "Row in a card": the group is a band card (24px,
 * 14px in) and each row is its own raised card inside it (16px radius,
 * 14 x 16 in, 10px apart), so there are no dividers and no outline. The
 * label is 16px Bold, the description 14px at 72% ink, the trailing value
 * ink. `accent` draws the sheet's 4px brand bar at the row's left edge, the
 * mark of a row that is waiting on someone. Icons sit in a band disc; a
 * destructive row's label and icon take the danger colour, never a tint.
 *
 * The type is in `rem`, not `px`. All four sizes here were hardcoded pixels,
 * so the whole pattern ignored OS Dynamic Type on every surface that uses it —
 * settings screens being exactly where someone who has scaled their text goes
 * to change things. The rem values are exact equivalents at a 16px root
 * (10→0.625 was lifted to 0.75 for the title; 14→0.875; 12→0.75), so nothing
 * moves at default scale and they only diverge where they should.
 */

export interface ListSectionProps {
    title?: string
    children: ReactNode
    className?: string
}

export function ListSection({ title, children, className }: ListSectionProps) {
    return (
        <section className={cn('mt-6 first:mt-0', className)}>
            {title ? (
                <h2 className="mb-2 px-1 text-[0.875rem] font-medium text-[var(--text-muted)]">
                    {title}
                </h2>
            ) : null}
            <div className="flex flex-col gap-2.5 rounded-[1.5rem] bg-[var(--band)] p-3.5">
                {children}
            </div>
        </section>
    )
}

export interface ListSectionRowProps {
    icon?: ReactNode
    label: string
    description?: string
    /** Value on the right, e.g. a Switch, a pill, a numeric label, etc. */
    trailing?: ReactNode
    onTap?: () => void
    /** Renders label + icon in the danger colour. Use for sign-out
     *  / delete-account rows. */
    destructive?: boolean
    /** The sheet's 4px brand bar at the left edge: a row waiting on someone. */
    accent?: boolean
}

export function ListSectionRow({
    icon,
    label,
    description,
    trailing,
    onTap,
    destructive = false,
    accent = false,
}: ListSectionRowProps) {
    const interactive = !!onTap
    const Container = interactive ? 'button' : 'div'
    const containerProps = interactive ? { type: 'button' as const, onClick: onTap } : {}

    return React.createElement(
        Container,
        {
            ...containerProps,
            className: cn(
                'flex min-h-11 w-full items-center gap-3 rounded-2xl bg-[var(--raised)] px-4 py-3.5 text-left transition-colors',
                interactive &&
                    'hover:bg-[var(--paper)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--band)]',
            ),
        },
        accent ? (
            <span aria-hidden className="w-1 shrink-0 self-stretch rounded-full bg-[var(--brand)]" />
        ) : null,
        icon ? (
            <span
                aria-hidden
                className={cn(
                    'grid size-10 shrink-0 place-items-center rounded-full bg-[var(--band)]',
                    destructive ? 'text-[var(--danger)]' : 'text-[var(--accent)]',
                )}
            >
                {icon}
            </span>
        ) : null,
        <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
            <p
                className={cn(
                    'truncate text-base leading-snug font-bold',
                    destructive ? 'text-[var(--danger)]' : 'text-[var(--text-strong)]',
                )}
            >
                {label}
            </p>
            {description ? (
                <p className="truncate text-sm leading-snug text-[var(--text-muted)]">
                    {description}
                </p>
            ) : null}
        </div>,
        trailing ? (
            <span className="shrink-0 text-[0.9375rem] text-[var(--text-strong)]">
                {trailing}
            </span>
        ) : null,
        interactive ? (
            // Solar `AltArrowRight` Linear, inlined so autara-ui doesn't
            // depend on @solar-icons/react.
            <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
                className="shrink-0 text-[var(--text-subtle)]"
            >
                <path
                    d="m9 6 6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        ) : null,
    )
}
