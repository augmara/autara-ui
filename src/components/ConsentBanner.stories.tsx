import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'
import {
    ConsentBanner,
    CONSENT_BANNER_OFFSET,
} from './ConsentBanner'
import { Button } from './Button'
import { GradientGround } from './GlassSurface'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from './Dialog'

/**
 * ConsentBanner (AUTM-852) — the bottom-anchored consent notice, and the
 * space it takes.
 *
 * These stories exist to make the SPACE RESERVATION visible, because that is
 * the part that was got wrong four times across two hand-maintained copies.
 * "In context — fixed action bar" and "Regression" below are the same page
 * with one line different; put them side by side and the bug is obvious.
 *
 * The banner portals to `document.body` and pins to the bottom of the
 * Storybook canvas, so give each story enough page to scroll. Note that in
 * Docs view several stories are mounted at once and each publishes its own
 * height onto the same `<html>` — open a story in Canvas to read the
 * reservation honestly.
 */
const meta = {
    title: 'Molecules/ConsentBanner',
    component: ConsentBanner,
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component:
                    'Non-modal, bottom-anchored consent notice that owns its own space reservation: it pads `document.body` for content that scrolls, and publishes its measured height as `--consent-banner-height` for anything `position: fixed`. Analytics wiring and consent persistence stay in the consuming app — this takes `open` plus an accept and a decline callback.',
            },
        },
    },
    /* Required props, declared once so each story can use `render` without
       restating them. Every story below drives the banner through the
       `Consent` wrapper, which owns the open state — these are the type
       floor, not the values that render. */
    args: {
        open: true,
        onAccept: () => {},
        onDecline: () => {},
        children: null,
    },
} satisfies Meta<typeof ConsentBanner>

export default meta
type Story = StoryObj<typeof meta>

/** The copy both apps ship, with the policy link the consumer owns. */
const COPY = (
    <>
        We use cookies and analytics tools to understand how you use our site
        and improve it. By clicking &ldquo;Accept&rdquo;, you consent to our
        use of analytics cookies. You can learn more in our{' '}
        <a
            href="#cookie-policy"
            className="font-medium text-[var(--text-strong)] underline underline-offset-2"
        >
            Cookie Policy
        </a>
        .
    </>
)

/**
 * Wires the banner to real state so Accept and Decline actually dismiss it,
 * and offers a way back — otherwise every story is one click from empty.
 */
function Consent({
    children,
    ...props
}: Partial<React.ComponentProps<typeof ConsentBanner>>) {
    const [open, setOpen] = React.useState(true)
    return (
        <>
            {!open && (
                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    className="fixed right-4 top-4 z-[60] rounded-autara-sm bg-[var(--neutral-fill)] px-3 py-2 text-[0.8125rem] font-medium text-[var(--on-neutral)]"
                >
                    Show the banner again
                </button>
            )}
            <ConsentBanner
                open={open}
                onAccept={() => setOpen(false)}
                onDecline={() => setOpen(false)}
                {...props}
            >
                {children ?? COPY}
            </ConsentBanner>
        </>
    )
}

/** Filler page content, so the body padding has something to push. */
function PageBody({ title, lines = 6 }: { title: string; lines?: number }) {
    return (
        <div className="mx-auto max-w-3xl px-6 py-10">
            <h1 className="text-2xl font-medium text-[var(--text-strong)]">
                {title}
            </h1>
            {Array.from({ length: lines }).map((_, i) => (
                <p
                    key={i}
                    className="mt-4 text-sm leading-relaxed text-[var(--text-muted)]"
                >
                    Page content. Scroll to the bottom: the last line stays
                    reachable because the banner pads the document by its own
                    measured height rather than floating over whatever is
                    underneath it.
                </p>
            ))}
            <p className="mt-4 text-sm font-medium text-[var(--text-strong)]">
                This is the last line on the page. It must not be covered.
            </p>
        </div>
    )
}

export const Default: Story = {
    name: 'Default',
    render: () => (
        <>
            <GradientGround className="min-h-screen">
                <PageBody title="Cookie consent" />
            </GradientGround>
            <Consent />
        </>
    ),
}

/**
 * THE STORY THIS COMPONENT EXISTS FOR.
 *
 * A `position: fixed` action bar — customer-web's booking wizard (AUTM-839)
 * is one — ignores body padding entirely. It consumes the published height
 * instead: `style={{ bottom: CONSENT_BANNER_OFFSET }}`. Click Continue with
 * the banner up; then Decline and watch the bar drop back to the edge,
 * because the custom property is removed the moment consent is answered.
 *
 * Read it at the iPhone SE viewport (375x667) — that is where the banner
 * takes nearly half the screen and where both original bugs were found.
 */
