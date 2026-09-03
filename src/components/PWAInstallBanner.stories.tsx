import type { Meta, StoryObj } from '@storybook/react-vite'
import type { Decorator } from '@storybook/react-vite'
import * as React from 'react'
import { PWAInstallBanner } from './PWAInstallBanner'
import { ConsentBanner } from './ConsentBanner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './Dialog'
import { Button } from './Button'

/**
 * PWAInstallBanner — bottom-anchored "Add to home screen" affordance.
 *
 * READ THIS BEFORE JUDGING A STORY: the banner is `lg:hidden`, so it renders
 * NOTHING above the 1024px breakpoint. Every story below is pinned to a phone
 * viewport. On a desktop canvas an empty page is the correct output, not a
 * broken story.
 *
 * Its anti-nag rules (installed-already, 30-day dismiss TTL, 12s first-show
 * delay) also suppress it in Storybook, so each story clears the dismiss flag,
 * zeroes the delay and synthesises the `beforeinstallprompt` event Chrome
 * fires. That is the only stubbing — everything visible is the real component.
 *
 * The last three stories are the states AUTM-1018 fixed. They exist to be
 * looked at, in BOTH themes, not just to pass.
 */

const meta = {
    title: 'Molecules/PWAInstallBanner',
    component: PWAInstallBanner,
    parameters: {
        layout: 'fullscreen',
        viewport: { defaultViewport: 'phone' },
        docs: {
            description: {
                component:
                    'Bottom-anchored, mobile-only PWA install affordance. Two paths: Chrome (`beforeinstallprompt`) and iOS Safari (manual share + add). A named `region` landmark, not a dialog. Reserves its own space — body padding for scrolling content, `--pwa-install-banner-height` on `<html>` for fixed page chrome. Sits at `z-30`, under the Dialog/Sheet layer and under the consent banner.',
            },
        },
    },
} satisfies Meta<typeof PWAInstallBanner>

export default meta
type Story = StoryObj<typeof meta>

/* ── Story plumbing ─────────────────────────────────────────────────────── */

/** Chrome fires this after its own heuristics; Storybook never will. */
function synthesiseInstallPrompt() {
    const evt = new Event('beforeinstallprompt') as Event & {
        prompt: () => Promise<void>
        userChoice: Promise<{ outcome: string }>
    }
    evt.prompt = async () => {}
    evt.userChoice = Promise.resolve({ outcome: 'dismissed' })
    window.dispatchEvent(evt)
}

/** Clears the anti-nag flag and fires the prompt once the story has mounted. */
const installable: Decorator = (Story) => {
    React.useEffect(() => {
        window.localStorage.removeItem('autara.pwa.dismissedAt')
        const id = window.setTimeout(synthesiseInstallPrompt, 50)
        return () => window.clearTimeout(id)
    }, [])
    return <Story />
}

/** Filler with a real last element, so "is it covered?" is answerable. */
function PageBehind({ children }: { children?: React.ReactNode }) {
    return (
        <div className="min-h-[110vh] bg-[var(--background)] px-4 py-6">
            <p className="text-[0.6875rem] uppercase tracking-[0.22em] text-[var(--text-muted)]">
                Page content
            </p>
            <h1 className="mt-2 text-xl font-medium text-[var(--text-strong)]">
                Bookings
            </h1>
            <div className="mt-4 space-y-3">
                {Array.from({ length: 6 }, (_, i) => (
                    <div
                        key={i}
                        className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] p-4"
                    >
                        <p className="text-sm font-medium text-[var(--text-strong)]">
                            Full detail — Tuesday
                        </p>
                        <p className="text-sm text-[var(--text-muted)]">
                            Ferrari 296 GTB, Surry Hills
                        </p>
                    </div>
                ))}
            </div>
            {children}
        </div>
    )
}

/* ── Stories ────────────────────────────────────────────────────────────── */

export const Default: Story = {
    name: 'Chrome path — Install button',
    args: { firstShowDelayMs: 0 },
    decorators: [
        installable,
        (Story) => (
            <PageBehind>
                <Story />
            </PageBehind>
        ),
    ],
}

/**
 * The iOS Safari path. No `beforeinstallprompt` exists on that browser, so
 * there is nothing to call and the banner explains the manual gesture instead.
 * The user agent is overridden for the story, because the branch keys off it.
 */
export const IosSafari: Story = {
    name: 'iOS Safari path — manual instructions',
    args: { firstShowDelayMs: 0 },
    decorators: [
        (Story) => {
            const [ready, setReady] = React.useState(false)
            React.useEffect(() => {
                window.localStorage.removeItem('autara.pwa.dismissedAt')
                Object.defineProperty(window.navigator, 'userAgent', {
                    configurable: true,
                    get: () =>
                        'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
                })
                setReady(true)
            }, [])
            return (
                <PageBehind>{ready ? <Story /> : null}</PageBehind>
            )
        },
    ],
}

