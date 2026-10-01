import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'

import { SocialButton } from './SocialButton'

const meta: Meta<typeof SocialButton> = {
    title: 'Forms/SocialButton',
    component: SocialButton,
    parameters: {
        docs: {
            description: {
                component:
                    'The one social sign-in button (canvas v49, UiSocialAuth). 52px pill, 17px Medium label, a 20px mark centred with the label as one unit. Google and Apple follow their own guidelines in light and dark; mobile is Autara’s paper button with the field’s edge. Order on a page: mobile, Apple, Google, with Apple hidden while its flag is off. "Continue with …" in sign-up and sign-in alike.',
            },
        },
    },
    args: { provider: 'google' },
}
export default meta
type Story = StoryObj<typeof SocialButton>

function Stack({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
    return (
        <div style={{ background: dark ? '#0e0a1a' : '#ffffff', padding: 24, borderRadius: 24, maxWidth: 448 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>{children}</div>
        </div>
    )
}

export const Google: Story = { args: { provider: 'google' }, render: (a) => <Stack><SocialButton {...a} /></Stack> }
export const Apple: Story = { args: { provider: 'apple' }, render: (a) => <Stack><SocialButton {...a} /></Stack> }
export const Mobile: Story = { args: { provider: 'mobile' }, render: (a) => <Stack><SocialButton {...a} /></Stack> }

/** The board's light stack, in the shipped order. */
export const LightStack: Story = {
    render: () => (
        <Stack>
            <SocialButton provider="mobile" />
            <SocialButton provider="apple" />
            <SocialButton provider="google" />
        </Stack>
    ),
}

/** Dark surfaces: the merchant landing and the app's dark theme. */
export const DarkStack: Story = {
    render: () => (
        <Stack dark>
            <SocialButton provider="mobile" theme="dark" />
            <SocialButton provider="apple" theme="dark" />
            <SocialButton provider="google" theme="dark" />
        </Stack>
    ),
}

/** Busy: the pressed button keeps its label with a spinner in place of the mark; the caller disables the rest. */
export const Busy: Story = {
    render: () => (
        <Stack>
            <SocialButton provider="apple" disabled />
            <SocialButton provider="google" busy disabled />
        </Stack>
    ),
}

/** A sign-in form in context: the field, the primary, "or", then the stack (Apple flagged off). */
export const InContext: Story = {
    render: () => (
        <div style={{ maxWidth: 460, display: 'flex', flexDirection: 'column', gap: 18, fontFamily: 'inherit' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span style={{ fontSize: 16, fontWeight: 500 }}>Email</span>
                <input className="field-input" placeholder="you@example.com" />
            </label>
            <button type="button" style={{ minHeight: 52, borderRadius: 9999, border: 0, background: '#d4ff4f', fontSize: 17, fontWeight: 500 }}>
                Continue
            </button>
            <div style={{ textAlign: 'center', fontSize: 14, color: 'rgba(14,10,26,0.58)' }}>or</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                <SocialButton provider="mobile" />
                <SocialButton provider="google" />
            </div>
        </div>
    ),
}

/**
 * Large text in a narrow column (the landing panel at a 32px root is about 200px wide):
 * the label wraps between words and the mark moves above it, never a word broken in two.
 */
export const LargeText: Story = {
    render: () => (
        <div style={{ maxWidth: 200 }}>
            <Stack>
                <SocialButton provider="apple" style={{ fontSize: '2.125rem' }} />
                <SocialButton provider="google" style={{ fontSize: '2.125rem' }} />
            </Stack>
        </div>
    ),
}