export const InContextFixedActionBar: Story = {
    name: 'In context — fixed action bar rides above the banner',
    render: () => {
        const [clicks, setClicks] = React.useState(0)
        return (
            <>
                <GradientGround className="min-h-screen">
                    <PageBody title="Step 2 of 3 — choose a time" lines={4} />
                </GradientGround>
                {/* A SIBLING of the ground, not a child: `.gradient-ground >
                    *` sets `position: relative` on every direct child, which
                    ties with Tailwind's `.fixed` and wins on source order. A
                    fixed bar nested inside the ground silently stops being
                    fixed. Filed separately; the banner itself is immune
                    because it portals to document.body. */}
                <div
                    data-testid="wizard-action-bar"
                    className="fixed inset-x-0 z-30 border-t border-[var(--border-subtle)] bg-[var(--surface)]"
                    style={{ bottom: CONSENT_BANNER_OFFSET }}
                >
                    <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
                        <Button variant="ghost">Back</Button>
                        <Button onClick={() => setClicks((c) => c + 1)}>
                            Continue{clicks > 0 ? ` (${clicks})` : ''}
                        </Button>
                    </div>
                </div>
                <Consent />
            </>
        )
    },
}

/**
 * The same page with the bar pinned to `bottom: 0` — the shipped bug, kept
 * as a story so the fix has something to be compared against.
 *
 * "Continue" renders enabled and looks normal, and every click lands on the
 * banner. Nothing tells the user why. That is AUTM-787 on customer-web and
 * AUTM-845 on merchant-web, found six weeks apart in two copies of one
 * component.
 */
export const RegressionActionBarUnderBanner: Story = {
    name: 'Regression — the bug this replaces (bar pinned to bottom: 0)',
    render: () => {
        const [clicks, setClicks] = React.useState(0)
        return (
            <>
                <GradientGround className="min-h-screen">
                    <PageBody title="Step 2 of 3 — choose a time" lines={4} />
                </GradientGround>
                <div
                    data-testid="wizard-action-bar"
                    className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--border-subtle)] bg-[var(--surface)]"
                >
                    <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
                        <Button variant="ghost">Back</Button>
                        <Button onClick={() => setClicks((c) => c + 1)}>
                            Continue{clicks > 0 ? ` (${clicks})` : ''}
                        </Button>
                    </div>
                </div>
                <Consent />
            </>
        )
    },
}

/**
 * The third failure mode: a modal dialog must be neither covered nor
 * blurred. The banner sits at `z-40`, one step under the Dialog overlay at
 * `z-50`, so the dialog's buttons stay clickable and its inputs stay sharp.
 *
 * At `z-50` — where both copies shipped until AUTM-1000 — the banner sat
 * over the dialog and its backdrop blur frosted the OTP boxes underneath.
 */
export const UnderneathAModal: Story = {
    name: 'With a modal open — the banner stays underneath',
    render: () => (
        <>
            <GradientGround className="min-h-screen">
                <PageBody title="Verify your phone" lines={3} />
            </GradientGround>
            <Dialog open>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Enter your code</DialogTitle>
                        <DialogDescription>
                            We sent a 6-digit code to your phone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="glass">Resend</Button>
                        <Button>Verify</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <Consent />
        </>
    ),
}

/**
 * Edge case — long copy and long labels. The banner grows, and because the
 * height is measured rather than hardcoded, the reservation grows with it.
 * Worth reading at 375 wide and at 200% text scale, which is the pair that
 * produced the tallest banner seen in the wild.
 */
export const LongCopy: Story = {
    name: 'Edge case — long copy and wrapping labels',
    render: () => (
        <>
            <GradientGround className="min-h-screen">
                <PageBody title="Long consent copy" lines={3} />
            </GradientGround>
            <Consent
                acceptLabel="Accept analytics cookies"
                declineLabel="Decline non-essential cookies"
            >
                We use cookies and analytics tools to understand how you use
                our site and improve it. We only ever ask about analytics —
                Autara runs no advertising, so no advertising storage is
                requested and none is granted. Your choice is remembered on
                this device for this site only, and you can change it at any
                time from the Cookie Policy page. By clicking
                &ldquo;Accept&rdquo;, you consent to our use of analytics
                cookies.
            </Consent>
        </>
    ),
}

/**
 * Edge case — an app that scrolls inside its own container rather than the
 * document. `reserveBodySpace={false}` leaves `document.body` alone; the
 * custom property is still published, so fixed chrome still clears.
 */
export const OwnScrollContainer: Story = {
    name: 'Edge case — app owns its scroll container',
    render: () => (
        <>
            <GradientGround className="h-screen overflow-hidden">
                <div
                    className="h-screen overflow-y-auto"
                    style={{ paddingBottom: CONSENT_BANNER_OFFSET }}
                >
                    <PageBody title="Scrolling container, not the document" />
                </div>
            </GradientGround>
            <Consent reserveBodySpace={false} />
        </>
    ),
}

/**
 * Variant — a different accessible name, for an app whose notice covers more
 * than cookies. The name is what a screen reader announces when the user
 * jumps to the landmark, so it should say what the choice is about.
 */
export const CustomLabel: Story = {
    name: 'Variant — custom label and actions',
    render: () => (
        <>
            <GradientGround className="min-h-screen">
                <PageBody title="Privacy choices" lines={4} />
            </GradientGround>
            <Consent
                label="Privacy choices"
                acceptLabel="Allow"
                declineLabel="Only essentials"
            >
                We use analytics to understand how the app is used. Allowing
                it helps us fix the parts that get in your way. You can change
                this any time.
            </Consent>
        </>
    ),
}