export const Customised: Story = {
    name: 'Customised copy (merchant app)',
    args: {
        appName: 'Autara Pro',
        eyebrow: 'For your phone',
        headline: 'Autara Pro on your home screen',
        body: 'Manage bookings without opening the browser.',
        installLabel: 'Add it',
        firstShowDelayMs: 0,
    },
    decorators: [
        installable,
        (Story) => (
            <PageBehind>
                <Story />
            </PageBehind>
        ),
    ],
}

/**
 * EDGE CASE — copy far past what any Autara app sends, at a phone width.
 *
 * The point is the cap. This banner's only dismiss controls sit at the TOP of
 * the panel, so an unbounded one pushes its own close button off the top of the
 * screen and the nag becomes permanent for the session. The copy scrolls inside
 * `max-h-[40vh]`; Install, Not now and the close button stay outside it and
 * stay reachable. Scroll the copy block to confirm.
 */
export const LongCopy: Story = {
    name: 'Edge case — copy that would otherwise outgrow the viewport',
    args: {
        appName: 'Autara',
        headline:
            'Autara Mobile Detailing Marketplace on your home screen, for faster bookings',
        body: 'Quick access, no app store, works offline. Your upcoming bookings, your messages with the detailer, your receipts and your saved vehicles are all one tap away, and the shortcut behaves like an app rather than a bookmark. Nothing is downloaded and nothing is installed from a store.',
        firstShowDelayMs: 0,
    },
    decorators: [
        installable,
        (Story) => (
            <PageBehind>
                <Story />
            </PageBehind>
        ),
    ],
}

/**
 * THE STATE THAT BROKE, #1 — a modal open while the banner is up.
 *
 * At `z-[55]` the banner painted OVER the Dialog at `z-50`, so a bottom-anchored
 * nag sat on top of a modal that had taken the screen. Reachable by nothing more
 * than leaving a page open for twelve seconds. At `z-30` the dialog and its
 * scrim cover the banner, which is what a modal is for.
 *
 * Check this one in dark as well as light: the scrim is `#0E0A1A/55` in both.
 */
export const UnderADialog: Story = {
    name: 'In context — a Dialog is open (z-order)',
    args: { firstShowDelayMs: 0 },
    decorators: [
        installable,
        (Story) => (
            <PageBehind>
                <Story />
                <Dialog open>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Verify your phone</DialogTitle>
                            <DialogDescription>
                                We sent a six digit code to +61 4XX XXX XXX.
                            </DialogDescription>
                        </DialogHeader>
                        <Button className="w-full">Continue</Button>
                    </DialogContent>
                </Dialog>
            </PageBehind>
        ),
    ],
}

/**
 * THE STATE THAT BROKE, #2 — the real consumer arrangement.
 *
 * customer-web mounts the consent notice and this banner in the same layout, so
 * a first-time visitor who browses for twelve seconds without answering cookies
 * gets both. Two things to look at:
 *
 *   1. They STACK. This banner rides on top of the consent notice via
 *      `CONSENT_BANNER_OFFSET` rather than overlapping it, and drops to the
 *      viewport edge the moment consent is answered.
 *   2. The page is padded by the SUM of the two, so the last card is still
 *      scrollable clear of both. Accept or Decline and watch the page give one
 *      banner's worth of space back while this one keeps its own — the case a
 *      second copy of the reservation effect got wrong.
 */
export const StackedWithConsent: Story = {
    name: 'In context — consent banner up too (space reservation)',
    args: { firstShowDelayMs: 0 },
    decorators: [
        installable,
        (Story) => {
            const [consent, setConsent] = React.useState(true)
            return (
                <PageBehind>
                    <div className="mt-3 rounded-2xl border border-dashed border-[var(--border-subtle)] p-4">
                        <p className="text-sm text-[var(--text-muted)]">
                            Last element on the page. Nothing should cover it.
                        </p>
                        <Button
                            className="mt-3 w-full"
                            onClick={() => setConsent(true)}
                        >
                            Continue
                        </Button>
                    </div>
                    <Story />
                    <ConsentBanner
                        open={consent}
                        onAccept={() => setConsent(false)}
                        onDecline={() => setConsent(false)}
                    >
                        We use cookies to measure how the site is used. See our{' '}
                        <a href="#cookies" className="underline">
                            Cookie Policy
                        </a>
                        .
                    </ConsentBanner>
                </PageBehind>
            )
        },
    ],
}
