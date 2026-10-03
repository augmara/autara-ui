import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'

import { DurationPicker } from './DurationPicker'
import { Label } from './Label'

const meta: Meta<typeof DurationPicker> = {
    title: 'Forms/DurationPicker',
    component: DurationPicker,
    parameters: {
        docs: {
            description: {
                component:
                    'How long a job takes. The field is one button that says the length in words ("2 hr 30 min", or "Choose a length") and opens a sheet: the result in words at the top, the common lengths one tap each, hours and minutes side by side, and "Type a length" for the minutes between the steps (2 hr 23 min). It saves minutes. A stored value off the steps reads correctly and is kept unless changed.',
            },
        },
    },
}
export default meta
type Story = StoryObj<typeof DurationPicker>

function Controlled(props: Partial<React.ComponentProps<typeof DurationPicker>>) {
    const [value, setValue] = React.useState(props.value ?? '')
    return (
        <div className="max-w-sm">
            <DurationPicker {...props} value={value} onChange={setValue} />
        </div>
    )
}

/**
 * Open the sheet, without a test-library import (anything imported here is
 * compiled into `dist`, which consumers install).
 */
function openSheet(typing = false) {
    return async ({ canvasElement }: { canvasElement: HTMLElement }) => {
        canvasElement.querySelector<HTMLButtonElement>('[data-testid="duration"]')?.click()
        if (!typing) return
        for (let attempt = 0; attempt < 60; attempt += 1) {
            const manual = document.querySelector<HTMLButtonElement>('[data-testid="duration-manual-open"]')
            if (manual) {
                manual.click()
                return
            }
            await new Promise((resolve) => setTimeout(resolve, 25))
        }
    }
}

export const Default: Story = {
    render: () => <Controlled testId="duration" />,
}

/** A stored 150 minutes reads as the merchant says it. */
export const StoredValue: Story = {
    name: 'A stored value (150 min)',
    render: () => <Controlled value="150" testId="duration" />,
}

/** Hours and minutes side by side, the result in words, the common lengths above. */
export const SheetOpen: Story = {
    name: 'The sheet',
    render: () => <Controlled value="150" testId="duration" />,
    play: openSheet(),
}

/**
 * 50 minutes is not on the 15-minute steps. It reads correctly, opens with
 * nothing chosen, says so, and is kept unless a new length is picked.
 */
export const OffTheSteps: Story = {
    name: 'A stored value off the steps (50 min)',
    render: () => <Controlled value="50" testId="duration" />,
    play: openSheet(),
}

/**
 * A three-day value saved before the 24-hour cap. It reads "3 days", and the
 * form's validator is what says it can no longer be saved as it is.
 */
export const PreCapThreeDays: Story = {
    name: 'A stored value from before the cap (3 days)',
    render: () => <Controlled value="4320" invalid testId="duration" />,
}

/** "Type a length", for the minutes between the steps: 2 hr 23 min. */
export const TypingALength: Story = {
    name: 'Typing a length in the sheet',
    render: () => <Controlled value="143" testId="duration" />,
    play: openSheet(true),
}

/** The 24 hr maximum: minutes past it are not offered. */
export const AtTheMaximum: Story = {
    name: 'The 24 hr maximum',
    render: () => <Controlled value="1440" testId="duration" />,
    play: openSheet(),
}

/**
 * A stored value the field cannot read is shown as it is, with the
 * consumer's message below it, exactly as the service form writes it.
 */
export const InvalidValueIsLeftAlone: Story = {
    name: 'A stored value it cannot read',
    render: () => (
        <div className="flex max-w-sm flex-col gap-1.5">
            <Label htmlFor="story-invalid-duration">Duration</Label>
            <Controlled id="story-invalid-duration" value="12.5" invalid testId="duration" />
            <p className="text-[0.8125rem] text-[var(--danger)]">
                Duration must be a whole number of minutes.
            </p>
        </div>
    ),
}

export const Disabled: Story = {
    render: () => <Controlled value="90" disabled testId="duration" />,
}

/**
 * 200% text scale, set on the ROOT element rather than on a wrapper.
 *
 * This is the only way to exercise it: every size in this component is in
 * `rem`, which is relative to the root font size, so a `style={{ fontSize:
 * '200%' }}` on a parent moves nothing at all here. 32px is twice the 16px
 * browser default, which is what the OS "larger text" settings do.
 *
 * What to look for: the field grows instead of cropping, and the value in
 * words wraps rather than being cut.
 */
export const TextScale200: Story = {
    name: 'At 200% text scale',
    render: () => {
        function RootScaled() {
            React.useEffect(() => {
                const previous = document.documentElement.style.fontSize
                document.documentElement.style.fontSize = '32px'
                return () => {
                    document.documentElement.style.fontSize = previous
                }
            }, [])
            return (
                <div className="flex flex-col gap-4">
                    <Controlled value="90" testId="duration" />
                    <Controlled testId="duration-empty" />
                </div>
            )
        }
        return <RootScaled />
    },
}

/**
 * Dark theme, stamped the way a consuming app stamps it: `data-theme="dark"`
 * on `<html>`, never a `prefers-color-scheme` branch. Equivalent to the
 * Theme switcher in the toolbar, pinned here so the pairing gets reviewed.
 */
