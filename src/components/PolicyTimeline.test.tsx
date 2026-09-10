import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PolicyTimeline } from './PolicyTimeline'

/**
 * AUTM-1221 — PolicyTimeline, graduated from customer-web (plan item U5).
 *
 * The thing to protect is that colour is never the only signal: the live tier
 * is a solid fill AND `aria-current="step"` AND an sr-only "(applies now)",
 * so it reads the same to a screen reader and at any contrast setting.
 */
const STEPS = [
    { label: 'Before the pro accepts', value: 'Free' },
    { label: 'More than 24h before', value: 'Free', current: true },
    { label: 'Under 4h before', value: 'No refund' },
]

describe('PolicyTimeline', () => {
    it('is a named list of the tiers', () => {
        render(<PolicyTimeline steps={STEPS} testId="policy" />)
        const list = screen.getByRole('list', { name: 'Cancellation policy' })
        expect(list).toBe(screen.getByTestId('policy'))
        expect(screen.getAllByRole('listitem')).toHaveLength(3)
    })

    it('marks exactly one step as current, in words as well as colour', () => {
        const { container } = render(<PolicyTimeline steps={STEPS} />)
        const current = container.querySelectorAll('[aria-current="step"]')
        expect(current).toHaveLength(1)
        expect(current[0].textContent).toContain('More than 24h before')
        expect(current[0].textContent).toContain('(applies now)')
        // The fill is solid purple, not a tint.
        expect(current[0].innerHTML).toContain('bg-[var(--color-autara-purple)]')
    })

    it('marks nothing when no step applies', () => {
        const { container } = render(
            <PolicyTimeline steps={STEPS.map(({ label, value }) => ({ label, value }))} />,
        )
        expect(container.querySelectorAll('[aria-current="step"]')).toHaveLength(0)
        expect(container.textContent).not.toContain('(applies now)')
    })

    it('takes its column count from the steps, so two tiers do not render four columns', () => {
        const { container } = render(<PolicyTimeline steps={STEPS.slice(0, 2)} />)
        const ol = container.querySelector('ol')!
        expect(ol.getAttribute('style')).toContain('repeat(2, minmax(0, 1fr))')
    })

    it('accepts its own accessible name', () => {
        render(<PolicyTimeline steps={STEPS} label="Refund tiers" />)
        expect(screen.getByRole('list', { name: 'Refund tiers' })).toBeInTheDocument()
    })
})
