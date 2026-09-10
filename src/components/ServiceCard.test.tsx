import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { ServiceCard } from './ServiceCard'

/**
 * AUTM-1211 (plan U3): the thumbnail is a slot, and absence is absence.
 *
 * A merchant with no service photos used to get a column of identical
 * purple-tinted car glyphs, which reads as a column of failed images. Now a
 * card with neither `media` nor `coverImageUrl` renders no thumbnail at all;
 * `media` lets a Next consumer hand in next/image; and the meta row is
 * sentence case on the type scale, not letterspaced uppercase.
 */
describe('ServiceCard thumbnail slot (AUTM-1211)', () => {
    it('renders no tile when there is no image', () => {
        const { container } = render(<ServiceCard name="Wash" priceLabel="$80" durationLabel="45 min" />)
        expect(container.querySelector('[data-slot="media"]')).toBeNull()
        expect(container.querySelector('svg path[d^="M4 13"]')).toBeNull()
        expect(container.querySelector('img')).toBeNull()
    })

    it('renders the consumer media element in the slot', () => {
        const { container } = render(
            <ServiceCard
                name="Wash"
                priceLabel="$80"
                coverImageUrl="https://cdn.example/should-not-render.jpg"
                media={<img data-testid="own-image" src="/optimised.jpg" alt="" />}
            />,
        )
        const slot = container.querySelector('[data-slot="media"]')
        expect(slot).not.toBeNull()
        expect(slot?.querySelector('[data-testid="own-image"]')).not.toBeNull()
        expect(container.querySelectorAll('img')).toHaveLength(1)
    })

    it('still renders a plain img for coverImageUrl without media', () => {
        const { container } = render(
            <ServiceCard name="Wash" priceLabel="$80" coverImageUrl="https://cdn.example/cover.jpg" />,
        )
        expect(container.querySelector('[data-slot="media"] img')?.getAttribute('src')).toBe(
            'https://cdn.example/cover.jpg',
        )
    })

    it('keeps the meta row and price prefix in sentence case', () => {
        const { container } = render(
            <ServiceCard name="Wash" priceLabel="$120" pricePrefix="From" durationLabel="45 min" />,
        )
        expect(container.innerHTML).not.toMatch(/uppercase|tracking-wide/)
        expect(container.textContent).toContain('From')
    })
})
