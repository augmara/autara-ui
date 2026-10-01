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
                    'How long a job takes. The field is typable minutes, with no native spinner anywhere, and the picker beside it offers hours and quarter hours so nobody has to convert an hour and a half into 90 in their head. The picker only offers durations that can be saved; the field takes anything, so the form keeps reporting bad input in its own words.',
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
 * Open the picker and drill into one hour, without a test-library import
 * (anything imported here is compiled into `dist`, which consumers install).
 */
function openTo(hourRow: string) {
    return async ({ canvasElement }: { canvasElement: HTMLElement }) => {
        canvasElement.querySelector<HTMLButtonElement>('[data-testid$="-open"]')?.click()
        // The sheet portals to document.body, so the search starts there.
        for (let attempt = 0; attempt < 60; attempt += 1) {
            const row = Array.from(document.querySelectorAll<HTMLElement>('[role="option"]')).find(
                (el) => el.textContent?.trim().startsWith(hourRow),
            )
            if (row) {
                row.click()
                return
            }
            await new Promise((resolve) => setTimeout(resolve, 25))
        }
    }
}

export const Default: Story = {
    render: () => <Controlled testId="duration" />,
}

/** An hour and a half, which is the duration this control exists for. */
export const TypicalValue: Story = {
    name: 'A typical value (90 min)',
    render: () => <Controlled value="90" testId="duration" />,
}

/** Whole hours drop the zero part: "2 hr", never "2 hr 0 min". */
export const WholeHours: Story = {
    render: () => <Controlled value="120" testId="duration" />,
}

/**
 * The cap is 1440 minutes (`MAX_DURATION_MINUTES` in merchant-mobile's
 * `form-rules.ts`), so 24 hr is the last savable duration and the three
 * minute rows above it are out, each saying why rather than just dimming.
 * There is no days unit anywhere, because there is no duration beyond this.
 */
export const AtTheMaximum: Story = {
    name: 'The 24 hr maximum',
    render: () => <Controlled value="1440" testId="duration" />,
    play: openTo('24 hr'),
}

/** The shortest durations live under the first hour, which reads as itself. */
export const UnderAnHour: Story = {
    render: () => <Controlled value="45" testId="duration" />,
    play: openTo('Under 1 hr'),
}

/**
 * The field does not rewrite what was typed, and it does not pretend to
 * understand it either: `12.5` stays `12.5`, no summary is drawn, and the
 * message below is the consumer's, exactly as the service form writes it.
 */
export const InvalidValueIsLeftAlone: Story = {
    name: 'An invalid value, left as typed',
    render: () => (
        <div className="flex max-w-sm flex-col gap-1.5">
            <Label htmlFor="story-invalid-duration">Duration (min)</Label>
            <Controlled id="story-invalid-duration" value="12.5" invalid testId="duration" />
            <p className="text-[0.8125rem] text-[var(--color-autara-error)]">
                Duration must be a whole number of minutes.
            </p>
        </div>
    ),
}

/**
 * Over the cap, and read back truthfully as 72 hr. Seeing the reading is how
 * a merchant spots a stray digit; hiding it would only delay the discovery
 * until the save fails.
 */
export const OverTheCap: Story = {
    render: () => <Controlled value="4320" invalid testId="duration" />,
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
    name: 'Dark theme, picker open',
    globals: { theme: 'dark' },
    render: () => <Controlled value="1440" testId="duration" />,
    play: openTo('24 hr'),
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
                    <Label htmlFor="service-duration">Duration (min)</Label>
                    <DurationPicker
                        id="service-duration"
                        testId="service-duration"
                        value={durationText}
                        onChange={setDurationText}
                        onBlur={() => setTouched(true)}
                        placeholder="60"
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
