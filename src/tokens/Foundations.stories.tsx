import type { Meta, StoryObj } from '@storybook/react-vite'
import type { CSSProperties, ReactNode } from 'react'

/**
 * Foundations — colour and type (AUTM-1594, canvas v44 UiComponents).
 *
 * The sheet's first two sections, drawn from the tokens rather than from
 * literals, so the Theme toolbar shows UiComponentsDark and a token edited in
 * colors.css or typography.css shows here first. Laid out at the sheet's
 * geometry (1440 wide, 80px gutters, 7 swatch columns) so it can be overlaid
 * on the board.
 */
const meta = {
    title: 'Foundations/Colour and type',
    parameters: { layout: 'fullscreen' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const SWATCHES: Array<[label: string, fill: string, ink: string, role: string]> = [
    ['Paper', '--paper', '--text-strong', 'ground'],
    ['Selected', '--selected', '--on-selected', 'switch, check, radio, chosen chip'],
    ['Band', '--band', '--text-strong', 'cards, quiet buttons'],
    ['Raised', '--raised', '--text-strong', 'rows on band, dark lift'],
    ['Ink', '--strong', '--on-strong', 'strong buttons, toasts'],
    ['Brand', '--brand', '--on-brand', 'pending and confirmed'],
    ['Brand deep', '--brand-deep', '--on-deep', 'selected, hero'],
    ['Lime', '--lime', '--on-lime', 'primary action, done'],
    ['Aqua', '--aqua', '--on-aqua', 'in flight'],
    ['Amber', '--amber', '--on-amber', 'awaiting customer'],
    ['Danger', '--danger', '--paper', 'text and field borders only'],
    ['Positive', '--positive', '--paper', 'open dot'],
    ['Accent text', '--accent', '--paper', 'links'],
]

const TYPE: Array<[label: string, tag: string, className: string, sample: string]> = [
    ['Display', 'h1', 'text-display', 'Good morning, Priya.'],
    ['Section', 'h2 / SectionHeading', 'text-section', 'Needs your answer'],
    ['Figure', 'StatTile value', 'text-figure tabular-nums', '$1,874'],
    ['Title', 'h3, row title', 'text-title', 'Full Interior Detail'],
    ['Body', 'p', 'text-body text-[var(--text-muted)]', 'Requests are cancelled automatically if they go unanswered.'],
    ['Meta', 'caption', 'text-caption text-[var(--text-subtle)]', 'Asked 20h ago'],
]

const page: CSSProperties = { padding: '72px 80px', background: 'var(--paper)', color: 'var(--text-strong)' }
const rule: CSSProperties = { borderTop: '1px solid var(--hairline)', padding: '40px 0', display: 'flex', flexDirection: 'column', gap: 20 }

function Section({ title, lead, children }: { title: string; lead: string; children: ReactNode }) {
    return (
        <section style={rule}>
            <div className="flex flex-col gap-1.5">
                <h2 className="text-section m-0">{title}</h2>
                <p className="text-body m-0 text-[var(--text-muted)]">{lead}</p>
            </div>
            {children}
        </section>
    )
}

function Colour() {
    return (
        <Section
            title="Colour"
            lead="One set of tokens for both themes. Lime is never placed on band (1.03:1); there, the action is ink."
        >
            <div className="grid grid-cols-7 gap-x-10 gap-y-8">
                {SWATCHES.map(([label, fill, ink, role]) => (
                    <div key={label} className="flex min-w-0 flex-col gap-2">
                        <span
                            className="flex h-[4.5rem] items-end rounded-[1.125rem] px-3 py-2.5 text-[0.8125rem] leading-[normal] font-bold"
                            style={{ background: `var(${fill})`, color: `var(${ink})`, boxShadow: 'inset 0 0 0 1px var(--hairline)' }}
                        >
                            {label}
                        </span>
                        <span className="text-[0.8125rem] leading-[normal] text-[var(--text-muted)]">
                            {fill} · {role}
                        </span>
                    </div>
                ))}
            </div>
        </Section>
    )
}

function Type() {
    return (
        <Section
            title="Type"
            lead="Satoshi. Display and headings Black at 1.04 line-height; body Regular; labels and buttons Medium; emphasis Bold. Sentence case, no letterspaced capitals."
        >
            <div className="grid grid-cols-3 gap-x-10 gap-y-8">
                {TYPE.map(([label, tag, className, sample]) => (
                    <div key={label} className="flex min-w-0 flex-col gap-3">
                        <div className="flex items-baseline justify-between gap-3">
                            <span className="text-[0.9375rem] leading-[normal] font-bold">{label}</span>
                            <code className="font-mono text-xs text-[var(--text-subtle)]">{tag}</code>
                        </div>
                        <p className={`m-0 ${className}`}>{sample}</p>
                    </div>
                ))}
            </div>
        </Section>
    )
}

/** Colour and type, as on the sheet. Flip the Theme toolbar for the dark sheet. */
export const Sheet: Story = {
    render: () => (
        <div style={page}>
            <Colour />
            <Type />
        </div>
    ),
}

/** Both themes at once, each on its own data-theme island (AUTM-948). */
export const BothThemes: Story = {
    render: () => (
        <div className="grid grid-cols-1">
            <div data-theme="light" style={page}>
                <Colour />
            </div>
            <div data-theme="dark" style={page}>
                <Colour />
            </div>
        </div>
    ),
}

