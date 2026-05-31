import type { Meta, StoryObj } from '@storybook/react-vite'
import { CompactSearchPill } from './CompactSearchPill'

/**
 * CompactSearchPill — mobile sticky search affordance.
 *
 * Promoted from autara-customer-web 2026-05-30 (AUTAA-UI-007).
 */

const meta: Meta<typeof CompactSearchPill> = {
    title: 'Molecules/CompactSearchPill',
    component: CompactSearchPill,
    parameters: { layout: 'fullscreen' },
    decorators: [
        (Story) => (
            <div className="relative min-h-[420px] bg-[var(--background)]">
                <Story />
            </div>
        ),
    ],
}

export default meta
type Story = StoryObj<typeof meta>

const noop = () => {}

export const Visible: Story = {
    name: 'Visible — empty service',
    args: {
        visible: true,
        value: '',
        placeholder: 'Search car-care services',
        onOpen: noop,
        onSubmit: noop,
    },
}

export const Filled: Story = {
    name: 'Visible — user picked a service',
    args: {
        visible: true,
        value: 'Ceramic coating',
        placeholder: 'Search car-care services',
        onOpen: noop,
        onSubmit: noop,
    },
}

export const Hidden: Story = {
    name: 'Hidden (visible=false)',
    args: {
        visible: false,
        value: '',
        placeholder: 'Search car-care services',
        onOpen: noop,
        onSubmit: noop,
    },
}
