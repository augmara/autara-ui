import { describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { forwardRef, type AnchorHTMLAttributes } from 'react'
import { AppBar } from './AppBar'
import { AppTabBar } from './AppTabBar'
import { ActionBar } from './ActionBar'
import { ListSection, ListSectionRow } from './ListSection'

/**
 * AUTM-1781: the signed-in app shell. These pin behaviour and the classes
 * that make the geometry (jsdom has no layout engine; the real measurements
 * are customer-web's Playwright suite at 390, 834, 1194 and 1440).
 */

/** A stand-in for a framework link: the components never import a router. */
const FakeLink = forwardRef<HTMLAnchorElement, AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }>(
    function FakeLink({ to, ...rest }, ref) {
        return <a ref={ref} href={to} data-router="" {...rest} />
    },
)

const Glyph = () => <svg aria-hidden="true" />

describe('AppTabBar (AUTM-1781)', () => {
    const items = [
        { key: 'bookings', label: 'Bookings', icon: <Glyph />, element: <FakeLink to="/account/bookings" />, badge: 1, badgeLabel: '1 payment due' },
        { key: 'messages', label: 'Messages', icon: <Glyph />, href: '/account/inbox', badge: 3, badgeLabel: '3 unread', active: true },
        { key: 'account', label: 'Account', icon: <Glyph />, href: '/account', badge: 0 },
    ]

    it('is a named navigation landmark, one link per destination', () => {
        render(<AppTabBar items={items} label="Account" />)
        const nav = screen.getByRole('navigation', { name: 'Account' })
        expect(within(nav).getAllByRole('link')).toHaveLength(3)
    })

    it('says the count with the label, and marks the current tab', () => {
        render(<AppTabBar items={items} />)
        expect(screen.getByRole('link', { name: 'Messages, 3 unread' })).toHaveAttribute('aria-current', 'page')
        expect(screen.getByRole('link', { name: 'Bookings, 1 payment due' })).not.toHaveAttribute('aria-current')
        // A zero count draws nothing and says nothing.
        expect(screen.getByRole('link', { name: 'Account' })).toBeInTheDocument()
    })

    it('clones the content into a framework link and keeps its own props', () => {
        render(<AppTabBar items={items} />)
        const link = screen.getByTestId('app-tab-bookings')
        expect(link).toHaveAttribute('data-router')
        expect(link).toHaveAttribute('href', '/account/bookings')
    })

    it('caps a big count at 99+', () => {
        render(<AppTabBar items={[{ ...items[1], badge: 140 }]} />)
        expect(screen.getByText('99+')).toBeInTheDocument()
    })

    it('the bar is fixed to the bottom, clear of the home indicator, with tabs at least 56px tall', () => {
        render(<AppTabBar items={items} />)
        const nav = screen.getByRole('navigation')
        expect(nav.className).toContain('fixed')
        expect(nav.className).toContain('bottom-0')
        expect(nav.className).toContain('pb-[env(safe-area-inset-bottom)]')
        expect(nav.className).toContain('md:hidden')
        expect(screen.getByTestId('app-tab-account').className).toContain('min-h-14')
    })

    it('inline sits in the flow, at least 44px tall', () => {
        render(<AppTabBar items={items} variant="inline" testIdPrefix="nav" />)
        const nav = screen.getByRole('navigation')
        expect(nav.className).not.toContain('fixed')
        expect(screen.getByTestId('nav-account').className).toContain('min-h-11')
    })
})

describe('AppBar (AUTM-1781)', () => {
    it('is the banner, with leading, title, inline nav and trailing in order', () => {
        render(
            <AppBar leading={<button>Back</button>} title="Booking" trailing={<a href="/account">Account</a>}>
                <span>nav</span>
            </AppBar>,
        )
        const bar = screen.getByRole('banner')
        expect(bar.textContent).toBe('BackBookingnavAccount')
        // The title is the bar's name for the screen, never a second h1.
        expect(within(bar).queryByRole('heading')).toBeNull()
        expect(bar.className).toContain('sticky')
        expect(bar.className).toContain('pt-[env(safe-area-inset-top)]')
    })
})

