import type { Meta, StoryObj } from '@storybook/react-vite'
import { NavSearchPill } from './NavSearchPill'

/**
 * NavSearchPill — three-field horizontal search pill for navbar
 * center slot.
 *
 * State is consumer-owned; the stories below stub onClick + onSubmit
 * with no-ops just to render the chrome.
 *
 * Promoted from autara-customer-web 2026-05-30 (AUTAA-UI-007).
 */

const meta = {
    title: 'Molecules/NavSearchPill',
    component: NavSearchPill,
    parameters: { layout: 'padded' },
} satisfies Meta<typeof NavSearchPill>

export default meta
type Story = StoryObj<typeof meta>

const noop = () => {}

export const Default: Story = {
    args: {
        fields: [
            {
                label: 'Service',
                value: 'Any service',
                placeholder: true,
                onClick: noop,
            },
            {
                label: 'Where',
                value: 'Anywhere',
                placeholder: true,
                onClick: noop,
            },
            {
                label: 'When',
                value: 'Any date',
                placeholder: true,
                onClick: noop,
            },
        ],
        onSubmit: noop,
    },
}

export const Filled: Story = {
    name: 'Filled — user has picked Service + Where',
    args: {
        fields: [
            {
                label: 'Service',
                value: 'Ceramic coating',
                onClick: noop,
            },
            {
                label: 'Where',
                value: 'Surry Hills, NSW',
                onClick: noop,
            },
            {
                label: 'When',
                value: 'Any date',
                placeholder: true,
                onClick: noop,
            },
        ],
        onSubmit: noop,
    },
}

export const TwoFields: Story = {
    name: 'Two fields — When hidden on mobile',
    args: {
        fields: [
            { label: 'Service', value: 'Any service', placeholder: true, onClick: noop },
            { label: 'Where', value: 'Anywhere', placeholder: true, onClick: noop },
            {
                label: 'When',
                value: 'Any date',
                placeholder: true,
                onClick: noop,
                hideOnMobile: true,
            },
        ],
        onSubmit: noop,
    },
}
