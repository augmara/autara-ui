"use client";

import * as React from 'react'
import { createPortal } from 'react-dom'
import { Button } from './Button'
import { GlassSurface } from './GlassSurface'
import { cn } from '../lib/cn'
import { useReservedBottomSpace } from '../lib/reserved-bottom-space'

/**
 * ConsentBanner — the bottom-anchored consent notice, and the space it takes.
 *
 * AUTM-852. This existed as two hand-maintained copies —
 * `autara-customer-web/src/components/CookieConsentManager.tsx` and
 * `autara-merchant-web/src/components/analytics/CookieConsentManager.tsx` —
 * and the SAME defect was found and fixed in each of them, six weeks apart:
 * a `position: fixed` overlay silently swallowing clicks on the page's
 * primary call to action (AUTM-787 on customer-web, AUTM-845 on
 * merchant-web, the second by hand-porting the first). Then both were
 * patched again. Four fixes, one component, because it was two files.
 *
 * ─── What this owns, and why ────────────────────────────────────────────
 *
 * The banner OWNS ITS OWN SPACE RESERVATION. That is the whole reason it is
 * a primitive rather than a layout. Two different things sit at the bottom
 * of a page and each needs a different answer, and every consumer that
 * re-derived them got one of the two wrong first:
 *
 *   1. CONTENT THAT SCROLLS — answered by padding `document.body` by the
 *      banner's measured height. AUTM-787/-845: on pages exactly as tall as
 *      the viewport there was no way out for the user, because the button
 *      could not be scrolled clear. Padding makes the page taller than the
 *      viewport, which both frees the control and lets the user scroll.
 *
 *   2. ANYTHING `position: fixed` — body padding does NOTHING for it.
 *      customer-web's booking wizard action bar (AUTM-839) is fixed, so the
 *      first fix left "Continue" rendered enabled underneath the banner on a
 *      375-wide phone; every tap landed on the cookie box. Those elements
 *      need the measurement itself, so it is published as a CSS custom
 *      property on `<html>` — `--consent-banner-height`, removed the moment
 *      consent is recorded. A fixed bar sets `bottom: CONSENT_BANNER_OFFSET`
 *      and rides above the banner, dropping back to the edge when it goes.
 *
 * Measured rather than hardcoded, because the banner reflows: its height
 * changes with viewport width and with text scaling. On a 375x812 phone it
 * measured 298px — 37% of the viewport — so it covers far more than its own
 * footprint suggests.
 *
 * The third failure mode is a MODAL DIALOG, which must be neither covered
 * nor blurred. That is the `z-40` below: one step under the library's
 * Dialog/Sheet overlay at `z-50`. At `z-50` the banner sat over a dialog's
 * buttons and its backdrop blur frosted the OTP boxes underneath
 * (AUTM-1000). Being lower also means Radix's modal `aria-hidden` covers
 * the banner, since it portals to `document.body` as a sibling.
 *
 * ─── The role, and why it is not `dialog` ───────────────────────────────
 *
 * Both copies claimed `role="dialog"` while being non-modal. That is a
 * screen-reader inaccuracy AND a test hazard, and it is the a11y half of
 * AUTM-852. `dialog` promises a window that has taken over: focus moved
 * into it, focus trapped, Escape closes, focus restored on close. This
 * banner does none of that, and should not — stealing focus on first paint
 * to announce a cookie notice is worse than the inaccuracy. It also made
 * `getByRole("dialog")` ambiguous in tests the moment a real dialog was on
 * screen, which is exactly the page where the overlap bugs lived.
 *
 * `region` is the honest answer: a perceivable section with an
 * author-specified purpose, which REQUIRES an accessible name (`label`,
 * always supplied) and is therefore reachable from any screen reader's
 * landmark list. Considered and rejected: `alertdialog` (modal, and this is
 * not urgent), `complementary` (a landmark for content complementing the
 * main content — site-wide consent chrome is not that), and `alert` /
 * `aria-live` (interrupts, and nothing here is time-sensitive).
 *
 * Keyboard: both actions are real `<button>`s, so they take Enter and Space
 * and carry the library's focus ring. The banner portals to the end of
 * `document.body`, so it is last in the tab order — conventional for
 * bottom-anchored chrome, and the reason the landmark name matters.
 *
 * ─── What deliberately stays in the consumer ────────────────────────────
 *
 * Analytics wiring. The two originals import `@next/third-parties`, which
 * is a genuine per-app concern and fails this package's own test — "if I
 * copied this file into another app, would it work?". `autara-ui` is also
 * consumed by merchant-mobile (Capacitor + Vite), where a Next import does
 * not resolve at all. So consent state, persistence, the tag and the
 * `consent update` call stay per-app; this component takes `open` and two
 * callbacks. Body copy is `children` for the same reason — the link to the
 * cookie policy is `next/link` in one app and an external `<a>` in the
 * other, and the library imports neither.
 */

/**
 * The CSS custom property the banner publishes its measured height on,
 * set on `<html>` while consent is pending and removed once it is answered.
 */
export const CONSENT_BANNER_HEIGHT_VAR = '--consent-banner-height'

