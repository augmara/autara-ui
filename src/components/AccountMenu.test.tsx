import { beforeAll, describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AccountMenu } from './AccountMenu'

/**
 * AUTM-1127. Four claims in this component are load-bearing and none of them
 * is visible in a screenshot, so each gets a test rather than a review.
 *
 *   1. The icon weight is ENFORCED. The whole reason this component exists in
 *      preference to a documented convention is that merchant-web's account
 *      menu already mixes Bold and Linear inside one panel while every review
 *      of it passed. A rule that lives only in prose has already failed here.
 *   2. The accent row is NOT lime by default. Don dropped lime for the shared
 *      menu; a default that silently drifts back to it would reintroduce
 *      exactly the decision he reversed, on three surfaces at once.
 *   3. Sign-out is DEMOTED, in muted ink, not intent red. That is the
 *      customer-web grammar he picked, and it is the opposite of what every
 *      other design system does, so it is the thing a future contributor is
 *      most likely to "fix".
 *   4. The identity header is not a menu item. It is not actionable, so it
 *      must not sit in the roving-focus order.
 *
 * jsdom has no layout engine and no stylesheet, so nothing here asserts
 * appearance. Geometry is asserted by CLASS, the same compromise
 * `tap-targets.test.tsx` documents; contrast is measured in the token suites.
 */

beforeAll(() => {
    // Radix positioning needs both, and jsdom ships neither.
    if (!globalThis.ResizeObserver) {
        globalThis.ResizeObserver = class {
            observe() {}
            unobserve() {}
            disconnect() {}
        } as unknown as typeof ResizeObserver
    }
    if (!Element.prototype.hasPointerCapture) {
        Element.prototype.hasPointerCapture = () => false
        Element.prototype.setPointerCapture = () => {}
        Element.prototype.releasePointerCapture = () => {}
    }
    if (!Element.prototype.scrollIntoView) {
        Element.prototype.scrollIntoView = () => {}
    }
})

/** Stands in for a Solar icon: renders whatever `weight` it was handed. */
function WeightProbe({ weight = 'unset' }: { weight?: string }) {
    return <span data-testid={`weight-${weight}`}>{weight}</span>
}

const identity = { name: 'Priya Nair', secondary: 'priya@gleamdetailing.au' }

/* ─── 1. Icon weight ─────────────────────────────────────────────────── */

describe('the icon weight is enforced, not documented', () => {
    it('overrides a consumer-supplied Bold on an ordinary row', () => {
        render(
            <AccountMenu
                open
                identity={identity}
                items={[
                    {
                        key: 'profile',
                        label: 'Profile',
                        // Exactly what merchant-web's account menu passes today.
                        icon: <WeightProbe weight="Bold" />,
                        href: '/account',
                    },
                ]}
            />
        )
        expect(screen.getByTestId('weight-Linear')).toBeInTheDocument()
        expect(screen.queryByTestId('weight-Bold')).not.toBeInTheDocument()
    })

    it('overrides LineDuotone too, the third weight only one surface uses', () => {
        render(
            <AccountMenu
                open
                identity={identity}
                items={[
                    { key: 'a', label: 'Terms', icon: <WeightProbe weight="LineDuotone" />, href: '#' },
                ]}
            />
        )
        expect(screen.getByTestId('weight-Linear')).toBeInTheDocument()
    })

    it('demotes sign-out to Linear as well, because demoting and emphasising are opposites', () => {
        render(
            <AccountMenu
                open
                identity={identity}
                signOut={{ key: 'out', label: 'Sign out', icon: <WeightProbe weight="Bold" /> }}
            />
        )
        expect(screen.getByTestId('weight-Linear')).toBeInTheDocument()
        expect(screen.queryByTestId('weight-Bold')).not.toBeInTheDocument()
    })

    it('promotes the accent row to Bold, the one place emphasis is spent', () => {
        render(
            <AccountMenu
                open
                identity={identity}
                primaryAction={{
                    key: 'bookings',
                    label: 'My bookings',
                    icon: <WeightProbe weight="Linear" />,
                    href: '#',
                }}
            />
        )
        expect(screen.getByTestId('weight-Bold')).toBeInTheDocument()
    })

    it('leaves a raw <svg> alone, since a host element has no weight to set', () => {
        // Cloning a host element with `weight` would land a stray attribute on
        // the DOM. A consumer inlining its own SVG owns its stroke.
        render(
            <AccountMenu
                open
                identity={identity}
                items={[
                    {
                        key: 'a',
                        label: 'Inline glyph',
                        icon: <svg data-testid="raw-svg" viewBox="0 0 24 24" />,
                        href: '#',
                    },
                ]}
            />
        )
        expect(screen.getByTestId('raw-svg')).not.toHaveAttribute('weight')
    })
})

