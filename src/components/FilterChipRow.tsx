import type { ReactNode } from 'react'
import { cn } from '../lib/cn'

/**
 * FilterChipRow — single-select pill row used as the secondary
 * filter on filtered-list screens (booking status, inbox filter,
 * service status, notification tab).
 *
 * Active chip uses the canonical "Torph ink" capsule treatment
 * (`bg-[var(--text-strong)] text-white`); inactive chips are
 * hairline-bordered surface pills. The row scrolls horizontally on
 * narrow surfaces.
 *
 * Why a single component vs leaving each consumer to roll its own:
 *   - The previous inline pattern was duplicated 4× across
 *     merchant-mobile screens with slightly different paddings and
 *     transitions — drift waiting to happen.
 *   - The "ink active + outline inactive" pair is a canonical
 *     Autara editorial pattern; consolidate so future tweaks land
 *     in one place.
 *
 * Type parameter `V` lets the consumer keep their own value union
 * (string / null / enum) without casting at the callsite.
 */

export interface FilterChipOption<V> {
    /** Stable value used in equality + onChange. */
    value: V
    /** Visible label. */
    label: ReactNode
}

export interface FilterChipRowProps<V> {
    options: FilterChipOption<V>[]
    /** The currently active value — `null` is a valid value if your
     *  union includes "all" as `null`. */
    value: V
    onChange: (value: V) => void
    /** ARIA label for the row; defaults to "Filter". */
    ariaLabel?: string
    className?: string
}

export function FilterChipRow<V>({
    options,
    value,
    onChange,
    ariaLabel = 'Filter',
    className,
}: FilterChipRowProps<V>) {
    return (
        <div
            role="tablist"
            aria-label={ariaLabel}
            className={cn(
                '-mx-1 flex gap-1.5 overflow-x-auto pb-1 pl-1 pr-1',
                className,
            )}
        >
            {options.map((o, i) => {
                const active = o.value === value
                return (
                    <button
                        key={i}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() => onChange(o.value)}
                        className={cn(
                            'shrink-0 rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-autara-purple)]/35',
                            active
                                ? 'bg-[var(--text-strong)] text-white'
                                : 'border border-[var(--border-subtle)] bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text-strong)]',
                        )}
                    >
                        {o.label}
                    </button>
                )
            })}
        </div>
    )
}
