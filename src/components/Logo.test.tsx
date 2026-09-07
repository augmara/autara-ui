import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'

import { Logo } from './Logo'

describe('Logo', () => {
    it('names itself for a screen reader', () => {
        render(<Logo />)
        expect(screen.getByRole('img', { name: 'Autara' })).toBeInTheDocument()
    })

    it('names the pair ONCE as a business lockup', () => {
        // AUTM-1158 — the first cut passed `aria-hidden` to the inner mark
        // without declaring it in LogoProps, so React dropped it and the SVG
        // kept `role="img" aria-label="Autara"` INSIDE a span already named
        // "Autara for business". A screen reader read the brand twice.
        //
        // Caught by rendering the markup rather than by reading the JSX, and
        // it type-checked perfectly either way.
        render(<Logo lockup="business" />)
        const all = screen.getAllByRole('img')
        expect(all).toHaveLength(1)
        expect(all[0]).toHaveAttribute('aria-label', 'Autara for business')
    })

    it('carries the descriptor as real text, not a background', () => {
        // It must survive a copy-paste and a text-only rendering, and it must
        // never be hidden at a breakpoint: both consumers previously wrote it
        // `hidden sm:inline`, so on a phone the merchant product wore the
        // consumer brand exactly.
        const { container } = render(<Logo lockup="business" />)
        expect(container.textContent).toContain('for business')
        expect(container.querySelector('.hidden')).toBeNull()
    })

    it('scales the descriptor with the mark rather than pinning it', () => {
        // The two cannot be set independently: `em` resolves against the
        // inherited font-size, not the SVG's box, so a fixed caption size
        // drifts the moment the mark is resized.
        const { container: sm } = render(<Logo lockup="business" size="sm" />)
        const { container: xl } = render(<Logo lockup="business" size="xl" />)
        expect(sm.querySelector('svg')?.getAttribute('class')).toContain('h-5')
        expect(xl.querySelector('svg')?.getAttribute('class')).toContain('h-9')
        expect(sm.innerHTML).toContain('text-[0.6875rem]')
        expect(xl.innerHTML).toContain('text-base')
    })

    it('ignores the lockup when the wordmark is rendered alone', () => {
        // `textOnly` exists for narrow chrome; a descriptor there would defeat
        // the reason the orb was dropped in the first place.
        render(<Logo textOnly lockup="business" />)
        expect(screen.getByRole('img', { name: 'Autara' })).toBeInTheDocument()
        expect(screen.queryByText('for business')).toBeNull()
    })
})
