import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ConfirmDialog } from './ConfirmDialog'

/**
 * AUTM-1185 — the rules the merchant app learned (AUTM-923) travel with the
 * component: the safe option is never disabled, even while loading, and the
 * parts are named for E2E.
 */
describe('ConfirmDialog', () => {
    it('names its parts from testId and never disables the safe option', () => {
        render(
            <ConfirmDialog
                open
                title="Remove this vehicle?"
                description="It won't be offered at checkout any more."
                confirmLabel="Remove"
                cancelLabel="Keep it"
                tone="destructive"
                loading
                errorMessage="We couldn't remove it."
                onConfirm={vi.fn()}
                onClose={vi.fn()}
                testId="garage-remove"
            />,
        )
        expect(screen.getByTestId('garage-remove')).toBeTruthy()
        const cancel = screen.getByTestId('garage-remove-cancel') as HTMLButtonElement
        expect(cancel.disabled).toBe(false)
        expect(cancel.textContent).toBe('Close')
        const confirm = screen.getByTestId('garage-remove-confirm') as HTMLButtonElement
        expect(confirm.disabled).toBe(true)
        expect(screen.getByTestId('garage-remove-error').getAttribute('role')).toBe('alert')
    })

    it('calls onClose, not onConfirm, when dismissed', () => {
        const onClose = vi.fn()
        const onConfirm = vi.fn()
        render(
            <ConfirmDialog
                open
                title="Sign out?"
                description="You can sign back in any time."
                confirmLabel="Sign out"
                onConfirm={onConfirm}
                onClose={onClose}
                testId="sign-out"
            />,
        )
        screen.getByTestId('sign-out-cancel').click()
        expect(onClose).toHaveBeenCalledTimes(1)
        expect(onConfirm).not.toHaveBeenCalled()
    })
})
