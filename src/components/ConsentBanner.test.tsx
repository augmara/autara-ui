import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type * as React from 'react'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConsentBanner, CONSENT_BANNER_HEIGHT_VAR } from './ConsentBanner'

/**
 * AUTM-852 — guards for the two things this primitive exists to own.
 *
 * Every assertion here was checked by REVERTING the behaviour it guards and
 * confirming the test goes red. A guard that passes against the broken
 * component is worse than no guard, because it makes the next person
 * confident. Which revert breaks which test is recorded on each block.
 *
 * The space reservation cannot be asserted from computed style: jsdom has no
 * layout, so `offsetHeight` is 0 for everything. It is stubbed to a real
 * measured value (298px is what the banner measured on a 375x812 phone in
 * AUTM-787) so the assertions are about the number the component publishes,
 * not about a truthy string.
 */

const SRC = resolve(process.cwd(), 'src/components/ConsentBanner.tsx')

/** Height the stubbed layout reports. Mutable so a reflow can be simulated. */
let measuredHeight = 298

/**
 * Stub observers, so a test can deliver a reflow the way layout would.
 *
 * `observe()` is recorded rather than ignored, and `fireReflow` only calls
 * back the observers that are actually watching the banner. The first version
 * of this stub captured the callback in the constructor and fired it
 * unconditionally, which made the reflow test pass with `observer.observe()`
 * deleted from the component — a guard that was green against the broken
 * version. Found by reverting; the fix is that `observe` has to matter.
 */
interface StubObserver {
    cb: ResizeObserverCallback
    targets: Set<Element>
}
let observers: StubObserver[] = []

function fireReflow(target: Element) {
    act(() => {
        observers
            .filter((o) => o.targets.has(target))
            .forEach((o) =>
                o.cb(
                    [] as unknown as ResizeObserverEntry[],
                    {} as ResizeObserver
                )
            )
    })
}

const originalOffsetHeight = Object.getOwnPropertyDescriptor(
    HTMLElement.prototype,
    'offsetHeight'
)

beforeEach(() => {
    measuredHeight = 298
    observers = []

    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
        configurable: true,
        get() {
            return this.getAttribute('data-testid') === 'consent-banner'
                ? measuredHeight
                : 0
        },
    })

    vi.stubGlobal(
        'ResizeObserver',
        class {
            private entry: StubObserver
            constructor(cb: ResizeObserverCallback) {
                this.entry = { cb, targets: new Set() }
                observers.push(this.entry)
            }
            observe(target: Element) {
                this.entry.targets.add(target)
            }
            unobserve(target: Element) {
                this.entry.targets.delete(target)
            }
            disconnect() {
                this.entry.targets.clear()
            }
        }
    )
})

afterEach(() => {
    if (originalOffsetHeight) {
        Object.defineProperty(
            HTMLElement.prototype,
            'offsetHeight',
            originalOffsetHeight
        )
    }
    vi.unstubAllGlobals()
    document.documentElement.style.removeProperty(CONSENT_BANNER_HEIGHT_VAR)
    document.body.style.paddingBottom = ''
})

function publishedHeight() {
    return document.documentElement.style.getPropertyValue(
        CONSENT_BANNER_HEIGHT_VAR
    )
}

function Banner(props: Partial<React.ComponentProps<typeof ConsentBanner>>) {
    return (
        <ConsentBanner
            open
            onAccept={() => {}}
            onDecline={() => {}}
            {...props}
        >
            We use cookies. See our <a href="/cookies">Cookie Policy</a>.
        </ConsentBanner>
    )
}

/**
 * The half of the fix that answers a `position: fixed` action bar. Body
 * padding does nothing for one of those, so the measurement itself has to be
 * readable from CSS.
 *
 * Goes red if `root.style.setProperty(heightVar, height)` is removed from
 * `apply()` — confirmed by deleting that line: 5 failures.
 */
