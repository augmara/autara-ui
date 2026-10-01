'use client'

import * as React from 'react'

import { cn } from '../lib/cn'
import { useLabelFor } from '../lib/use-label-for'
import { PickerSheet, type PickerOption } from './PickerSheet'

/**
 * The platform ceiling, mirroring `MAX_DURATION_MINUTES` in
 * merchant-mobile's `src/lib/form-rules.ts`. 1440 minutes is 24 hours, and
 * `serviceDurationError` there refuses anything above it with "Duration
 * can't be more than 1440 minutes (24 hours)."
 *
 * That ceiling is why this control has no days unit and no hour above 24:
 * a longer duration is not something a merchant can currently save, so
 * offering it would be offering a value the form then rejects.
 */
export const DEFAULT_MAX_DURATION_MINUTES = 1440

/** The minutes offered under each hour. */
const MINUTE_STEPS = [0, 15, 30, 45] as const

/**
 * Minutes as a merchant says them: 45 is "45 min", 90 is "1 hr 30 min",
 * 120 is "2 hr". The zero part is dropped, because "2 hr 0 min" is the
 * reading of a machine and not of a person.
 */
export function durationLabel(minutes: number): string {
    const hours = Math.floor(minutes / 60)
    const rest = minutes % 60
    if (hours === 0) return `${rest} min`
    if (rest === 0) return `${hours} hr`
    return `${hours} hr ${rest} min`
}

/**
 * The typed text read back as a whole number of minutes, or null when it is
 * not one.
 *
 * Strict and deliberately NON-destructive: it reports what the text is and
 * never changes it. `12.5`, `-30`, `2 hours` and `` all come back null, which
 * draws no summary and leaves the text exactly as typed for the consumer's
 * own validator to refuse in its own words.
 *
 * A value ABOVE the cap still parses, on purpose. Reading 4320 back as
 * "72 hr" is how a merchant sees what they actually typed; suppressing it
 * would hide the mistake at the moment it is cheapest to spot.
 */
function parseMinutes(text: string): number | null {
    const trimmed = text.trim()
    if (!/^\d+$/.test(trimmed)) return null
    const minutes = Number(trimmed)
    return Number.isSafeInteger(minutes) ? minutes : null
}

/**
 * A row in the sheet. Hours sit at the root and drill into their minutes;
 * `total` rows are the leaves and carry the value the field receives.
 */
type DurationNode =
    | { kind: 'hour'; hours: number; current: boolean }
    | { kind: 'total'; total: number; unavailable?: string }

/**
 * Hours at the root, minutes one level in, with every leaf labelled by the
 * duration it produces rather than by its minutes alone. So the row under
 * "1 hr" reads "1 hr 30 min", and what you tap is what the field gets.
 *
 * A leaf is out when it cannot be saved: past the cap (24 hr 15 min), or
 * zero (`serviceDurationError` refuses 0 with "Duration must be a positive
 * whole number."). The picker only ever offers savable values; the text
 * field, by contrast, takes anything, which is the division of labour this
 * component is built around.
 */
function buildOptions(
    maxMinutes: number,
    currentHours: number | null,
): PickerOption<DurationNode>[] {
    const maxHours = Math.floor(maxMinutes / 60)
    return Array.from({ length: maxHours + 1 }, (_, hours) => ({
        value: `h-${hours}`,
        data: { kind: 'hour', hours, current: hours === currentHours } as DurationNode,
        children: MINUTE_STEPS.map((minutes) => {
            const total = hours * 60 + minutes
            const unavailable =
                total === 0
                    ? 'too short'
                    : total > maxMinutes
                      ? `over ${durationLabel(maxMinutes)}`
                      : undefined
            return {
                // The leaf value IS the minute total as text, which is the
                // wire format, so selection needs no translation step that
                // could disagree with the summary.
                value: String(total),
                data: { kind: 'total', total, unavailable } as DurationNode,
                disabled: unavailable !== undefined,
            }
        }),
    }))
}

/**
 * Solar Bold style, drawn inline (autara-ui carries no icon dependency).
 *
 * Sized in `em` rather than px so the glyph grows with the label beside it
 * when the OS text size does. An 18px glyph would still be 18px at 200%,
 * next to text at twice the size.
 */
function DurationGlyph() {
    return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-[1.125em] shrink-0">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.4" />
            <path
                d="M12 7.6V12l3 2"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    )
}

