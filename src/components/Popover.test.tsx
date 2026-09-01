import { describe, expect, it, vi, beforeAll } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverHeader,
    PopoverTitle,
    PopoverBody,
    PopoverFooter,
} from './Popover'

/**
 * AUTM-965. Two things are worth a test rather than a review.
 *
 * 1. **The panel escapes its glass ancestor.** `backdrop-filter` creates a
 *    containing block for `position: fixed` descendants, so a panel rendered
 *    in place inside a glass header resolves against the header rather than
 *    the viewport and collapses to a strip (AUTM-721, merchant-web). The
 *    merchant portal header IS glass, so this is the live arrangement. The
 *    failure is SILENT — the panel renders, it is just in the wrong place,
 *    and only the consumer sees it. A parent-chain assertion is the cheapest
 *    thing that catches a future refactor dropping the Portal.
 *
 * 2. **The keyboard contract.** Escape closes, focus returns to the trigger,
 *    `aria-expanded` tracks state, and the panel carries an accessible name.
 *    Each of those is a line of Radix config that a refactor can drop
 *    without any visible symptom.
 *
 * jsdom has no layout and no stylesheet, so nothing here asserts appearance.
 * Contrast is covered by `tokens/glass-contrast.test.ts`, which measures the
 * `--glass-fill` composite this component uses; the material itself is
 * `.glass-surface`, asserted by class.
 */