export const DarkTheme: Story = {
    globals: { theme: 'dark' },
    render: () => (
        <div className="flex flex-col gap-4">
            <Controlled value="90" testId="duration" />
            <Controlled value="12.5" invalid testId="duration-invalid" />
            <Controlled testId="duration-empty" />
        </div>
    ),
}

export const DarkThemeSheetOpen: Story = {
    name: 'Dark theme, sheet open',
    globals: { theme: 'dark' },
    render: () => <Controlled value="150" testId="duration" />,
    play: openSheet(),
}

/**
 * In context: the duration field of merchant-mobile's service form, wired
 * the way that screen wires it (`ServiceFormScreen.tsx`) and validated by a
 * mirror of `serviceDurationError` from its `form-rules.ts`.
 *
 * Two things this story is here to hold:
 *  - the `<Label htmlFor="service-duration">` names the field button and a
 *    click on the label focuses it; the button's name carries the value;
 *  - the form's own error still attaches to the field (`aria-describedby`)
 *    for a stored value the form refuses; the sheet itself never hands the
 *    form a length it cannot save.
 */
export const InServiceForm: Story = {
    name: 'In context: service form',
    render: () => {
        function ServiceFormField() {
            const [durationText, setDurationText] = React.useState('')
            const [touched, setTouched] = React.useState(false)

            // Mirrors merchant-mobile serviceDurationError, deliberately
            // verbatim: the point of the story is that this component does
            // not duplicate, replace or soften any of it.
            const error = (() => {
                if (durationText.trim().length === 0) return 'How long does this service take?'
                const typed = Number(durationText.trim())
                if (!Number.isFinite(typed) || typed <= 0)
                    return 'Duration must be a positive whole number.'
                if (!Number.isInteger(typed)) return 'Duration must be a whole number of minutes.'
                if (typed > 1440) return "Duration can't be more than 1440 minutes (24 hours)."
                return null
            })()
            const show = (touched || durationText.length > 0) && error !== null

            return (
                <div className="flex max-w-sm flex-col gap-1.5">
                    <Label htmlFor="service-duration">Duration</Label>
                    <DurationPicker
                        id="service-duration"
                        testId="service-duration"
                        value={durationText}
                        onChange={setDurationText}
                        onBlur={() => setTouched(true)}
                        invalid={show}
                        aria-describedby={show ? 'service-duration-error' : undefined}
                    />
                    {show ? (
                        <p
                            id="service-duration-error"
                            role="alert"
                            className="text-[0.8125rem] text-[var(--color-autara-error)]"
                        >
                            {error}
                        </p>
                    ) : null}
                </div>
            )
        }
        return <ServiceFormField />
    },
}

/**
 * AUTM-1575 — a field that offers working days, held the way a consumer
 * holds it: minutes and days as two values, so switching units loses neither.
 */
function WithWorkingDays({
    minutes = '150',
    days = null,
    ...props
}: Partial<React.ComponentProps<typeof DurationPicker>> & { minutes?: string; days?: number | null }) {
    const [value, setValue] = React.useState(minutes)
    const [workingDays, setWorkingDays] = React.useState<number | null>(days)
    const id = `story-working-days-${React.useId().replace(/:/g, '')}`
    return (
        <div className="flex max-w-xl flex-col gap-1.5">
            <Label htmlFor={id}>Duration</Label>
            <DurationPicker
                id={id}
                testId="duration"
                {...props}
                value={value}
                onChange={setValue}
                workingDays={{ value: workingDays, onChange: setWorkingDays }}
            />
        </div>
    )
}

/** The switch above the hours field, Hours chosen. */
export const WorkingDaysOffered: Story = {
    name: 'Working days offered, set in hours',
    render: () => <WithWorkingDays />,
}

/**
 * Working days chosen: the stepper in place of the field. The approved v39
 * frame's Ceramic Coating, 3 working days.
 */
export const WorkingDaysChosen: Story = {
    name: 'Working days: 3',
    render: () => <WithWorkingDays days={3} />,
}

/** The minus stops at 2: a one-day job is set in hours. */
export const WorkingDaysAtTheMinimum: Story = {
    name: 'Working days: the minimum (2)',
    render: () => <WithWorkingDays days={2} />,
}

/** The plus stops at 10 (Don, 3 Oct 2026). */
export const WorkingDaysAtTheMaximum: Story = {
    name: 'Working days: the maximum (10)',
    render: () => <WithWorkingDays days={10} />,
}

export const WorkingDaysDisabled: Story = {
    name: 'Working days: disabled',
    render: () => <WithWorkingDays days={3} disabled />,
}

export const WorkingDaysDark: Story = {
    name: 'Working days, dark theme',
    globals: { theme: 'dark' },
    render: () => (
        <div className="flex flex-col gap-6">
            <WithWorkingDays />
            <WithWorkingDays days={3} />
        </div>
    ),
}

/** 200% text, set on the root: the switch and the stepper wrap, never crop. */
export const WorkingDaysTextScale200: Story = {
    name: 'Working days at 200% text scale',
    render: () => {
        function RootScaled() {
            React.useEffect(() => {
                const previous = document.documentElement.style.fontSize
                document.documentElement.style.fontSize = '32px'
                return () => {
                    document.documentElement.style.fontSize = previous
                }
            }, [])
            return (
                <div className="flex max-w-[20rem] flex-col gap-6">
                    <WithWorkingDays />
                    <WithWorkingDays days={3} />
                </div>
            )
        }
        return <RootScaled />
    },
}