export interface DurationPickerProps
    extends Omit<
        React.ComponentPropsWithoutRef<'input'>,
        'value' | 'onChange' | 'type' | 'inputMode' | 'id' | 'disabled' | 'className' | 'aria-invalid'
    > {
    /** Minutes, as the text the field holds. `''` when empty. */
    value: string
    onChange: (value: string) => void
    /**
     * The ceiling the picker offers up to.
     * @default 1440 (24 hours)
     */
    maxMinutes?: number
    /** @default 'Minutes' */
    placeholder?: string
    disabled?: boolean
    /**
     * Paints the error edge and sets `aria-invalid`. The consumer's call,
     * always: this component forms no opinion on whether the text is valid.
     */
    invalid?: boolean
    /** Names the field when no `<label htmlFor>` points at `id`. @default 'Duration' */
    label?: string
    /**
     * Goes on the TEXT INPUT, which is a labelable element, so a caller's
     * `<label htmlFor>` associates and focuses natively. `useLabelFor` is
     * still used, for the one thing the platform does not give: knowing
     * whether a label exists, so `label` is only applied as an `aria-label`
     * when no visible one would be overridden by it (AUTM-1267).
     */
    id?: string
    /** Lands on the input; the picker trigger takes `{testId}-open`. */
    testId?: string
    className?: string
}

/**
 * DurationPicker — how long a job takes, typed in minutes or picked in hours.
 *
 * ── Why not `<input type="number">` ─────────────────────────────────────
 *
 * The service form used one, and it cost two things (AUTM-1507, split from
 * AUTM-803). The browser's own spinner is unstyleable past a point and reads
 * as a foreign control on the dark theme, which is the half of the bug Don
 * screenshotted. And a field that only speaks minutes makes the merchant do
 * the conversion: nobody thinks "ninety minutes" about an hour and a half,
 * or "480" about a full day, so every duration passes through arithmetic in
 * the merchant's head before it can be typed.
 *
 * `type="text"` with `inputMode="numeric"` is what removes the spinner. There
 * is no spinner to suppress rather than a suppressed one, which is why it
 * holds in Firefox and Safari too, where the `-webkit-*-spin-button` rules
 * that usually get reached for do nothing.
 *
 * ── Why the field is still typable ─────────────────────────────────────
 *
 * The picker is an assist ON TOP of the field, never a replacement for it.
 * Two reasons, and the second is load-bearing:
 *
 *  1. Typing 75 is faster than two taps for anyone who already thinks in
 *     minutes, and off-step values (20, 75) have to stay reachable.
 *  2. QA's suite drives this field by `.fill()` on `#service-duration`
 *     (`autara-web-automation`, `ServiceFormPage.ts`), including with
 *     arbitrary invalid strings, to assert the three validation messages
 *     `serviceDurationError` produces. A control that could only emit valid
 *     values would make those assertions unreachable by construction and
 *     take service creation down across the whole suite.
 *
 * So the control is UNCONTROLLED ABOUT VALIDITY. It never clamps, rejects or
 * rewrites what was typed, and `invalid` stays the consumer's call. The same
 * argument TimePicker makes about its off-grid value: a field that quietly
 * corrects its input reads as data loss.
 */
