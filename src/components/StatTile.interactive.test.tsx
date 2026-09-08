import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

import { StatTile } from './StatTile'

/**
 * AUTM-1161 — the tile became a control. These pin the two things that make
 * that safe to depend on: it is only a button when there is somewhere to go,
 * and it carries a handle E2E can locate it by.
 */
describe('StatTile as a control', () => {
    it('is a button that fires when given an onClick', () => {
        const onClick = vi.fn()
        render(<StatTile label="Pending payouts" value="$202" onClick={onClick} />)
        fireEvent.click(screen.getByRole('button'))
        expect(onClick).toHaveBeenCalledTimes(1)
    })

    it('is NOT a button when there is nothing behind the figure', () => {
        // A control that does nothing is worse than no control: it invites a
        // tap and answers with silence.
        render(<StatTile label="This month" value="$4,247" />)
        expect(screen.queryByRole('button')).toBeNull()
    })

    it('names itself for a screen reader without repeating the figure', () => {
        render(<StatTile label="Today" value="$426" onClick={() => {}} />)
        expect(screen.getByRole('button').getAttribute('aria-label')).toBe(
            'Today, open details',
        )
    })

    it('carries testId in both shapes, because E2E locates by it', () => {
        const { rerender, container } = render(
            <StatTile label="Today" value="$426" testId="today-stat-revenue" />,
        )
        expect(container.querySelector('[data-testid="today-stat-revenue"]')).not.toBeNull()
        rerender(
            <StatTile
                label="Today"
                value="$426"
                testId="today-stat-revenue"
                onClick={() => {}}
            />,
        )
        expect(screen.getByTestId('today-stat-revenue').tagName).toBe('BUTTON')
    })

    it('keeps the skeleton rather than a zero when interactive and loading', () => {
        // A zero is a claim about money. Nothing loaded is not zero earned.
        const { container } = render(
            <StatTile label="Today" value={null} onClick={() => {}} />,
        )
        expect(container.textContent).not.toContain('0')
        expect(container.querySelector('.animate-pulse')).not.toBeNull()
    })
})
