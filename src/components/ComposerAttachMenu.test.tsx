import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ComposerAttachMenu } from './ComposerAttachMenu'

/** AUTM-1806 (U5). */
describe('ComposerAttachMenu', () => {
    it('is a named 44px disc that opens a sheet of the rows it was given', () => {
        render(
            <ComposerAttachMenu
                triggerTestId="booking-chat-attach-open"
                items={[{ id: 'extra', label: 'Add an extra', onSelect: () => {}, testId: 'booking-chat-extra-add' }]}
            />,
        )
        const plus = screen.getByRole('button', { name: 'Add a photo or an extra' })
        expect(plus.getAttribute('data-testid')).toBe('booking-chat-attach-open')
        expect(plus.className).toContain('size-11')
        fireEvent.click(plus)
        expect(screen.getByRole('dialog', { name: 'Add to the conversation' })).toBeTruthy()
        expect(screen.getByTestId('booking-chat-extra-add').textContent).toContain('Add an extra')
    })

    it('closes first, then runs the chosen row', async () => {
        const onSelect = vi.fn()
        render(<ComposerAttachMenu items={[{ id: 'extra', label: 'Add an extra', onSelect }]} />)
        fireEvent.click(screen.getByRole('button', { name: 'Add a photo or an extra' }))
        fireEvent.click(screen.getByRole('button', { name: /Add an extra/ }))
        await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
        await waitFor(() => expect(onSelect).toHaveBeenCalledTimes(1))
    })

    it('runs nothing when dismissed', async () => {
        const onSelect = vi.fn()
        render(<ComposerAttachMenu items={[{ id: 'extra', label: 'Add an extra', onSelect }]} />)
        fireEvent.click(screen.getByRole('button', { name: 'Add a photo or an extra' }))
        fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
        await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
        expect(onSelect).not.toHaveBeenCalled()
    })
})