export function DurationPicker({
    value,
    onChange,
    maxMinutes = DEFAULT_MAX_DURATION_MINUTES,
    placeholder = 'Minutes',
    disabled = false,
    invalid = false,
    label = 'Duration',
    id,
    testId,
    className,
    ...rest
}: DurationPickerProps) {
    const [open, setOpen] = React.useState(false)
    const inputRef = React.useRef<HTMLInputElement>(null)

    const minutes = parseMinutes(value)
    const summary = minutes === null ? null : durationLabel(minutes)

    const options = React.useMemo(
        () => buildOptions(maxMinutes, minutes === null ? null : Math.floor(minutes / 60)),
        [maxMinutes, minutes],
    )

    // Canonical form, so `0090` marks the same row as `90`. A value the sheet
    // does not offer (95) marks nothing, which is honest: it stays in the
    // field and in the summary, it is simply not one of the rows.
    const selected = minutes === null ? undefined : String(minutes)

    const labelledBy = useLabelFor(id, () => inputRef.current)

    return (
        <>
            <div
                data-testid={testId ? `${testId}-field` : undefined}
                className={cn(
                    // `min-h`, not `h`: the field grows rather than cropping
                    // when the trigger wraps under the input at large text
                    // sizes. `flex-wrap` is what lets it wrap instead of
                    // squeezing the input toward zero width.
                    // AUTM-1594: the sheet's field — 52px, 14px, the field
                    // edge on paper; focus a 2px accent ring with no tint.
                    'flex min-h-13 w-full flex-wrap items-stretch',
                    'rounded-autara-md border bg-[var(--paper)] transition-colors',
                    invalid
                        ? 'border-[var(--danger)] focus-within:shadow-[inset_0_0_0_1px_var(--danger)]'
                        : [
                              'border-[var(--field-edge)]',
                              'focus-within:border-[var(--accent)] focus-within:shadow-[inset_0_0_0_1px_var(--accent)]',
                              !disabled && 'hover:border-[var(--text-muted)]',
                          ],
                    disabled && 'border-[var(--hairline)] opacity-60',
                    className,
                )}
            >
                <input
                    {...rest}
                    ref={inputRef}
                    id={id}
                    /**
                     * NOT `type="number"`. See the component note: this is
                     * the line that removes the spinner, and it is also what
                     * keeps `.fill()` able to put arbitrary text here for the
                     * consumer's validator to reject.
                     */
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    placeholder={placeholder}
                    disabled={disabled}
                    aria-invalid={invalid || undefined}
                    aria-labelledby={labelledBy}
                    aria-label={labelledBy ? undefined : label}
                    data-testid={testId}
                    className={cn(
                        // `basis-24` gives the input a 6rem floor so the
                        // trigger wraps away rather than crushing it.
                        // 50px inside the 1px edge: the field is 52 overall.
                        'min-h-[3.125rem] min-w-0 flex-1 basis-24 bg-transparent px-4',
                        'text-[1.0625rem] text-[var(--text-strong)] tabular-nums outline-none',
                        'placeholder:text-[var(--text-subtle)]',
                        'disabled:cursor-not-allowed disabled:text-[var(--text-subtle)]',
                    )}
                />

                {/*
                 * The summary and the affordance are ONE control, because
                 * they are one idea: here is what you have, tap to change it.
                 * It also means the trigger is never icon-only once a value
                 * exists, and its accessible name carries the visible text
                 * rather than replacing it (WCAG 2.5.3).
                 */}
                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    disabled={disabled}
                    data-testid={testId ? `${testId}-open` : undefined}
                    className={cn(
                        // `min-w-11` as well as `min-h-11`: with no summary
                        // yet, the trigger is the glyph plus its padding,
                        // which measured 42px wide in the browser. Two short
                        // of the floor is still under the floor, and it is
                        // the EMPTY field, which is where every merchant
                        // starts.
                        'flex min-h-11 min-w-11 shrink-0 items-center justify-center gap-1.5 rounded-autara-md px-3',
                        'text-base font-medium text-[var(--text-muted)] transition-colors',
                        'hover:bg-[var(--band)] hover:text-[var(--text-strong)]',
                        // The indicator is drawn INSIDE the button (negative
                        // offset), because the trigger sits flush against the
                        // field's own edge: an outward ring or a positive
                        // offset would straddle the border and, in any
                        // clipping ancestor, be cut off on three sides. The
                        // container's `focus-within` tint alone is not enough
                        // here, since it looks identical whichever of the two
                        // controls holds focus.
                        //
                        // `--accent`, not `--color-autara-purple`: that alias
                        // resolves through `--accent-fill`, which is fill
                        // grade and measures 2.72:1 on the dark surface
                        // (AUTM-967 / AUTM-974).
                        'focus-visible:outline-2 focus-visible:-outline-offset-2',
                        'focus-visible:outline-[var(--accent)]',
                        'disabled:cursor-not-allowed disabled:hover:bg-transparent',
                    )}
                >
                    <DurationGlyph />
                    <span className="sr-only">Choose duration</span>
                    {summary ? <span className="whitespace-nowrap">{summary}</span> : null}
                </button>
            </div>

            <PickerSheet<DurationNode>
                open={open}
                onOpenChange={setOpen}
                title="Duration"
                description="Pick the hours, then the minutes."
                options={options}
                selected={selected}
                onSelect={(next) => {
                    onChange(next)
                    // Back to the field, so a keyboard merchant is not left
                    // at the top of the document when the sheet unmounts.
                    inputRef.current?.focus()
                }}
                renderRow={(node) =>
                    node.kind === 'hour' ? (
                        <span className="flex items-center justify-between gap-3">
                            {/* "0 hr" is not how anyone says it. */}
                            <span>{node.hours === 0 ? 'Under 1 hr' : `${node.hours} hr`}</span>
                            {node.current ? (
                                <span className="text-sm text-[var(--text-muted)]">Current</span>
                            ) : null}
                        </span>
                    ) : (
                        <span className="flex items-center justify-between gap-3">
                            <span>{durationLabel(node.total)}</span>
                            {node.unavailable ? (
                                // Why, not just dimmed. Opacity alone is not
                                // a signal, and a row that is merely faint
                                // reads as a rendering fault.
                                <span className="text-sm text-[var(--text-muted)]">
                                    {node.unavailable}
                                </span>
                            ) : null}
                        </span>
                    )
                }
            />
        </>
    )
}
