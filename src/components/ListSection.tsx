import * as React from 'react'
import type { ReactNode } from 'react'
import { cn } from '../lib/cn'

/**
 * ListSection + ListSectionRow — the canonical Autara
 * settings / account / preferences list pattern.
 *
 *   GROUP TITLE
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
                <h2 className="mb-2 px-1 text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--text-subtle)]">
                    {title}
                </h2>
            ) : null}
            <div className="overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)]">
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
    /** Renders label + icon in destructive (rose) ink. Use for sign-out
     *  / delete-account rows. */
    destructive?: boolean
}

export function ListSectionRow({
    icon,
    label,
    description,
    trailing,
    onTap,
    destructive = false,
}: ListSectionRowProps) {
    const interactive = !!onTap
    const Container = interactive ? 'button' : 'div'
    const containerProps = interactive ? { type: 'button' as const, onClick: onTap } : {}

    return React.createElement(
        Container,
        {
            ...containerProps,
            className: cn(
                'flex w-full items-center gap-3 px-4 py-3 text-left transition-colors first:rounded-t-2xl last:rounded-b-2xl border-b border-[var(--border-subtle)] last:border-b-0',
                interactive &&
                    'hover:bg-[var(--surface-elevated)] focus-visible:outline-none focus-visible:bg-[var(--surface-elevated)]',
            ),
        },
        icon ? (
            <span
                aria-hidden
                className={cn(
                    'grid h-9 w-9 shrink-0 place-items-center rounded-lg',
                    destructive
                        ? 'bg-[rgba(221,56,56,0.08)] text-[var(--color-autara-error)]'
                        : 'bg-[rgba(78,27,189,0.06)] text-[var(--color-autara-purple)]',
                )}
            >
                {icon}
            </span>
        ) : null,
        <div className="min-w-0 flex-1">
            <p
                className={cn(
                    'truncate text-[14px] font-medium',
                    destructive
                        ? 'text-[var(--color-autara-error)]'
                        : 'text-[var(--text-strong)]',
                )}
            >
                {label}
            </p>
            {description ? (
                <p className="mt-0.5 truncate text-[12px] text-[var(--text-muted)]">
                    {description}
                </p>
            ) : null}
        </div>,
        trailing ? (
            <span className="shrink-0 text-[12px] text-[var(--text-muted)]">
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