/* ─── 2. The accent row does not default to lime ─────────────────────── */

describe('the accent row takes its colour from a token and never defaults to lime', () => {
    it('defaults to --act-fill (brand purple)', () => {
        render(
            <AccountMenu
                open
                identity={identity}
                primaryAction={{ key: 'p', label: 'My bookings', href: '#' }}
            />
        )
        const row = screen.getByTestId('account-menu-primary')
        expect(row.className).toContain('bg-[var(--act-fill)]')
        expect(row.className).toContain('text-[var(--on-act)]')
        // Lime is `--money-fill`. It has to be asked for.
        expect(row.className).not.toContain('--money-fill')
    })

    it('reaches lime only when a consumer asks for accent="money"', () => {
        render(
            <AccountMenu
                open
                identity={identity}
                primaryAction={{ key: 'p', label: 'My bookings', href: '#', accent: 'money' }}
            />
        )
        expect(screen.getByTestId('account-menu-primary').className).toContain(
            'bg-[var(--money-fill)]'
        )
    })

    it('paints a solid fill, never an outline or a tint', () => {
        render(
            <AccountMenu
                open
                identity={identity}
                primaryAction={{ key: 'p', label: 'My bookings', href: '#' }}
            />
        )
        const row = screen.getByTestId('account-menu-primary')
        expect(row.className).not.toMatch(/\bborder\b|(^|\s)ring-\d/)
    })
})

/* ─── 3. Sign-out is demoted, not red ────────────────────────────────── */

describe('sign-out is visually demoted so it does not compete', () => {
    it('renders in muted ink by default, not intent red', () => {
        render(
            <AccountMenu open identity={identity} signOut={{ key: 'out', label: 'Sign out' }} />
        )
        const row = screen.getByTestId('account-menu-sign-out')
        expect(row.className).toContain('text-[var(--text-muted)]')
        expect(row.className).not.toContain('--intent-error-text')
    })

    it('still darkens to full ink on hover, because demoted is hierarchy not contrast', () => {
        render(
            <AccountMenu open identity={identity} signOut={{ key: 'out', label: 'Sign out' }} />
        )
        expect(screen.getByTestId('account-menu-sign-out').className).toContain(
            'hover:text-[var(--text-strong)]'
        )
    })

    it('keeps intent red available for something genuinely destructive', () => {
        render(
            <AccountMenu
                open
                identity={identity}
                items={[{ key: 'del', label: 'Delete account', tone: 'danger', onSelect: () => {} }]}
            />
        )
        expect(screen.getByTestId('account-menu-item-del').className).toContain(
            'text-[var(--intent-error-text)]'
        )
    })
})

/* ─── 4. Semantics, keyboard and targets ─────────────────────────────── */

describe('menu semantics', () => {
    it('gives every row a menuitem role, and names the panel from its trigger', () => {
        render(
            <AccountMenu
                open
                identity={identity}
                items={[
                    { key: 'profile', label: 'Profile', href: '#' },
                    { key: 'help', label: 'Help and support', href: '#' },
                ]}
                signOut={{ key: 'out', label: 'Sign out' }}
            />
        )
        // Radix points the panel's aria-labelledby at the trigger, so the
        // panel's name is the trigger's name. Asserted at the value it really
        // resolves to rather than at the one a stray aria-label would suggest.
        const menu = screen.getByRole('menu', { name: 'Priya Nair, account menu' })
        expect(within(menu).getAllByRole('menuitem')).toHaveLength(3)
    })

    it('does not put the identity header in the roving-focus order', () => {
        render(
            <AccountMenu
                open
                identity={identity}
                items={[{ key: 'profile', label: 'Profile', href: '#' }]}
            />
        )
        const menu = screen.getByRole('menu')
        // The name is on screen, and it is not one of the choices.
        expect(within(menu).getByText('Priya Nair')).toBeInTheDocument()
        expect(within(menu).getAllByRole('menuitem')).toHaveLength(1)
    })

    it('labels a titled group so a screen reader announces the grouping', () => {
        render(
            <AccountMenu
                open
                identity={identity}
                sections={[
                    { key: 'money', title: 'Money', items: [{ key: 'earnings', label: 'Earnings', href: '#' }] },
                ]}
            />
        )
        expect(screen.getByRole('group', { name: 'Money' })).toBeInTheDocument()
    })

    it('names the trigger for voice control without dropping the visible text', () => {
        // WCAG 2.5.3: the accessible name has to CONTAIN the visible label, so
        // "click Priya Nair" hits the control. A bare "Account menu" would not.
        render(<AccountMenu identity={identity} items={[]} />)
        expect(
            screen.getByRole('button', { name: 'Priya Nair, account menu' })
        ).toBeInTheDocument()
    })

    it('falls back to the plain label when there is no name to include', () => {
        render(<AccountMenu identity={{}} items={[]} />)
        expect(screen.getByRole('button', { name: 'Account menu' })).toBeInTheDocument()
    })

    it('closes and returns focus to the trigger on Escape', async () => {
        const user = userEvent.setup()
        render(
            <AccountMenu
                identity={identity}
                items={[{ key: 'profile', label: 'Profile', href: '#' }]}
            />
        )
        const trigger = screen.getByRole('button', { name: /account menu/i })
        await user.click(trigger)
        expect(await screen.findByRole('menu')).toBeInTheDocument()
        await user.keyboard('{Escape}')
        expect(screen.queryByRole('menu')).not.toBeInTheDocument()
        expect(trigger).toHaveFocus()
    })

    it('fires onSelect and closes', async () => {
        const user = userEvent.setup()
        const onSelect = vi.fn()
        render(
            <AccountMenu identity={identity} items={[{ key: 'settings', label: 'Settings', onSelect }]} />
        )
        await user.click(screen.getByRole('button', { name: /account menu/i }))
        await user.click(await screen.findByRole('menuitem', { name: 'Settings' }))
        expect(onSelect).toHaveBeenCalledOnce()
        expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    })
})

