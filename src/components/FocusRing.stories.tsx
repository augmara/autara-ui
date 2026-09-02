import type { Meta, StoryObj } from '@storybook/react-vite'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './Accordion'
import { BackButton } from './BackButton'
import { Button } from './Button'
import { Checkbox } from './Checkbox'
import { RadioGroup, RadioGroupItem } from './Radio'
import { Stepper } from './Stepper'
import { Switch } from './Switch'

/**
 * Focus ring — the one signature every focusable thing in the library draws.
 *
 * This is not a component. It is the cross-cutting story for AUTM-977, because
 * a focus indicator is a property of the whole library rather than of any one
 * file, and reviewing it component by component is what let twenty-seven call
 * sites drift below the floor while three passed.
 *
 * ─── What was wrong ─────────────────────────────────────────────────────
 *
 * Rings sat at 25-55% alpha across the library — eight different colours for
 * one job. Measured from rendered pixels on the cream canvas, a 35% purple
 * ring is roughly 1.9:1 against the surface behind it, under the 3:1 WCAG
 * 2.4.11 (Focus Appearance) asks of a focus indicator.
 *
 * Several sites also had `ring-offset-2` with no `ring-offset-color`, which is
 * its own bug and a worse-looking one: Tailwind's `--tw-ring-offset-color`
 * falls back to `#fff`, so the band was painted WHITE regardless of what was
 * behind the control — a cream halo inside a dark sheet.
 *
 * ─── The signature ──────────────────────────────────────────────────────
 *
 *   focus-visible:outline-none
 *   focus-visible:ring-2
 *   focus-visible:ring-[var(--accent)]              full strength, TEXT grade
 *   focus-visible:ring-offset-2                     the 2px separating band
 *   focus-visible:ring-offset-[var(--<surface>)]    named, never inferred
 *
 * Three things it gets right that the old one did not:
 *
 *   1. `--accent`, not `--accent-fill`. The fill grade is a step too dark to
 *      read as an indicator on a dark surface, and the raw `#4E1BBD` behind
 *      the `autara-purple` alias measures ~1:1 there.
 *   2. Full strength. Alpha made the ring's contrast depend on whatever the
 *      control happened to be sitting on, which is the opposite of what an
 *      indicator is for.
 *   3. The band is painted in the colour ACTUALLY behind the control. That
 *      band is the only reason a purple ring survives a solid purple fill —
 *      a checked Switch, a checked Checkbox, a primary Button. Purple on
 *      purple at 1.0:1 is how the merchant-mobile Today pass lost a keyboard
 *      user's place on the row they were most likely to be on.
 *
 * ─── Reading these stories ──────────────────────────────────────────────
 *
 * `@storybook/test` is not installed, so there are no play functions to drive
 * focus. `Live` renders real controls — put the cursor in the canvas and press
 * Tab. `SideBySide` forces the ring statically with the equivalent non-
 * `focus-visible` classes so the before and after can be measured off one
 * screenshot without a keyboard.
 */
const meta: Meta = {
    title: 'Foundations/Focus ring',
    parameters: { layout: 'padded' },
}
export default meta
type Story = StoryObj

const OLD = 'ring-2 ring-[var(--accent)]/35 ring-offset-2 ring-offset-[var(--background)]'
const NEW = 'ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[var(--background)]'

function Pane({
    label,
    theme,
    children,
}: {
    label: string
    theme?: 'dark'
    children: React.ReactNode
}) {
    return (
        <div
            data-theme={theme}
            className="space-y-4 rounded-autara-lg bg-[var(--background)] p-5"
        >
            <p className="text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]">
                {label}
            </p>
            {children}
        </div>
    )
}

/**
 * Before and after, forced on so both are visible in one screenshot.
 *
 * The left column is what every control in the library drew until this ticket.
 * On a solid accent fill it is the hardest to find, which is exactly where a
 * keyboard user is most likely to be.
 */
export const SideBySide: Story = {
    name: 'Before and after — 35% alpha against full strength',
    render: () => (
        <div className="grid gap-6 lg:grid-cols-2">
            {[
                { label: 'light', theme: undefined },
                { label: 'dark', theme: 'dark' as const },
            ].map((col) => (
                <Pane key={col.label} label={col.label} theme={col.theme}>
                    {[
                        { name: 'was — /35 alpha', ring: OLD },
                        { name: 'now — full strength', ring: NEW },
                    ].map((row) => (
                        <div key={row.name} className="space-y-2">
                            <p className="text-xs text-[var(--text-muted)]">{row.name}</p>
                            <div className="flex flex-wrap items-center gap-4">
                                <Button variant="primary" className={row.ring}>
                                    On a solid fill
                                </Button>
                                <Button variant="secondary" className={row.ring}>
                                    On elevated
                                </Button>
                                <Button variant="ghost" className={row.ring}>
                                    On the canvas
                                </Button>
                            </div>
                        </div>
                    ))}
                </Pane>
            ))}
        </div>
    ),
}

/**
 * Every control this ticket swept, live, in both themes. Press Tab.
 *
 * `Checkbox` and `Switch` are the ones to watch when checked: both paint a
 * solid `--accent-fill`, so the 2px band is the only thing between the ring
 * and a fill of nearly the same hue.
 */
export const Live: Story = {
    name: 'In context — tab through the swept controls, both themes',
    render: () => (
        <div className="grid gap-6 lg:grid-cols-2">
            {[
                { label: 'light', theme: undefined },
                { label: 'dark', theme: 'dark' as const },
            ].map((col) => (
                <Pane key={col.label} label={col.label} theme={col.theme}>
                    <div className="flex flex-wrap items-center gap-4">
                        <Button variant="primary">Primary</Button>
                        <Button variant="dark">Dark</Button>
                        <Button variant="destructive">Destructive</Button>
                        <Button variant="acid">Acid</Button>
                        <BackButton label="Bookings" />
                    </div>

                    <div className="flex flex-wrap items-center gap-6 rounded-autara-lg bg-[var(--surface)] p-4">
                        <label className="flex items-center gap-2 text-sm text-[var(--text-strong)]">
                            <Checkbox defaultChecked /> Checked
                        </label>
                        <label className="flex items-center gap-2 text-sm text-[var(--text-strong)]">
                            <Checkbox /> Unchecked
                        </label>
                        <label className="flex items-center gap-2 text-sm text-[var(--text-strong)]">
                            <Switch defaultChecked /> On
                        </label>
                        <RadioGroup defaultValue="a" className="flex items-center gap-4">
                            <label className="flex items-center gap-2 text-sm text-[var(--text-strong)]">
                                <RadioGroupItem value="a" /> One
                            </label>
                            <label className="flex items-center gap-2 text-sm text-[var(--text-strong)]">
                                <RadioGroupItem value="b" /> Two
                            </label>
                        </RadioGroup>
                    </div>

                    <div className="rounded-autara-lg bg-[var(--surface)] px-4">
                        <Accordion type="single" collapsible>
                            <AccordionItem value="one">
                                <AccordionTrigger>What does a deposit cover?</AccordionTrigger>
                                <AccordionContent>
                                    It holds your slot and comes off the final price.
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>

                    <Stepper
                        steps={[
                            { id: '1', label: 'Business' },
                            { id: '2', label: 'Services' },
                            { id: '3', label: 'Payments' },
                        ]}
                        currentStep={2}
                        furthestStep={2}
                        onStepClick={() => {}}
                    />
                </Pane>
            ))}
        </div>
    ),
}