describe('it publishes its measured height for fixed page chrome to consume', () => {
    it('sets the custom property on <html> while consent is pending', () => {
        render(<Banner />)
        expect(publishedHeight()).toBe('298px')
    })

    it('re-measures when the banner reflows', () => {
        render(<Banner />)
        expect(publishedHeight()).toBe('298px')

        // A narrower viewport wraps the copy and the banner grows. This is
        // the case a hardcoded height gets wrong.
        measuredHeight = 364
        fireReflow(screen.getByTestId('consent-banner'))
        expect(publishedHeight()).toBe('364px')
    })

    /**
     * Belt and braces on top of the observer: ResizeObserver delivers on the
     * frame loop, so a throttled rAF can leave the measurement stale.
     *
     * Goes red if the `window.addEventListener('resize', apply)` line is
     * removed — confirmed: 1 failure, and only this one. Deleting
     * `observer.observe(node)` instead fails only the reflow test above, so
     * the two paths are independently covered rather than one masking the
     * other.
     */
    it('re-measures on a window resize even if no observer fires', () => {
        render(<Banner />)
        observers = []

        measuredHeight = 412
        act(() => {
            window.dispatchEvent(new Event('resize'))
        })
        expect(publishedHeight()).toBe('412px')
    })
})

/**
 * The half that answers content which scrolls — the original AUTM-787/-845
 * fix. The page must become taller than the viewport so the covered control
 * can be scrolled clear.
 *
 * Goes red if `body.style.paddingBottom = height` is removed — confirmed: 2
 * failures.
 */
describe('it reserves space in the document for content that scrolls', () => {
    it('pads the body by the banner height', () => {
        render(<Banner />)
        expect(document.body.style.paddingBottom).toBe('298px')
    })

    it('leaves the body alone when the app scrolls its own container', () => {
        render(<Banner reserveBodySpace={false} />)
        expect(document.body.style.paddingBottom).toBe('')
        // The property is published either way — a fixed bar still needs it.
        expect(publishedHeight()).toBe('298px')
    })
})

/**
 * Both originals blanked `padding-bottom` on cleanup. Restoring what was
 * there is the difference between handing the space back and deleting a
 * value the app set for its own reasons.
 *
 * Goes red if the cleanup is changed to `body.style.paddingBottom = ''` —
 * confirmed: 1 failure ("expected '' to be '80px'"), while the plain
 * give-it-back test above still passed, which is why both are here. Dropping
 * `root.style.removeProperty(heightVar)` from the cleanup fails the other
 * one, and only that one.
 */
describe('it gives the space back the moment consent is answered', () => {
    it('removes the custom property and the padding', () => {
        const { rerender } = render(<Banner />)
        expect(publishedHeight()).toBe('298px')

        rerender(<Banner open={false} />)
        expect(publishedHeight()).toBe('')
        expect(document.body.style.paddingBottom).toBe('')
    })

    it('restores padding the app had already set, rather than blanking it', () => {
        document.body.style.paddingBottom = '80px'
        const { rerender } = render(<Banner />)
        expect(document.body.style.paddingBottom).toBe('298px')

        rerender(<Banner open={false} />)
        expect(document.body.style.paddingBottom).toBe('80px')
    })
})

/**
 * The a11y half of AUTM-852. `role="dialog"` on a non-modal banner is a
 * screen-reader inaccuracy and it makes `getByRole("dialog")` ambiguous on
 * exactly the pages where the overlap bugs lived.
 *
 * Goes red if the root's role is changed back to "dialog" — confirmed: 3
 * failures, two for the landmark being absent under either name and one for
 * the dialog being present.
 */
describe('it is a named landmark, not a dialog', () => {
    it('exposes a region with an accessible name', () => {
        render(<Banner />)
        expect(
            screen.getByRole('region', { name: 'Cookie consent' })
        ).toBeInTheDocument()
    })

    it('claims no dialog role, so a real dialog on the page stays unambiguous', () => {
        render(<Banner />)
        expect(screen.queryByRole('dialog')).toBeNull()
        expect(screen.queryByRole('alertdialog')).toBeNull()
    })

    it('takes a custom label for apps that ask about more than cookies', () => {
        render(<Banner label="Privacy choices" />)
        expect(
            screen.getByRole('region', { name: 'Privacy choices' })
        ).toBeInTheDocument()
    })

    it('both choices are real buttons, reachable by keyboard', async () => {
        const onAccept = vi.fn()
        const onDecline = vi.fn()
        render(<Banner onAccept={onAccept} onDecline={onDecline} />)

        const accept = screen.getByRole('button', { name: 'Accept' })
        const decline = screen.getByRole('button', { name: 'Decline' })

        accept.focus()
        expect(document.activeElement).toBe(accept)
        await userEvent.keyboard('{Enter}')
        expect(onAccept).toHaveBeenCalledOnce()

        decline.focus()
        await userEvent.keyboard(' ')
        expect(onDecline).toHaveBeenCalledOnce()
    })
})

