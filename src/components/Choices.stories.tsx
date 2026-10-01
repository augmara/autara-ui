import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState, type ReactNode } from 'react'
import { Tabs, TabsList, TabsTrigger } from './Tabs'
import { Switch } from './Switch'
import { Checkbox } from './Checkbox'
import { RadioGroup, RadioGroupItem } from './Radio'
import { ChoiceCard, ChoiceGroup } from './ChoiceCard'
import { FilterChipRow } from './FilterChipRow'

/**
 * Choices — canvas v44's "Choices" section (AUTM-1594): segmented, switch,
 * checkbox, radio, choice card and filter chips together, laid out at the
 * sheet's geometry (1440, 80px gutters, three columns) for the overlay.
 * Each component also has its own stories.
 */
const meta = {
    title: 'Molecules/Choices',
    parameters: { layout: 'fullscreen' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

function Specimen({ name, component, note, children }: { name: string; component: string; note?: string; children: ReactNode }) {
    return (
        <div className="flex min-w-0 flex-col gap-2.5">
            <div className="flex items-baseline justify-between gap-3">
                <span className="text-[0.9375rem] leading-[normal] font-bold">{name}</span>
                <code className="font-mono text-xs text-[var(--text-subtle)]">{component}</code>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">{children}</div>
            {note && <span className="text-[0.8125rem] leading-[1.45] text-[var(--text-subtle)]">{note}</span>}
        </div>
    )
}

function Row({ children }: { children: ReactNode }) {
    return <label className="flex min-h-11 items-center gap-3 text-base text-[var(--text-strong)]">{children}</label>
}

function SheetBody() {
    const [chip, setChip] = useState<string>('all')
    const [mode, setMode] = useState<string | null>(null)
    return (
        <div style={{ padding: '72px 80px', background: 'var(--paper)', color: 'var(--text-strong)' }}>
            <section className="flex flex-col gap-5 border-t border-[var(--hairline)] py-10">
                <div className="flex flex-col gap-1.5">
                    <h2 className="text-section m-0">Choices</h2>
                    <p className="text-body m-0 text-[var(--text-muted)]">
                        Segments switch a view; switches change a setting at once; checkboxes and radios sit inside forms. All rows are at least 44px.
                    </p>
                </div>
                <div className="grid grid-cols-3 gap-x-10 gap-y-8">
                    <Specimen name="Segmented" component="Tabs variant=segmented">
                        <Tabs defaultValue="week">
                            <TabsList>
                                {['Day', 'Today', 'Week', 'Month', 'List'].map((t) => (
                                    <TabsTrigger key={t} value={t.toLowerCase()}>
                                        {t}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </Tabs>
                    </Specimen>
                    <Specimen name="Switch" component="Switch">
                        <Row>
                            <Switch defaultChecked aria-label="On" />
                            On
                        </Row>
                        <Row>
                            <Switch aria-label="Off" />
                            Off
                        </Row>
                    </Specimen>
                    <Specimen name="Checkbox" component="Checkbox">
                        <Row>
                            <Checkbox defaultChecked />I agree to the terms
                        </Row>
                        <Row>
                            <Checkbox />
                            Email me launch news
                        </Row>
                    </Specimen>
                    <Specimen name="Radio" component="Radio">
                        <RadioGroup defaultValue="mobile" className="flex flex-wrap gap-2.5">
                            <Row>
                                <RadioGroupItem value="mobile" />
                                Comes to you
                            </Row>
                            <Row>
                                <RadioGroupItem value="workshop" />
                                At your workshop
                            </Row>
                        </RadioGroup>
                    </Specimen>
                    <Specimen
                        name="Choice card"
                        component="ChoiceCard"
                        note="Both choices are band; a tap picks and moves on, so there is no selected state."
                    >
                        <ChoiceGroup name="mode" value={mode} onChange={setMode} columns={1} className="w-full">
                            <ChoiceCard value="workshop" label="Visit the workshop" description="Drop the vehicle at Brunswick VIC." />
                        </ChoiceGroup>
                    </Specimen>
                    <Specimen name="Filter chips" component="FilterChipRow">
                        <FilterChipRow
                            options={[
                                { value: 'all', label: 'All' },
                                { value: 'requests', label: 'Requests' },
                                { value: 'confirmed', label: 'Confirmed' },
                            ]}
                            value={chip}
                            onChange={setChip}
                        />
                    </Specimen>
                </div>
            </section>
        </div>
    )
}

export const Sheet: Story = { render: () => <SheetBody /> }
