"use client";

import * as React from 'react'

/**
 * useReservedBottomSpace — the space a bottom-anchored non-modal banner takes,
 * owned by the banner rather than re-derived by every consumer.
 *
 * AUTM-852 established the mechanism on `ConsentBanner`; AUTM-1018 moved it
 * here so `PWAInstallBanner` uses the same one instead of a second copy. Two
 * copies is precisely the history `ConsentBanner`'s doc comment records — the
 * same overlap defect was found and fixed four times because the component was
 * two files.
 *
 * ─── The two answers, and why both are needed ───────────────────────────
 *
 *   1. CONTENT THAT SCROLLS — answered by padding `document.body` by the
 *      banner's measured height. On a page exactly as tall as the viewport
 *      there is otherwise no way out: the covered control cannot be scrolled
 *      clear (AUTM-787 / -845).
 *
 *   2. ANYTHING `position: fixed` — body padding does nothing for it, so the
 *      measurement is published as a CSS custom property on `<html>` and
 *      removed the moment the banner goes. A fixed bar sets
 *      `bottom: var(--the-banner-height, 0px)` and rides above it
 *      (AUTM-839).
 *
 * Measured rather than hardcoded, because these banners reflow with viewport
 * width and with text scaling.
 *
 * ─── Why a module-level registry ────────────────────────────────────────
 *
 * `body.style.paddingBottom` is ONE slot and both banners can be up at once:
 * the consent notice shows on first paint and the install banner surfaces 12s
 * later, so a first-time mobile visitor who has not answered consent sees
 * both. With a per-component effect the second to mount captures the first's
 * padding as "what the page already had", and whichever unmounts first hands
 * back the wrong value — accept the cookie banner and the install banner's
 * reservation silently disappears while it is still on screen, then a dead gap
 * is left at the bottom for the rest of the session. The registry makes the
 * padding the SUM of the live reservations and restores the page's own value
 * only when the last one goes, so unmount order stops mattering.
 *
 * Each banner still publishes its OWN height variable — the sum is only the
 * body padding. A fixed bar that must clear every banner uses
 * `BOTTOM_CHROME_OFFSET` below.
 */

interface Reservation {
    /** Last measured height in px. */
    height: number
    /** Whether this banner asked for document-level padding. */
    padBody: boolean
}

/**
 * Live reservations, keyed by an identity unique to one mounted banner.
 *
 * Module state is the point: the thing being coordinated (`document.body`) is
 * module-global too. The known limit is two copies of this package loaded into
 * one page, which would give two registries — the same limit every singleton
 * in the library has, and not a case any Autara consumer produces.
 */
const reservations = new Map<object, Reservation>()

/**
 * The page's own `padding-bottom`, captured when the FIRST reservation lands
 * and handed back when the LAST one goes. Null while nothing is reserved.
 *
 * Remembering it rather than blanking it is deliberate: both pre-AUTM-852
 * copies reset to `""` on cleanup, which deletes a padding the app had set for
 * its own reasons.
 */
let pagePaddingBottom: string | null = null

function syncBodyPadding() {
    if (typeof document === 'undefined') return
    const { body } = document

    let total = 0
    let anyPadding = false
    reservations.forEach((entry) => {
        if (!entry.padBody) return
        anyPadding = true
        total += entry.height
    })

    if (!anyPadding) {
        if (pagePaddingBottom !== null) {
            body.style.paddingBottom = pagePaddingBottom
            pagePaddingBottom = null
        }
        return
    }

    if (pagePaddingBottom === null) pagePaddingBottom = body.style.paddingBottom
    body.style.paddingBottom = `${total}px`
}

/**
 * The offset for a `position: fixed` element that must clear EVERY
 * bottom-anchored banner in the library, whichever of them happen to be up.
 * Each term falls back to `0px`, so the element sits at the viewport edge once
 * they are all answered — which is every page load after the first.
 *
 * Use this rather than one banner's own offset when the page cannot know which
 * banners are showing. A booking wizard's action bar clearing only the consent
 * notice is still buried by the install banner.
 */
export const BOTTOM_CHROME_OFFSET =
    'calc(var(--consent-banner-height, 0px) + var(--pwa-install-banner-height, 0px))'

/**
 * Publish the element's measured height, reserve document space for it, and
 * give both back on unmount.
 *
 * Takes the NODE rather than a ref, because these banners portal: the element
 * is only in the DOM on a later render than the one that mounts the component,
 * and an effect keyed on a ref object would never re-run to see it. A callback
 * ref makes the element the dependency, which is what it actually is.
 */
export function useReservedBottomSpace(
    node: HTMLElement | null,
    heightVar: string,
    reserveBodySpace: boolean
) {
    React.useEffect(() => {
        if (!node || typeof document === 'undefined') return

        const root = document.documentElement
        const key = {}
        const entry: Reservation = { height: 0, padBody: reserveBodySpace }
        reservations.set(key, entry)

        const apply = () => {
            entry.height = node.offsetHeight
            root.style.setProperty(heightVar, `${entry.height}px`)
            syncBodyPadding()
        }
        apply()

        /* The banner reflows on resize and on text scaling, and ResizeObserver
         * catches both. Without it the reserved space is correct only at the
         * width the page happened to load at. Guarded because it is absent in
         * some SSR/test environments. */
        const observer =
            typeof ResizeObserver === 'undefined'
                ? null
                : new ResizeObserver(apply)
        observer?.observe(node)

        /* Belt and braces on top of the observer, for two reasons.
         *
         * ResizeObserver delivers on the frame loop, so anything that
         * throttles rAF can defer its callback and leave the reserved space
         * stale after a viewport change — seen for real while verifying
         * AUTM-787 in a debug browser pane.
         *
         * And a banner that is `lg:hidden` stops being rendered at all above
         * the breakpoint. A non-rendered element is skipped by
         * ResizeObserver, so crossing the breakpoint is a viewport change the
         * observer may never report; `resize` is what zeroes the reservation
         * on the way up and restores it on the way down. A double apply is
         * idempotent. */
        window.addEventListener('resize', apply)

        return () => {
            observer?.disconnect()
            window.removeEventListener('resize', apply)
            reservations.delete(key)
            /* Give the space straight back the moment the banner is answered,
             * or the page keeps a dead gap at the bottom for the rest of the
             * session and every fixed bar stays lifted off the edge. */
            root.style.removeProperty(heightVar)
            syncBodyPadding()
        }
    }, [node, heightVar, reserveBodySpace])
}