/**
 * The third failure mode: a modal dialog must be neither covered nor
 * blurred. jsdom has no stylesheet, so the Tailwind class IS the contract
 * here — asserting a computed z-index would pass while the real app was
 * wrong, which is the trap `default-variant.test.ts` was written for.
 *
 * Goes red if `z-40` becomes `z-50` — confirmed: 1 failure. Returning the
 * markup inline instead of through `createPortal` fails the second test
 * here, and only that one.
 */
describe('it sits under the dialog layer', () => {
    it('carries z-40, one step below the Dialog and Sheet overlays at z-50', () => {
        render(<Banner />)
        const banner = screen.getByTestId('consent-banner')
        expect(banner.className).toContain('z-40')
        expect(banner.className).not.toContain('z-50')
    })

    it('portals to document.body so a blurred ancestor cannot capture it', () => {
        render(
            <div style={{ backdropFilter: 'blur(20px)' }}>
                <Banner />
            </div>
        )
        // A `backdrop-filter` ancestor becomes the containing block for a
        // fixed descendant (AUTM-721). Being a direct child of body is what
        // keeps the banner anchored to the viewport.
        expect(screen.getByTestId('consent-banner').parentElement).toBe(
            document.body
        )
    })
})

/**
 * 200% text scale. Measured in a real browser on a 390x760 viewport with a
 * 32px root: the banner grew from 281px to 879px — taller than the viewport —
 * so reserving its full height pushed the page's fixed action bar off the top
 * of the screen and "Continue" became unreachable again, by the opposite
 * mechanism to the one this component was written to fix.
 *
 * jsdom has no layout, so `vh` and `scrollHeight` are both meaningless here
 * and the CLASS is the contract, exactly as for `z-40` above. The behaviour
 * itself is covered by the headless-Chromium run recorded in the PR.
 *
 * Goes red if `max-h-[40vh] overflow-y-auto` is dropped from the copy
 * container — confirmed: 1 failure. Removing `tabIndex` fails both tests
 * here, because the scroller is located BY that attribute.
 */
describe('it stays bounded when the text scales', () => {
    it('caps the copy and lets it scroll, so the banner cannot outgrow the viewport', () => {
        render(<Banner />)
        const copy = screen
            .getByRole('region', { name: 'Cookie consent' })
            .querySelector('[tabindex]') as HTMLElement

        expect(copy).not.toBeNull()
        expect(copy.className).toContain('max-h-[40vh]')
        expect(copy.className).toContain('overflow-y-auto')
    })

    it('the scroller is keyboard operable, and the actions sit outside it', () => {
        render(<Banner />)
        const copy = screen
            .getByRole('region', { name: 'Cookie consent' })
            .querySelector('[tabindex]') as HTMLElement

        expect(copy.tabIndex).toBe(0)
        // The two choices must never be inside the scroller — capping the
        // copy is only safe because it cannot move them out of reach.
        expect(
            copy.contains(screen.getByRole('button', { name: 'Accept' }))
        ).toBe(false)
        expect(
            copy.contains(screen.getByRole('button', { name: 'Decline' }))
        ).toBe(false)
    })
})

/**
 * The deliberate split in AUTM-852: banner markup and behaviour here,
 * analytics wiring in each consumer. The originals import
 * `@next/third-parties`, and autara-ui is also consumed by merchant-mobile
 * (Capacitor + Vite) where that does not resolve at all.
 *
 * Comments are stripped first. The doc comment names `@next/third-parties`
 * on purpose, as the explanation, and a naive scan would match its own
 * documentation — that is a real trap, hit by AUTM-936's guard. Verified in
 * both directions: adding `import Link from 'next/link'` to the component
 * fails this test, and it still fails with the doc comment in place.
 */
describe('it drags no framework into the library', () => {
    it('imports nothing Next-specific', () => {
        const source = readFileSync(SRC, 'utf8')
            .split('\n')
            .filter((line) => {
                const t = line.trim()
                return !t.startsWith('*') && !t.startsWith('/*') && !t.startsWith('//')
            })
            .join('\n')

        expect(source).not.toMatch(/from\s+['"]next\//)
        expect(source).not.toMatch(/from\s+['"]@next\//)
        // Sanity check that the strip did not eat the whole file, which
        // would make every assertion above vacuously true.
        expect(source).toContain('export function ConsentBanner')
    })
})
