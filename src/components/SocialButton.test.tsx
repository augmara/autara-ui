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

    it('busy keeps the label, swaps the mark for the turning Autara mark and sets aria-busy (AUTM-1708)', () => {
        render(<SocialButton provider="google" busy />)
        const btn = screen.getByRole('button', { name: 'Continue with Google' }) as HTMLButtonElement
        expect(btn.getAttribute('aria-busy')).toBe('true')
        // Disabled by busy alone, so a second tap cannot start a second sign-in.
        expect(btn.disabled).toBe(true)
        const mark = btn.querySelector('.social-btn__mark')!
        expect(mark.querySelector('svg.autara-loader')).not.toBeNull()
        // Decorative: the button is already named and busy.
        expect(mark.firstElementChild!.getAttribute('aria-hidden')).toBe('true')
        expect(mark.firstElementChild!.getAttribute('data-size')).toBe('20')
        expect(btn.querySelector('.social-btn__spinner')).toBeNull()
    })

    it('presses on motion-press by default, and press={false} opts out', () => {
        const { rerender } = render(<SocialButton provider="apple" />)
        expect(screen.getByRole('button').className).toContain('motion-press')
        rerender(<SocialButton provider="apple" press={false} />)
        expect(screen.getByRole('button').className).not.toContain('motion-press')
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

    it('an icon override replaces the provider mark, and busy still wins', () => {
        const { rerender } = render(<SocialButton provider="mobile" label="Continue with email" icon={<i data-testid="mail-mark" />} />)
        expect(screen.getByTestId('mail-mark')).toBeTruthy()
        rerender(<SocialButton provider="mobile" label="Continue with email" icon={<i data-testid="mail-mark" />} busy />)
        expect(screen.queryByTestId('mail-mark')).toBeNull()
    })
})