describe('ActionBar (AUTM-1781)', () => {
    it('is a named group of labelled controls, one per action', async () => {
        const message = vi.fn()
        render(
            <ActionBar
                label="Booking actions"
                actions={[
                    { key: 'message', label: 'Message', icon: <Glyph />, primary: true, onSelect: message },
                    { key: 'directions', label: 'Get directions', icon: <Glyph />, href: 'https://maps.example', external: true },
                    { key: 'change', label: 'Change time', icon: <Glyph />, element: <FakeLink to="/x" /> },
                    { key: 'cancel', label: 'Cancel', icon: <Glyph />, tone: 'danger', onSelect: () => {} },
                ]}
                testIdPrefix="booking-detail-action"
            />,
        )
        const group = screen.getByRole('group', { name: 'Booking actions' })
        expect(within(group).getAllByRole('listitem')).toHaveLength(4)
        await userEvent.click(screen.getByRole('button', { name: 'Message' }))
        expect(message).toHaveBeenCalledTimes(1)
        const directions = screen.getByRole('link', { name: /get directions/i })
        expect(directions).toHaveAttribute('target', '_blank')
        expect(directions).toHaveAccessibleName('Get directions (opens in a new tab)')
        expect(screen.getByTestId('booking-detail-action-change')).toHaveAttribute('data-router')
    })

    it('marks the primary, and danger is text, never a fill', () => {
        render(
            <ActionBar
                label="Booking actions"
                actions={[
                    { key: 'message', label: 'Message', icon: <Glyph />, primary: true },
                    { key: 'change', label: 'Change time', icon: <Glyph /> },
                    { key: 'cancel', label: 'Cancel', icon: <Glyph />, tone: 'danger' },
                ]}
            />,
        )
        expect(screen.getByTestId('action-bar-message')).toHaveAttribute('data-primary')
        const cancel = screen.getByTestId('action-bar-cancel')
        expect(cancel.className).toContain('text-[var(--danger)]')
        expect(cancel.className).not.toMatch(/\bbg-\[var\(--danger/)
    })

    it('is a fixed dock below lg and an in-flow list from lg, so each action exists once', () => {
        render(
            <ActionBar
                label="Booking actions"
                actions={[
                    { key: 'a', label: 'A', icon: <Glyph /> },
                    { key: 'b', label: 'B', icon: <Glyph /> },
                    { key: 'c', label: 'C', icon: <Glyph /> },
                ]}
            />,
        )
        const group = screen.getByRole('group')
        for (const c of ['fixed', 'bottom-0', 'lg:static', 'pb-[calc(0.5rem+env(safe-area-inset-bottom))]']) {
            expect(group.className).toContain(c)
        }
        // A tile is at least 56px in the dock.
        expect(screen.getByTestId('action-bar-a').className).toContain('min-h-14')
    })

    it('one or two actions are pills; three or more are tiles', () => {
        const { rerender } = render(
            <ActionBar label="x" actions={[{ key: 'pay', label: 'Pay', icon: <Glyph />, primary: true }]} />,
        )
        expect(screen.getByTestId('action-bar-pay').className).toContain('rounded-full')
        rerender(
            <ActionBar
                label="x"
                actions={[
                    { key: 'pay', label: 'Pay', icon: <Glyph />, primary: true },
                    { key: 'b', label: 'B', icon: <Glyph /> },
                    { key: 'c', label: 'C', icon: <Glyph /> },
                ]}
            />,
        )
        expect(screen.getByTestId('action-bar-pay').className).toContain('flex-col')
    })

    it('renders nothing with no actions', () => {
        const { container } = render(<ActionBar label="x" actions={[]} />)
        expect(container.firstChild).toBeNull()
    })
})

describe('ListSection plain variant and link rows (AUTM-1781)', () => {
    it('plain: a 17px Bold title, hairline rows, no band box', () => {
        render(
            <ListSection variant="plain" title="When and where" titleId="when-where">
                <ListSectionRow label="Thu 9 Oct" description="10:00 am AEDT" />
                <ListSectionRow label="Fitzroy" />
            </ListSection>,
        )
        const heading = screen.getByRole('heading', { name: 'When and where' })
        expect(heading.className).toContain('font-bold')
        expect(screen.getByRole('region', { name: 'When and where' })).toBeInTheDocument()
        const box = heading.parentElement!.querySelector('div')!
        expect(box.className).toContain('divide-y')
        expect(box.className).not.toContain('bg-[var(--band)]')
    })

    it('card stays the band box with raised rows', () => {
        render(
            <ListSection title="Business">
                <ListSectionRow label="Profile" testId="row" />
            </ListSection>,
        )
        expect(screen.getByTestId('row').className).toContain('bg-[var(--raised)]')
    })

    it('a row can be a framework link, an external anchor, or wrap', () => {
        render(
            <ListSection variant="plain">
                <ListSectionRow label="Fitzroy Paint Co" element={<FakeLink to="/m/fitzroy" />} testId="pro" />
                <ListSectionRow label="Get directions" href="https://maps.example" external testId="maps" />
                <ListSectionRow label="41 Smith Street, Fitzroy VIC 3065" wrap testId="addr" />
            </ListSection>,
        )
        expect(screen.getByTestId('pro')).toHaveAttribute('data-router')
        expect(screen.getByTestId('maps')).toHaveAttribute('target', '_blank')
        expect(screen.getByTestId('maps')).toHaveAccessibleName(/opens in a new tab/)
        expect(screen.getByTestId('addr').querySelector('p')!.className).not.toContain('truncate')
    })

    it('a wrapping row lets its value shrink; a plain one keeps it whole', () => {
        render(
            <ListSection variant="plain">
                <ListSectionRow label="Refund" trailing="$54.00 · Sent to your card" wrap testId="w" />
                <ListSectionRow label="Status" trailing="Active" testId="n" />
            </ListSection>,
        )
        expect(screen.getByText('$54.00 · Sent to your card').className).toContain('min-w-0')
        expect(screen.getByText('Active').className).toContain('shrink-0')
    })
})
