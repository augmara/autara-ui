import type { Meta, StoryObj } from '@storybook/react-vite'
import { PageContainer } from './PageContainer'

/**
 * # PageContainer
 *
 * The page's content track (AUTM-1739, Wise as the reference). Up to 1440px
 * of content (`--page-max`), a fluid gutter either side (`--page-gutter`:
 * 16px on a phone, 96px from 1440), centred. Resize the canvas or use the
 * viewport toolbar: the purple band is the content, the hatched strips are
 * the gutters, and the numbers are measured live.
 *
 * Sections, grids and product visuals take the full track; running text
 * keeps a readable line with `measure` or `.page-measure` (about 65 to 70
 * characters).
 */
const meta = {
    title: 'Layout/PageContainer',
    component: PageContainer,
    parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof PageContainer>

export default meta
type Story = StoryObj<typeof meta>

function Ruler() {
    return (
        <div
            ref={(el) => {
                if (!el) return
                const track = el.parentElement as HTMLElement
                const write = () => {
                    const cs = getComputedStyle(track)
                    const content = track.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)
                    el.textContent = `viewport ${window.innerWidth}px · gutter ${Math.round(parseFloat(cs.paddingLeft))}px · content ${Math.round(content)}px`
                }
                write()
                window.addEventListener('resize', write)
            }}
            style={{ font: '500 0.875rem/1.4 var(--font-brand)', color: 'var(--on-deep)' }}
        />
    )
}

const gutters = {
    background:
        'repeating-linear-gradient(135deg, var(--band) 0 8px, var(--paper) 8px 16px)',
    minHeight: '100vh',
}

export const Default: Story = {
    render: () => (
        <div style={gutters}>
            <PageContainer as="section" style={{ paddingBlock: '2rem' }}>
                <div style={{ background: 'var(--hero)', borderRadius: '1rem', padding: '1.5rem', display: 'grid', gap: '1rem' }}>
                    <Ruler />
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(14rem, 1fr))', gap: '1rem' }}>
                        {['Bookings', 'Your schedule', 'Customers', 'Payments and payouts'].map((t) => (
                            <div key={t} style={{ background: 'var(--paper)', borderRadius: '1rem', padding: '1.25rem', color: 'var(--strong)', fontWeight: 700 }}>
                                {t}
                            </div>
                        ))}
                    </div>
                </div>
            </PageContainer>
        </div>
    ),
}

/** Running text inside the wide track keeps a readable line (`measure`). */
export const WithMeasure: Story = {
    render: () => (
        <div style={gutters}>
            <PageContainer as="article" measure style={{ paddingBlock: '2rem', color: 'var(--strong)' }}>
                <h2 style={{ marginTop: 0, color: 'inherit' }}>A page of running text</h2>
                {Array.from({ length: 3 }, (_, i) => (
                    <p key={i} style={{ lineHeight: 1.7 }}>
                        Customers pick a service and a time and pay a deposit. The request lands in your inbox, and you confirm or
                        decline it. The deposit is charged when you confirm, and the rest when you mark the job done. Stripe pays it
                        into your own bank account.
                    </p>
                ))}
            </PageContainer>
        </div>
    ),
}

/** The class, for markup that cannot use the component: a header's bar, say. */
export const AsAClass: Story = {
    render: () => (
        <header style={{ background: 'var(--hero)', color: 'var(--on-deep)' }}>
            <nav className="page-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: '5rem' }}>
                <strong>Autara for business</strong>
                <span>How it works · Pricing · FAQ</span>
            </nav>
        </header>
    ),
}
