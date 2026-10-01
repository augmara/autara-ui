import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { SocialButton } from './SocialButton'

/**
 * AUTM-1513 — SocialButton. Pins what consumers rely on: the default
 * "Continue with …" labels (merchant-web's old "Sign up with …" is gone),
 * busy keeping the label and marking aria-busy, the provider and theme hooks
 * the stylesheet keys off, and passthrough of test ids and handlers.
 */
describe('SocialButton', () => {
    it('labels each provider "Continue with …" by default', () => {
        render(
            <>
                <SocialButton provider="google" />
                <SocialButton provider="apple" />
                <SocialButton provider="mobile" />
            </>,
        )
        expect(screen.getByRole('button', { name: 'Continue with Google' })).toBeTruthy()
        expect(screen.getByRole('button', { name: 'Continue with Apple' })).toBeTruthy()
        expect(screen.getByRole('button', { name: 'Continue with mobile' })).toBeTruthy()
    })

    it('busy keeps the label, swaps the mark for a spinner and sets aria-busy', () => {
        render(<SocialButton provider="google" busy disabled />)
        const btn = screen.getByRole('button', { name: 'Continue with Google' })
        expect(btn.getAttribute('aria-busy')).toBe('true')
        expect(btn.querySelector('.social-btn__spinner')).toBeTruthy()
        expect(btn.querySelector('svg')).toBeNull()
    })

    it('exposes provider and theme for the stylesheet, and is a plain button', () => {
        render(<SocialButton provider="apple" theme="dark" />)
        const btn = screen.getByRole('button')
        expect(btn.getAttribute('data-provider')).toBe('apple')
        expect(btn.getAttribute('data-theme')).toBe('dark')
        expect(btn.getAttribute('type')).toBe('button')
    })

    it('passes test ids, handlers and a custom label through', () => {
        const onClick = vi.fn()
        render(<SocialButton provider="google" data-testid="sign-in-google" label="Use Google" onClick={onClick} />)
        const btn = screen.getByTestId('sign-in-google')
        expect(btn.textContent).toContain('Use Google')
        fireEvent.click(btn)
        expect(onClick).toHaveBeenCalledTimes(1)
    })
})