/**
 * Ready-made value for any `position: fixed` element that must stay clear of
 * the banner: `style={{ bottom: CONSENT_BANNER_OFFSET }}`. Falls back to
 * `0px`, so the element sits at the viewport edge whenever no banner is up —
 * which is every page load after the visitor has answered.
 */
export const CONSENT_BANNER_OFFSET = `var(${CONSENT_BANNER_HEIGHT_VAR}, 0px)`

export interface ConsentBannerProps {
    /**
     * Whether the banner is shown. The consumer owns consent state and its
     * persistence — see the note above on what stays per-app.
     */
    open: boolean
    /** The visitor accepted. Persist and update the tag here. */
    onAccept: () => void
    /** The visitor declined. Persist and update the tag here. */
    onDecline: () => void
    /**
     * Body copy, including the app's own link to its cookie policy. Required
     * on purpose: a consent notice with no policy link is a legal problem,
     * and a library default would be one app's copy shown on another.
     */
    children: React.ReactNode
    acceptLabel?: string
    declineLabel?: string
    /** Accessible name for the landmark. */
    label?: string
    /**
     * Pad `document.body` by the banner's height so page content that
     * scrolls is not covered. Turn off only if the app scrolls inside its
     * own container rather than the document — the CSS custom property is
     * published either way.
     */
    reserveBodySpace?: boolean
    /** Root `data-testid`; the buttons take `-accept` and `-decline`. */
    testId?: string
    className?: string
}

/* The measurement, the `<html>` custom property and the body padding all live
 * in `../lib/reserved-bottom-space`. It moved out of this file in AUTM-1018,
 * when `PWAInstallBanner` needed the same behaviour: `body.style.paddingBottom`
 * is one slot and both banners can be up at once, so a second private copy of
 * this effect would have had each one hand back the other's value on unmount.
 * The hook keeps the padding as the sum of the live reservations. */

export function ConsentBanner({
    open,
    onAccept,
    onDecline,
    children,
    acceptLabel = 'Accept',
    declineLabel = 'Decline',
    label = 'Cookie consent',
    reserveBodySpace = true,
    testId = 'consent-banner',
    className,
}: ConsentBannerProps) {
    const [panel, setPanel] = React.useState<HTMLDivElement | null>(null)
    useReservedBottomSpace(panel, CONSENT_BANNER_HEIGHT_VAR, reserveBodySpace)

    /* SSR-safe portal: `document` does not exist on the server, and the
     * banner is client-only anyway (consent lives in browser storage). */
    const [mounted, setMounted] = React.useState(false)
    React.useEffect(() => setMounted(true), [])

    if (!open || !mounted) return null

    return createPortal(
        <div
            ref={setPanel}
            role="region"
            aria-label={label}
            data-testid={testId}
            /* z-40 — one step UNDER the library's Dialog and Sheet overlays
             * at z-50. See AUTM-1000 in the note above: at z-50 this sat over
             * a dialog's buttons and blurred its inputs. Portalled to
             * document.body so a transformed, contained or backdrop-filtered
             * ancestor cannot capture the fixed positioning. */
            className={cn(
                'fixed inset-x-0 bottom-0 z-40 px-4 pt-4 sm:px-6 sm:pt-6',
                className
            )}
            /* Clears the iOS home indicator. Part of the measured height, so
             * the reservation stays correct. */
            style={{
                paddingBottom: 'calc(env(safe-area-inset-bottom) + 1rem)',
            }}
        >
            {/* tone="strong" — this carries body text over arbitrary page
                content rather than over the gradient ground, which is the
                harder contrast case the strong fill exists for. */}
            <GlassSurface tone="strong" className="mx-auto max-w-3xl p-5 sm:p-6">
                {/* The copy is capped and scrolls, and this is a 200%
                    text-scale requirement rather than a nicety. Measured on a
                    390x760 phone with a 32px root: the banner grew from 281px
                    to 879px — TALLER THAN THE VIEWPORT — so reserving its full
                    height pushed the page's fixed action bar clean off the top
                    of the screen and "Continue" became unreachable a second
                    time, by the opposite mechanism to the one this component
                    was written to fix. Capping the copy bounds the banner
                    without ever moving the two actions out of reach: they sit
                    below the scroller, not inside it.

                    `tabIndex` because a scrollable region has to be operable
                    from the keyboard (WCAG 2.1.1). Chrome makes overflow
                    containers focusable on its own now; Safari does not. */}
                <div
                    tabIndex={0}
                    className="max-h-[40vh] overflow-y-auto overscroll-contain text-sm leading-relaxed text-[var(--text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
                >
                    {children}
                </div>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <Button
                        onClick={onAccept}
                        data-testid={`${testId}-accept`}
                        className="w-full sm:w-auto"
                    >
                        {acceptLabel}
                    </Button>
                    {/* variant="glass", not "outline": rule 4 bans outlined
                        buttons, and an opaque `--surface` fill would punch a
                        white slab through the panel. Same size and radius as
                        Accept — the two choices carry equal weight. */}
                    <Button
                        variant="glass"
                        onClick={onDecline}
                        data-testid={`${testId}-decline`}
                        className="w-full sm:w-auto"
                    >
                        {declineLabel}
                    </Button>
                </div>
            </GlassSurface>
        </div>,
        document.body
    )
}

ConsentBanner.displayName = 'ConsentBanner'