describe('targets and text scale', () => {
    it('every row carries the 44px floor as a MINIMUM, so 200% text grows it', () => {
        render(
            <AccountMenu
                open
                identity={identity}
                items={[{ key: 'profile', label: 'Profile', href: '#' }]}
                signOut={{ key: 'out', label: 'Sign out' }}
                primaryAction={{ key: 'p', label: 'My bookings', href: '#' }}
            />
        )
        for (const id of ['account-menu-item-profile', 'account-menu-sign-out', 'account-menu-primary']) {
            const row = screen.getByTestId(id)
            expect(row.className).toContain('min-h-11')
            // A fixed height clips a wrapped label instead of growing.
            expect(row.className).not.toMatch(/(^|\s)h-11(\s|$)/)
        }
    })

    it('the trigger clears 44px too', () => {
        render(<AccountMenu identity={identity} items={[]} />)
        expect(screen.getByTestId('account-menu-trigger').className).toContain('min-h-11')
    })
})

/* ─── Identity fallbacks ─────────────────────────────────────────────── */

describe('identity fallbacks', () => {
    it('falls back to the email local part, then to "Account"', () => {
        const { rerender } = render(
            <AccountMenu identity={{ secondary: 'ops@autara.au' }} items={[]} />
        )
        expect(screen.getByRole('button', { name: /account menu/i })).toHaveTextContent('ops')
        rerender(<AccountMenu identity={{}} items={[]} />)
        expect(screen.getByRole('button', { name: 'Account menu' })).toHaveTextContent('Account')
    })

    it('renders the identity block as placeholders while loading', () => {
        render(<AccountMenu open loading identity={{}} items={[{ key: 'a', label: 'Profile', href: '#' }]} />)
        // The rows are placeholders, so nothing offers itself as a choice yet.
        expect(screen.queryByRole('menuitem')).not.toBeInTheDocument()
        expect(screen.getByText('Loading your account')).toBeInTheDocument()
    })
})

/* ─── Presentation ───────────────────────────────────────────────────── */

describe('the sheet presentation serves merchant-mobile', () => {
    it('opens a named dialog with real rows rather than a menu', async () => {
        const user = userEvent.setup()
        const onSelect = vi.fn()
        render(
            <AccountMenu
                presentation="sheet"
                identity={identity}
                sections={[
                    { key: 'business', title: 'Business', items: [{ key: 'services', label: 'Services', onSelect }] },
                ]}
                signOut={{ key: 'out', label: 'Sign out' }}
            />
        )
        await user.click(screen.getByRole('button', { name: /account menu/i }))
        const dialog = await screen.findByRole('dialog', { name: 'Account menu' })
        // A dialog with real buttons, where Tab is the expected movement.
        // Menu semantics would promise arrow-key navigation this does not
        // implement, and wrong ARIA is worse than none.
        await user.click(within(dialog).getByRole('button', { name: 'Services' }))
        expect(onSelect).toHaveBeenCalledOnce()
    })
})
