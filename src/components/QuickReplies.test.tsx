import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { QuickReplies } from './QuickReplies'

/** AUTM-1806 (U4). */
describe('QuickReplies', () => {
    const replies = [
        { id: 'late', label: "I'm running late" },
        { id: 'here', label: "I'm here", value: "I'm here, out the front." },
    ]

    it('is a named group of 44px chips that wrap', () => {
        render(<QuickReplies replies={replies} onSelect={() => {}} chipTestId="booking-chat-quick-reply" />)
        const group = screen.getByRole('group', { name: 'Quick replies' })
        expect(group.className).toContain('flex-wrap')
        const chips = screen.getAllByTestId('booking-chat-quick-reply')
        expect(chips).toHaveLength(2)
        for (const chip of chips) expect(chip.className).toContain('min-h-11')
        expect(chips[1].getAttribute('data-reply-id')).toBe('here')
    })

    it('hands the reply back to fill the composer, and sends nothing itself', () => {
        const onSelect = vi.fn()
        render(<QuickReplies replies={replies} onSelect={onSelect} />)
        fireEvent.click(screen.getByRole('button', { name: "I'm here" }))
        expect(onSelect).toHaveBeenCalledWith(replies[1])
    })

    it('draws nothing with no replies', () => {
        const { container } = render(<QuickReplies replies={[]} onSelect={() => {}} />)
        expect(container.firstChild).toBeNull()
    })
})
