"use client";

import * as React from 'react'

/**
 * PWAInstallBanner — bottom-anchored "Add to home screen" affordance.
 *
 * Two paths:
 *   - Chrome / Android: listens for `beforeinstallprompt`, stashes the
 *     event, and on tap calls `event.prompt()`.
 *   - iOS Safari (no `beforeinstallprompt`): renders manual
 *     instructions ("Tap Share → Add to Home Screen").
 *
 * Anti-nag rules:
 *   - skip if already installed (display-mode: standalone)
 *   - skip if dismissed within `dismissTtlMs` (default 30 days)
 *   - wait `firstShowDelayMs` (default 12s) before surfacing
 *
 * Copy is parameterised so every Autara app can mount the same
 * banner. The "Add to home screen" eyebrow stays for consistency.
 *
 * Promoted from autara-customer-web 2026-05-30 (AUTAA-UI-007). The
 * customer-web original was Iconify-coupled; this version inlines the
 * Solar-style glyphs as SVGs (no icon dependency).
 */

const DEFAULT_STORAGE_KEY = 'autara.pwa.dismissedAt'
const DEFAULT_DISMISS_TTL_MS = 30 * 24 * 3600 * 1000
const DEFAULT_FIRST_SHOW_DELAY_MS = 12_000

type BeforeInstallPromptEvent = Event & {
    prompt: () => Promise<void>
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export interface PWAInstallBannerProps {
    /** App name shown in the banner copy. */
    appName?: string
    /** Eyebrow above the headline. Defaults to "Add to home screen". */
    eyebrow?: string
    /** Headline. Defaults to `"${appName} on your home screen"`. */
    headline?: string
    /** Body copy (Chrome path). */
    body?: string
    /** Body copy (iOS Safari manual-instructions path). */
    iosBody?: React.ReactNode
    /** Install button label. */
    installLabel?: string
    /** Dismiss button label. */
    dismissLabel?: string
    /** localStorage key for the anti-nag flag. */
    storageKey?: string
    /** TTL after dismiss before the banner can resurface. */
    dismissTtlMs?: number
    /** Delay after first paint before the banner is shown. */
    firstShowDelayMs?: number
}

/* ── Inlined Solar Linear glyphs ────────────────────────────────────── */

const SmartphoneIcon = () => (
    <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        aria-hidden
    >
        <rect
            x="7"
            y="2"
            width="10"
            height="20"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.6"
        />
        <path
            d="M10 18h4"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
        />
    </svg>
)

const ShareLinearGlyph = () => (
    <svg
        viewBox="0 0 24 24"
        width="16"
        height="16"
        fill="none"
        aria-hidden
        className="inline-block align-middle"
    >
        <path
            d="M12 3v12M8 7l4-4 4 4"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M5 11v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
        />
    </svg>
)

const CloseGlyph = () => (
    <svg
        viewBox="0 0 24 24"
        width="16"
        height="16"
        fill="none"
        aria-hidden
    >
        <rect
            x="3.5"
            y="3.5"
            width="17"
            height="17"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.6"
        />
        <path
            d="m9 9 6 6M15 9l-6 6"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
        />
    </svg>
)

export function PWAInstallBanner({
    appName = 'Autara',
    eyebrow = 'Add to home screen',
    headline,
    body = 'Quick access, no app store, works offline.',
    iosBody,
    installLabel = 'Install',
    dismissLabel = 'Not now',
    storageKey = DEFAULT_STORAGE_KEY,
    dismissTtlMs = DEFAULT_DISMISS_TTL_MS,
    firstShowDelayMs = DEFAULT_FIRST_SHOW_DELAY_MS,
}: PWAInstallBannerProps) {
    const [visible, setVisible] = React.useState(false)
    const [deferred, setDeferred] =
        React.useState<BeforeInstallPromptEvent | null>(null)
    const [iosManual, setIosManual] = React.useState(false)

    const resolvedHeadline = headline ?? `${appName} on your home screen`
    const resolvedIosBody = iosBody ?? (
        <>
            Tap <ShareLinearGlyph /> Share, then{' '}
            <strong>Add to Home Screen</strong>. Quick access, no app store.
        </>
    )

    React.useEffect(() => {
        if (typeof window === 'undefined') return

        if (window.matchMedia('(display-mode: standalone)').matches) return
        if (
            'standalone' in window.navigator &&
            (window.navigator as Navigator & { standalone?: boolean })
                .standalone
        ) {
            return
        }

        const raw = window.localStorage.getItem(storageKey)
        if (raw) {
            const t = Number.parseInt(raw, 10)
            if (Number.isFinite(t) && Date.now() - t < dismissTtlMs) return
        }

        const onBeforeInstall = (e: Event) => {
            e.preventDefault()
            setDeferred(e as BeforeInstallPromptEvent)
            window.setTimeout(() => setVisible(true), firstShowDelayMs)
        }
        window.addEventListener('beforeinstallprompt', onBeforeInstall)

        const ua = window.navigator.userAgent
        const isIos = /iPhone|iPad|iPod/i.test(ua)
        const isSafari = /Safari/i.test(ua) && !/CriOS|FxiOS|EdgiOS/i.test(ua)
        if (isIos && isSafari) {
            setIosManual(true)
            window.setTimeout(() => setVisible(true), firstShowDelayMs)
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', onBeforeInstall)
        }
    }, [storageKey, dismissTtlMs, firstShowDelayMs])

    function dismiss() {
        setVisible(false)
        try {
            window.localStorage.setItem(storageKey, String(Date.now()))
        } catch {
            /* localStorage can throw in private mode; close visually. */
        }
    }

    async function install() {
        if (!deferred) return
        await deferred.prompt()
        await deferred.userChoice
        setDeferred(null)
        setVisible(false)
        try {
            window.localStorage.setItem(storageKey, String(Date.now()))
        } catch {
            /* ignore */
        }
    }

    if (!visible) return null

    return (
        <div
            role="dialog"
            aria-label={`Add ${appName} to your home screen`}
            className="fixed inset-x-0 bottom-0 z-[55] px-4 sm:px-6 lg:hidden"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 0.75rem)' }}
        >
            <div className="mx-auto max-w-md rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] p-4">
                <div className="flex items-start gap-3">
                    <span
                        aria-hidden
                        className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--color-autara-purple)]/10 text-[var(--color-autara-purple)]"
                    >
                        <SmartphoneIcon />
                    </span>
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--color-autara-purple)]/80 mb-1.5">
                            {eyebrow}
                        </p>
                        <h3 className="text-[15px] font-bold text-[var(--text-strong)] tracking-[-0.005em] leading-snug">
                            {resolvedHeadline}
                        </h3>
                        <p className="mt-1 text-[12.5px] text-[var(--text-muted)] leading-relaxed">
                            {iosManual ? resolvedIosBody : body}
                        </p>
                        <div className="mt-3 flex items-center gap-2">
                            {!iosManual && deferred ? (
                                <button
                                    type="button"
                                    onClick={install}
                                    className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-[var(--color-autara-purple)] px-4 text-[12.5px] font-medium text-white transition-colors hover:brightness-110"
                                >
                                    {installLabel}
                                    <span
                                        aria-hidden
                                        className="text-[13px] leading-none"
                                    >
                                        ↗
                                    </span>
                                </button>
                            ) : null}
                            <button
                                type="button"
                                onClick={dismiss}
                                className="inline-flex h-9 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-white px-4 text-[12.5px] font-medium text-[var(--text-muted)] hover:text-[var(--text-strong)] hover:border-[var(--color-autara-purple)]/30 transition-colors"
                            >
                                {dismissLabel}
                            </button>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={dismiss}
                        aria-label="Dismiss"
                        className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[var(--text-subtle)] hover:bg-[var(--surface-warm)] hover:text-[var(--text-strong)] transition-colors"
                    >
                        <CloseGlyph />
                    </button>
                </div>
            </div>
        </div>
    )
}

PWAInstallBanner.displayName = 'PWAInstallBanner'
