import type { Meta, StoryObj } from '@storybook/react-vite'
import { useRef, useState } from 'react'
import { useAutoHideHeader } from '../lib/use-auto-hide-header'

/**
 * # useAutoHideHeader
 *
 * A fixed header that steps out of the way on the way down and comes back on
 * the way up. AUTM-1679.
 *
 * The hook returns `hidden`; the header carries `.autohide-header` and
 * `data-hidden`, and slides on transform alone, so nothing under it moves.
 * It stays at the top of the page, while focus is inside it (Tab into it),
 * while `disabled` (the menu below), and until the page is past `after`.
 */
function Demo({ after = 0 }: { after?: number }) {
    const ref = useRef<HTMLElement>(null)
    const [menu, setMenu] = useState(false)
    const hidden = useAutoHideHeader({ ref, after, disabled: menu })
    return (
        <div style={{ background: 'var(--hero)', color: 'var(--on-deep)', minHeight: '300vh' }}>
            <header
                ref={ref}
                className="autohide-header"
                data-hidden={hidden ? 'true' : 'false'}
                style={{
                    position: 'fixed',
                    insetInline: 0,
                    top: 0,
                    zIndex: 10,
                    height: '4rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 1.5rem',
                    background: 'var(--hero)',
                }}
            >
                <a href="#top" style={{ color: 'inherit' }}>
                    Autara for business
                </a>
                <button type="button" onClick={() => setMenu((m) => !m)} aria-expanded={menu}>
                    {menu ? 'Close menu' : 'Menu'}
                </button>
            </header>
            <p style={{ padding: '6rem 1.5rem 0', margin: 0 }}>
                Scroll down: the header slides away. Scroll up a little: it comes back. Open the menu and it stays.
                {after ? ` It stays until the page is ${after}px down.` : ''}
            </p>
        </div>
    )
}

const meta = {
    title: 'Marketing/useAutoHideHeader',
    component: Demo,
    parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** Kept until the page is past a hero (`after`). */
export const AfterTheHero: Story = { args: { after: 600 } }
