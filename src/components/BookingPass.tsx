import type { ReactNode } from 'react'
import { cn } from '../lib/cn'
import { initialsOf } from '../lib/initials'
import { MediaFrame } from './MediaFrame'

/**
 * BookingPass: a booking as a pass (AUTM-1797, graduated from customer-web
 * under AUTM-1799).
 *
 * Apple Wallet, Delta's boarding pass and Fresha's voucher answer who, what
 * and when without a sentence. On brand-deep: the pro's face (their photo,
 * or their initials, decision 3 of 2026-10-09), their name and the service,
 * an action beside them (the 44px message disc), then a tear line with two
 * notches and `when` (a WhenBlock). One card per booking, on the signed-in
 * booking screen and the emailed link.
 *
 * The name is a plain anchor when `href` is given: the package never imports
 * a router (a full navigation to the pro's public page is fine). No shadow:
 * the deep fill is the edge. A query container, so WhenBlock steps its figure
 * down at very large text (rem follows the reader's text size).
 */
export interface BookingPassProps {
    /** The pro's trading name. */
    name: string
    /** Their photo; their initials on brand when there is none. */
    photo?: string | null
    /** The pro's page, a tap on their name. */
    href?: string | null
    /** The service: "Paint correction, single stage". */
    sub?: ReactNode
    /** Beside the pro: their message disc, when messaging is open. */
    action?: ReactNode
    /** Under the tear line: a WhenBlock. Omit for a booking whose time is said elsewhere. */
    when?: ReactNode
    /** Accessible name of the section. */
    label?: string
    /** `data-testid` on the section. */
    testId?: string
    /** `data-testid` on the service line. */
    subTestId?: string
    className?: string
}

export function BookingPass({
    name,
    photo,
    href,
    sub,
    action,
    when,
    label = 'Your booking',
    testId,
    subTestId,
    className,
}: BookingPassProps) {
    const nameClass =
        'm-0 text-[1.125rem] leading-tight font-bold text-[var(--on-deep)] no-underline [overflow-wrap:break-word]'
    return (
        <section
            aria-label={label}
            data-testid={testId}
            data-slot="booking-pass"
            className={cn(
                '@container flex min-w-0 flex-col gap-4 rounded-[1.75rem] bg-[var(--brand-deep)] px-[1.125rem] pt-4 pb-[1.125rem] text-[var(--on-deep)]',
                className,
            )}
        >
            <div className="flex min-w-0 items-center gap-3.5 @max-[20rem]:flex-wrap">
                {/* The initials disc is brand on the deep pass, so the face reads as a face. */}
                <MediaFrame
                    shape="round"
                    src={photo}
                    alt=""
                    initials={initialsOf(name)}
                    className="size-14 [--brand-deep:var(--brand)]"
                />
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    {href ? (
                        <a
                            href={href}
                            className={cn(
                                nameClass,
                                'inline-flex min-h-6 items-center self-start rounded-sm hover:underline hover:underline-offset-[0.2em] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--lime)]',
                            )}
                        >
                            {name}
                        </a>
                    ) : (
                        <p className={nameClass}>{name}</p>
                    )}
                    {sub ? (
                        <p
                            data-testid={subTestId}
                            className="m-0 text-[0.9375rem] leading-[1.35] text-[var(--on-deep-muted)] [overflow-wrap:break-word]"
                        >
                            {sub}
                        </p>
                    ) : null}
                </div>
                {action}
            </div>
            {when ? (
                <>
                    <span
                        aria-hidden
                        className="relative -mx-[1.125rem] block border-t-2 border-dashed border-[var(--hairline-deep)] before:absolute before:-top-[0.6875rem] before:-left-2.5 before:size-5 before:rounded-full before:bg-[var(--paper)] before:content-[''] after:absolute after:-top-[0.6875rem] after:-right-2.5 after:size-5 after:rounded-full after:bg-[var(--paper)] after:content-['']"
                    />
                    {when}
                </>
            ) : null}
        </section>
    )
}
