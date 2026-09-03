import type { ReactNode } from 'react'
import { cn } from '../lib/cn'

/**
 * FilterChipRow — single-select pill row used as the secondary
 * filter on filtered-list screens (booking status, inbox filter,
 * service status, notification tab).
 *
 * Active chip uses the canonical "Torph ink" capsule treatment
 * (`bg-[var(--surface-inverse)] text-[var(--text-on-inverse)]`); inactive chips
 * are a quiet `--surface-elevated` ground with muted ink. The row scrolls
 * horizontally on narrow surfaces.
 *
 * ─── AUTM-974: the inactive chip lost its border ────────────────────────
 *
 * The active chip was already solid; the inactive ones were
 * `border border-[var(--border-subtle)]` on `--surface`, i.e. outlined boxes
 * sitting next to a solid one. Rule 4 of the Autara Glass direction bans
 * outlines outright, and there was a second reason to go: a row of five
 * hairline rectangles is five rectangles competing with the one chip that is
 * meant to stand out. Emphasis reads better when the unemphasised things stop
 * drawing themselves.
 *
 * The focus ring moved with it. `ring-[var(--color-autara-purple)]/35` with no
 * offset drew a translucent purple line directly against the ink capsule —
 * 1.8:1, under the 3:1 WCAG 2.4.11 asks of a focus indicator. It is now
 * full-strength `--accent` with a 2px offset band in the page canvas.
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
                            /* 8px, same rung as MetaChip — round is avatars and dots only
                               (Don, 2026-09-01); see MetaChip for the geometry. */
                            /* AUTM-622 — `min-h-11` (44px). This was MISSED by the
                               first pass at that ticket, which fixed `Switch` and
                               `Tabs` and shipped in 5.3.1 while the ticket also
                               names this component. A board audit caught it: the
                               chips were still `px-3 py-1.5` with no minimum and
                               rendered at 32px, so anyone closing AUTM-622 on
                               5.3.1 would have closed it over a live defect.

                               A MINIMUM in rem, not a fixed height, for the same
                               reason Tabs uses one: at 200% text scale the label
                               is taller than 44px and the control has to grow
                               with it rather than clip. */
                            'shrink-0 min-h-11 rounded-autara-sm px-3 py-1.5 text-[12px] font-medium transition-colors',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]',
                            active
                                ? 'bg-[var(--surface-inverse)] text-[var(--text-on-inverse)]'
                                : 'bg-[var(--surface-elevated)] text-[var(--text-muted)] hover:text-[var(--text-strong)]',
                        )}
                    >
                        {o.label}
                    </button>
                )
            })}
        </div>
    )
}
