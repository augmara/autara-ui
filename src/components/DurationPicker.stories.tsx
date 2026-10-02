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
                    'How long a job takes, read in hours and minutes. A stored value shows as "2 hr 30 min", never as 150. The clock opens one sheet with hours and minutes side by side, both visible, the result in words at the top and the common lengths one tap each. The field also takes typing, in minutes or words ("90", "1h 30"), and never rewrites it, so the form keeps reporting bad input in its own words and QA can still `.fill()` it.',
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
function openSheet() {
    return async ({ canvasElement }: { canvasElement: HTMLElement }) => {
        canvasElement.querySelector<HTMLButtonElement>('[data-testid$="-open"]')?.click()
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

/**
 * Typed minutes stay as typed, and the clock reads them back. QA fills this
 * field with minutes and asserts it still holds exactly that.
 */
export const TypedMinutes: Story = {
    name: 'Typed minutes, read back on the clock',
    render: () => {
        function Typed() {
            const [value, setValue] = React.useState('')
            const ref = React.useRef<HTMLDivElement>(null)
            React.useEffect(() => {
                const input = ref.current?.querySelector('input')
                if (!input) return
                const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
                setter?.call(input, '720')
                input.dispatchEvent(new Event('input', { bubbles: true }))
            }, [])
            return (
                <div ref={ref} className="max-w-sm">
                    <DurationPicker value={value} onChange={setValue} testId="duration" />
                </div>
            )
        }
        return <Typed />
    },
}

/** The 24 hr maximum: minutes past it are not offered. */
export const AtTheMaximum: Story = {
    name: 'The 24 hr maximum',
    render: () => <Controlled value="1440" testId="duration" />,
    play: openSheet(),
}

/**
 * The field does not rewrite what was typed, and it does not pretend to
 * understand it either: `12.5` stays `12.5`, and the message below is the
 * consumer's, exactly as the service form writes it.
 */
export const InvalidValueIsLeftAlone: Story = {
    name: 'An invalid value, left as typed',
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
 * What to look for: the field grows instead of cropping, and the picker
 * trigger wraps under the input rather than squeezing it, so neither the
 * typed minutes nor the summary is truncated.
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
 *  - the `<Label htmlFor="service-duration">` points at the typable input,
 *    which is the element QA's suite locates and `.fill()`s, so the label
 *    names it and a click on the label focuses it with no extra wiring;
 *  - validity is entirely the consumer's. Type `12.5`, `0` or `4320` and the
 *    field keeps it while the message below reports it.
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
