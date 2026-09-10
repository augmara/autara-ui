/**
 * PolicyTimeline — the tiers of a policy over a bar, with the one that
 * applies right now lit.
 *
 * Graduated from autara-customer-web under AUTM-1221 (plan item U5), where it
 * sits beside the refund on the cancellation panel: the customer reads which
 * tier they are in instead of working it out from the hours and the clock.
 *
 * A vertical list under 640px, because four labels cannot share 300px, and a
 * row of columns above it. Presentational and server-safe: no hooks, no
 * client boundary, so a server component can render it.
 */
export interface PolicyTimelineStep {
    label: string
    value: string
    /** Exactly one step should carry this. */
    current?: boolean
}

export interface PolicyTimelineProps {
    steps: PolicyTimelineStep[]
    /** Accessible name for the list. Default "Cancellation policy". */
    label?: string
    testId?: string
    className?: string
}

export function PolicyTimeline({
    steps,
    label = 'Cancellation policy',
    testId,
    className = '',
}: PolicyTimelineProps) {
    return (
        <ol
            aria-label={label}
            data-testid={testId}
            className={`flex flex-col gap-2 sm:grid sm:gap-3 ${className}`}
            style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}
        >
            {steps.map((step) => {
                const on = step.current === true
                return (
                    <li
                        key={step.label}
                        aria-current={on ? 'step' : undefined}
                        className="flex min-w-0 gap-3 sm:block"
                    >
                        {/* The bar: a rule on a phone, a segment above. Solid
                            purple when it applies, hairline when it does not.
                            Colour is never the only signal, the sr-only line
                            below says which one is live. */}
                        <span
                            aria-hidden
                            className={`w-1 shrink-0 self-stretch rounded-autara-sm sm:h-2 sm:w-auto ${
                                on
                                    ? 'bg-[var(--color-autara-purple)]'
                                    : 'bg-[var(--border-subtle)]'
                            }`}
                        />
                        <div className="min-w-0 sm:mt-2">
                            <p
                                className={`text-xs leading-snug ${
                                    on
                                        ? 'font-medium text-[var(--text-strong)]'
                                        : 'text-[var(--text-muted)]'
                                }`}
                            >
                                {step.label}
                            </p>
                            <p
                                className={`text-sm font-medium tabular-nums ${
                                    on ? 'text-[var(--text-strong)]' : 'text-[var(--text-muted)]'
                                }`}
                            >
                                {step.value}
                                {on ? <span className="sr-only"> (applies now)</span> : null}
                            </p>
                        </div>
                    </li>
                )
            })}
        </ol>
    )
}
