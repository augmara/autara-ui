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
 * Grammar: canvas v44's band card (AUTM-1594, see the render below). It was
 * a hairline panel with an intent disc; the sheet retires both. Every value
 * is a token.
 *
 * Semantics: `error` is `role="alert"` (assertive, interrupts); everything
 * else is `role="status"` (polite). A success line must not shout. `role`
 * overrides it (AUTM-1472).
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
    /**
     * AUTM-1472 — the live-region role. Defaults to `alert` for an error and
     * `status` otherwise. Pass `alert` for a warning that must interrupt, or
     * `none` when the consumer already wraps the alert in its own live
     * region, so the message is not announced twice.
     */
    role?: 'alert' | 'status' | 'none'
}

/*
 * AUTM-1594 — canvas v44 "Inline alert": a band card, 16px radius, 14 x 16 in,
 * a 16px Bold title over a 15px body at 72% ink, 4px apart. No icon disc and
 * no outline: the words carry it. An error says so in the danger colour (the
 * title, or the body when there is no title), because band alone would
 * read as a note.
 */
export function InlineAlert({
    tone = 'info',
    title,
    children,
    action,
    testId,
    className,
    role,
}: InlineAlertProps) {
    const isError = tone === 'error'
    const resolvedRole = role ?? (isError ? 'alert' : 'status')
    return (
        <div
            role={resolvedRole === 'none' ? undefined : resolvedRole}
            data-testid={testId}
            data-tone={tone}
            className={cn('flex flex-col gap-1 rounded-2xl bg-[var(--band)] px-4 py-3.5', className)}
        >
            {title ? (
                <p
                    className={cn(
                        'text-base leading-snug font-bold',
                        isError ? 'text-[var(--danger)]' : 'text-[var(--text-strong)]',
                    )}
                >
                    {title}
                </p>
            ) : null}
            <div
                className={cn(
                    'text-[0.9375rem] leading-normal',
                    isError && !title ? 'text-[var(--danger)]' : 'text-[var(--text-muted)]',
                )}
            >
                {children}
            </div>
            {action ? <div className="mt-1.5">{action}</div> : null}
        </div>
    )
}
