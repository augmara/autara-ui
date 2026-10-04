import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Spinner } from './Spinner'

/**
 * AUTM-1046 — the three promises the Spinner makes, asserted on the DOM.
 *
 * jsdom has no media queries, so the reduced-motion case is asserted the way
 * the rest of this directory asserts motion: the classes that carry it are
 * present. What they DO under `prefers-reduced-motion: reduce` is checked in
 * a browser (DevTools → Rendering → emulate the media feature).
 */
describe('Spinner', () => {
    it('is a status with the default label as its accessible name', () => {
        render(<Spinner />)
        const status = screen.getByRole('status')
        expect(status).toHaveTextContent('Loading')
        expect(screen.getByRole('status', { name: 'Loading' })).toBe(status)
    })

    it('announces a specific label when one is passed', () => {
        render(<Spinner label="Uploading photo" />)
        expect(screen.getByRole('status', { name: 'Uploading photo' })).toBeInTheDocument()
        // The label is for assistive tech only; visible copy is the caller's job.
        expect(screen.getByText('Uploading photo')).toHaveClass('sr-only')
    })

    it('is aria-hidden, silent and not a status when decorative', () => {
        const { container } = render(<Spinner decorative label="Uploading photo" />)
        const root = container.firstElementChild!
        expect(root).toHaveAttribute('aria-hidden', 'true')
        expect(root).not.toHaveAttribute('role')
        expect(screen.queryByRole('status')).toBeNull()
        expect(container.textContent).toBe('')
    })

    it('draws the Autara mark (AUTM-1708), whose stylesheet owns the turn and the reduced-motion form', () => {
        const { container } = render(<Spinner />)
        expect(container.querySelector('svg.autara-loader')).not.toBeNull()
        expect(container.querySelectorAll('path.autara-loader-ray')).toHaveLength(8)
        // No generic ring is left: no Tailwind spin, no quarter arc.
        expect(container.innerHTML).not.toContain('animate-spin')
        expect(container.firstElementChild).toHaveAttribute('data-spinner')
    })

    it('never hardcodes the brand hex; tones resolve through tokens or currentColor', () => {
        const accent = render(<Spinner />).container.innerHTML
        expect(accent).toContain('text-[var(--accent)]')
        expect(accent.toLowerCase()).not.toContain('#4e1bbd')

        const photo = render(<Spinner tone="on-photo" />).container.firstElementChild!
        expect(photo).toHaveClass('text-white')

        const current = render(<Spinner tone="current" />).container.firstElementChild!
        expect(current.className).not.toMatch(/\btext-/)
    })

    it.each([
        ['sm', '1rem'],
        ['md', '1.5rem'],
        ['lg', '2.5rem'],
    ] as const)('size %s is %s, as before the mark', (size, rem) => {
        const { container } = render(<Spinner size={size} />)
        const root = container.firstElementChild as HTMLElement
        expect(root.style.width).toBe(rem)
        expect(root.style.height).toBe(rem)
    })
})
