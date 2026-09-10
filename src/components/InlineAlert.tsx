import type { ReactNode } from 'react'
import { cn } from '../lib/cn'

/**
 * InlineAlert — the one way to say something happened, inline.
 *
 * A form error under its submit, a success line after a save, a warning
 * above a field, an info note beside a choice. customer-web had seven
 * visual treatments of an error across three palettes before this existed
 * (AUTM-1185); every one of them is this now.
 *
 * Grammar (the same call ErrorCard and Badge made): a hairline panel on
 * `--surface` with the tone carried by a SOLID intent disc and a hairline
 * border in the intent colour. Solid, never a pastel tint, so both themes
 * read. Every value is a token.
 *
 * Semantics: `error` is `role="alert"` (assertive, interrupts); everything
 * else is `role="status"` (polite). A success line must not shout.
 *
 * `action` is a slot for the one thing the reader can do about it: a retry
 * button, a "sign in with email" switch, a link to the profile. Keep it to
 * one control; two is a decision the alert should not be asking for.
 */
export type InlineAlertTone = 'info' | 'success' | 'warning' | 'error'

export interface InlineAlertProps {
    tone?: InlineAlertTone
    /** Short headline. Optional; a one-line alert is just `children`. */
    title?: string
    /** The body copy: specific and recoverable, never "Something went wrong". */
    children: ReactNode
    /** One control the reader can act with. */
    action?: ReactNode
    /** `data-testid` on the root, so a spec can assert the alert itself. */
    testId?: string
    className?: string
}

const TONE: Record<InlineAlertTone, { fill: string; border: string }> = {
    info: {
        fill: 'bg-[var(--color-autara-info)]',
        border: 'border-[var(--color-autara-info)]/30',
    },
    success: {
        fill: 'bg-[var(--color-autara-success)]',
        border: 'border-[var(--color-autara-success)]/30',
    },
    warning: {
        fill: 'bg-[var(--color-autara-warning)]',
        border: 'border-[var(--color-autara-warning)]/35',
    },
    error: {
        fill: 'bg-[var(--color-autara-error)]',
        border: 'border-[var(--color-autara-error)]/30',
    },
}

/** Solar Bold glyphs — rounded caps, 2.4 stroke on a 24 viewBox. */
function ToneGlyph({ tone }: { tone: InlineAlertTone }) {
    const common = {
        'aria-hidden': true,
        viewBox: '0 0 24 24',
        width: 14,
        height: 14,
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 2.6,
        strokeLinecap: 'round' as const,
        strokeLinejoin: 'round' as const,
    }
    switch (tone) {
        case 'success':
            return (
                <svg {...common}>
                    <path d="m5 12.5 4.5 4.5L19 7.5" />
                </svg>
            )
        case 'error':
            return (
                <svg {...common}>
                    <path d="M7 7l10 10M17 7 7 17" />
                </svg>
            )
        case 'warning':
            return (
                <svg {...common}>
                    <path d="M12 6.5v7" />
                    <path d="M12 17.5h.01" />
                </svg>
            )
        default:
            return (
                <svg {...common}>
                    <path d="M12 10.5v7" />
                    <path d="M12 6.5h.01" />
                </svg>
            )
    }
}

export function InlineAlert({
    tone = 'info',
    title,
    children,
    action,
    testId,
    className,
}: InlineAlertProps) {
    const t = TONE[tone]
    return (
        <div
            role={tone === 'error' ? 'alert' : 'status'}
            data-testid={testId}
            data-tone={tone}
            className={cn(
                'rounded-autara border bg-[var(--surface)] px-3.5 py-3',
                t.border,
                className,
            )}
        >
            <div className="flex items-start gap-3">
                <span
                    aria-hidden
                    className={cn(
                        'mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full text-white',
                        t.fill,
                    )}
                >
                    <ToneGlyph tone={tone} />
                </span>
                <div className="min-w-0 flex-1">
                    {title ? (
                        <p className="text-sm font-bold text-[var(--text-strong)]">{title}</p>
                    ) : null}
                    <div
                        className={cn(
                            'text-sm text-[var(--text-muted)]',
                            title && 'mt-0.5',
                        )}
                    >
                        {children}
                    </div>
                    {action ? <div className="mt-2.5">{action}</div> : null}
                </div>
            </div>
        </div>
    )
}
