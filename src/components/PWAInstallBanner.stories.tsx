import type { Meta, StoryObj } from '@storybook/react-vite'
import { PWAInstallBanner } from './PWAInstallBanner'

/**
 * PWAInstallBanner — story renders a static visual mock of the banner.
 *
 * The component's anti-nag logic (display-mode standalone, 12s delay,
 * localStorage dismissed-flag) makes the live banner near-impossible
 * to render reliably in Storybook. The "Visual" story below stubs the
 * runtime gating so the banner appears immediately.
 *
 * Promoted from autara-customer-web 2026-05-30 (AUTAA-UI-007).
 */

const meta = {
    title: 'Molecules/PWAInstallBanner',
    component: PWAInstallBanner,
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component:
                    'Bottom-anchored mobile-only PWA install affordance. Two paths: Chrome (`beforeinstallprompt`) and iOS Safari (manual share + add). Honours `display-mode: standalone` and a 30-day dismiss TTL by default.',
            },
        },
    },
} satisfies Meta<typeof PWAInstallBanner>

export default meta
type Story = StoryObj<typeof meta>

/* In Storybook the banner's anti-nag rules suppress it. Bypass them
   for the visual story by clearing the dismiss flag and shortening
   the delay. */
export const Visual: Story = {
    name: 'Visual — Chrome path (Install button visible)',
    args: {
        firstShowDelayMs: 0,
    },
    decorators: [
        (Story) => {
            if (typeof window !== 'undefined') {
                window.localStorage.removeItem('autara.pwa.dismissedAt')
                /* Synthesise a beforeinstallprompt for the visual story. */
                setTimeout(() => {
                    const evt = new Event('beforeinstallprompt') as Event & {
                        prompt: () => Promise<void>
                        userChoice: Promise<{ outcome: string }>
                    }
                    evt.prompt = async () => {}
                    evt.userChoice = Promise.resolve({ outcome: 'dismissed' })
                    window.dispatchEvent(evt)
                }, 100)
            }
            return (
                <div className="relative min-h-[420px] bg-[var(--background)]">
                    <p className="px-4 pt-6 text-[12px] uppercase tracking-[0.22em] text-[var(--text-muted)]">
                        Page content above — banner pins to viewport bottom
                    </p>
                    <Story />
                </div>
            )
        },
    ],
}

export const Customised: Story = {
    name: 'Customised copy (Merchant app)',
    args: {
        appName: 'Autara Pro',
        eyebrow: 'For your phone',
        headline: 'Autara Pro on your home screen',
        body: 'Tap to manage bookings without opening the browser.',
        installLabel: 'Add it',
        firstShowDelayMs: 0,
    },
    decorators: [
        (Story) => {
            if (typeof window !== 'undefined') {
                window.localStorage.removeItem('autara.pwa.dismissedAt')
                setTimeout(() => {
                    const evt = new Event('beforeinstallprompt') as Event & {
                        prompt: () => Promise<void>
                        userChoice: Promise<{ outcome: string }>
                    }
                    evt.prompt = async () => {}
                    evt.userChoice = Promise.resolve({ outcome: 'dismissed' })
                    window.dispatchEvent(evt)
                }, 100)
            }
            return (
                <div className="relative min-h-[420px] bg-[var(--background)]">
                    <Story />
                </div>
            )
        },
    ],
}