beforeAll(() => {
    // Radix's positioning needs both, and jsdom ships neither.
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

function Fixture({ glassHeader = false }: { glassHeader?: boolean }) {
    const content = (
        <Popover>
            <PopoverTrigger>Notifications</PopoverTrigger>
            <PopoverContent>
                <PopoverHeader>
                    <PopoverTitle>Recent notifications</PopoverTitle>
                </PopoverHeader>
                <PopoverBody>
                    <button type="button">New booking request</button>
                </PopoverBody>
                <PopoverFooter>
                    <button type="button">See all</button>
                </PopoverFooter>
            </PopoverContent>
        </Popover>
    )
    return glassHeader ? (
        <header data-testid="glass-header" className="glass-surface">
            {content}
        </header>
    ) : (
        content
    )
}

async function open(user: ReturnType<typeof userEvent.setup>) {
    await user.click(screen.getByRole('button', { name: 'Notifications' }))
    return screen.findByRole('dialog')
}

describe('Popover — the panel escapes its glass ancestor', () => {
    it('portals to document.body even when the trigger sits inside a glass header', async () => {
        const user = userEvent.setup()
        render(<Fixture glassHeader />)
        const panel = await open(user)

        const header = screen.getByTestId('glass-header')
        expect(header.contains(panel)).toBe(false)

        // Walk the whole chain rather than checking one parent — a future
        // wrapper between Portal and Content would still have to land in
        // body, and that is what actually matters for `position: fixed`.
        let node: HTMLElement | null = panel
        const chain: string[] = []
        while (node) {
            chain.push(node.tagName)
            node = node.parentElement
        }
        expect(chain).toContain('BODY')
        expect(chain).not.toContain('HEADER')
    })
})

describe('Popover — keyboard and semantics', () => {
    it('opens on click, closes on Escape, and returns focus to the trigger', async () => {
        const user = userEvent.setup()
        render(<Fixture />)
        const trigger = screen.getByRole('button', { name: 'Notifications' })

        expect(trigger).toHaveAttribute('aria-expanded', 'false')
        expect(screen.queryByRole('dialog')).toBeNull()

        await user.click(trigger)
        expect(await screen.findByRole('dialog')).toBeInTheDocument()
        expect(trigger).toHaveAttribute('aria-expanded', 'true')

        await user.keyboard('{Escape}')
        await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
        expect(trigger).toHaveAttribute('aria-expanded', 'false')
        // The whole point of a keyboard-operable panel: you get back to
        // where you were, not to the top of the document.
        expect(trigger).toHaveFocus()
    })

    it('is operable end to end from the keyboard alone', async () => {
        const user = userEvent.setup()
        render(<Fixture />)
        const trigger = screen.getByRole('button', { name: 'Notifications' })

        await user.tab()
        expect(trigger).toHaveFocus()

        await user.keyboard('{Enter}')
        const panel = await screen.findByRole('dialog')

        // Focus MOVES INTO the panel on open — it is not left behind on the
        // trigger, which is the failure that makes a keyboard user open a
        // panel they cannot then reach. Radix lands it on the first
        // focusable child.
        await waitFor(() =>
            expect(panel.contains(document.activeElement)).toBe(true)
        )
        expect(
            screen.getByRole('button', { name: 'New booking request' })
        ).toHaveFocus()

        // Tab order inside the panel follows the visual order: body row,
        // then the footer's way out.
        await user.tab()
        expect(screen.getByRole('button', { name: 'See all' })).toHaveFocus()

        await user.keyboard('{Escape}')
        await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
        expect(trigger).toHaveFocus()
    })

    it('names the panel from PopoverTitle', async () => {
        const user = userEvent.setup()
        render(<Fixture />)
        const panel = await open(user)

        // A role="dialog" with no accessible name is announced as an
        // unlabelled dialog. Radix wires this for Dialog but not for
        // Popover, so the wrapper does it.
        expect(panel).toHaveAccessibleName('Recent notifications')
    })

    it('leaves aria-labelledby off rather than dangling when there is no title', async () => {
        const user = userEvent.setup()
        render(
            <Popover>
                <PopoverTrigger>Notifications</PopoverTrigger>
                <PopoverContent aria-label="Recent activity">
                    <PopoverBody>Nothing yet</PopoverBody>
                </PopoverContent>
            </Popover>
        )
        const panel = await open(user)

        // Pointing aria-labelledby at an id that never rendered would strip
        // the name the caller supplied. This is the regression that guards it.
        expect(panel).not.toHaveAttribute('aria-labelledby')
        expect(panel).toHaveAccessibleName('Recent activity')
    })
})

describe('Popover — material and shape', () => {
    it('composes the shared glass surface rather than its own backdrop-filter', async () => {
        const user = userEvent.setup()
        render(<Fixture />)
        const panel = await open(user)

        // The class is the contract: `utilities/glass.css` owns the fill,
        // the -webkit-prefixed backdrop-filter, the 1px inset top highlight,
        // the hairline edge, and the shared surface radius.
        expect(panel).toHaveClass('glass-surface')
        expect(panel).toHaveAttribute('data-glass', 'blur')
        // Rule 3 — two shapes only. A floating panel is a surface, so it
        // takes the shared radius and never a pill or a skew.
        expect(panel.className).not.toMatch(/\brounded-full\b/)
    })

    it('drops the blur, and says so, when blur={false}', async () => {
        const user = userEvent.setup()
        render(
            <Popover>
                <PopoverTrigger>Notifications</PopoverTrigger>
                <PopoverContent blur={false}>
                    <PopoverBody>Long list</PopoverBody>
                </PopoverContent>
            </Popover>
        )
        const panel = await open(user)

        expect(panel).toHaveClass('glass-surface--flat')
        // A device test counts these to find every blurring surface on a
        // page; a flat panel must not inflate that count.
        expect(panel).toHaveAttribute('data-glass', 'flat')
    })

    it('raises the fill for dense body text with tone="strong"', async () => {
        const user = userEvent.setup()
        render(
            <Popover>
                <PopoverTrigger>Notifications</PopoverTrigger>
                <PopoverContent tone="strong">
                    <PopoverBody>Dense copy</PopoverBody>
                </PopoverContent>
            </Popover>
        )
        expect(await open(user)).toHaveClass('glass-surface--strong')
    })
})

describe('Popover — outside interaction', () => {
    it('closes on an outside click and reports it', async () => {
        const user = userEvent.setup()
        const onOpenChange = vi.fn()
        render(
            <div>
                <button type="button">Elsewhere</button>
                <Popover onOpenChange={onOpenChange}>
                    <PopoverTrigger>Notifications</PopoverTrigger>
                    <PopoverContent>
                        <PopoverBody>Panel</PopoverBody>
                    </PopoverContent>
                </Popover>
            </div>
        )

        await open(user)
        await user.click(screen.getByRole('button', { name: 'Elsewhere' }))
        await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
        expect(onOpenChange).toHaveBeenLastCalledWith(false)
    })
})
