'use client'

import * as React from 'react'

import { cn } from '../lib/cn'
import { useLabelFor } from '../lib/use-label-for'
import { Button } from './Button'
import {
    Dialog,
    DialogBody,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from './Dialog'

/**
 * The platform ceiling, mirroring `MAX_DURATION_MINUTES` in
 * merchant-mobile's `src/lib/form-rules.ts`. 1440 minutes is 24 hours, and
 * `serviceDurationError` there refuses anything above it with "Duration
 * can't be more than 1440 minutes (24 hours)."
 *
 * That ceiling is why the sheet offers no hour above 24 and no days: a
 * longer duration is not something a merchant can currently save, so
 * offering it would be offering a value the form then rejects. Multi-day
 * work is AUTM-1575 (working days, for workshop merchants), a cap change on
 * the server and the form, not a control change.
 */
export const DEFAULT_MAX_DURATION_MINUTES = 1440

/** The minute column's step. The approved Services board draws 15. */
const DEFAULT_MINUTE_STEP = 15

/**
 * The common lengths, one tap each. Taken from what detailers actually sell
 * (a wash, an interior, a polish, a half day) and from the presets Pangea and
 * Structured put above their pickers (Mobbin, AUTM-1507).
 */
const DEFAULT_PRESETS = [30, 45, 60, 90, 120, 180, 240] as const

const MINUTES_PER_DAY = 1440

/**
 * Minutes as a merchant says them: 45 is "45 min", 90 is "1 hr 30 min",
 * 120 is "2 hr". The zero part is dropped, because "2 hr 0 min" is the
 * reading of a machine and not of a person.
 *
 * Whole days past the first read as days: 4320 is "3 days", not "72 hr".
 * Nothing above 24 hours can be saved today, but values stored before the
 * cap existed can still arrive, and a merchant should recognise their own
 * three-day coating in what the form shows them. 1440 itself stays "24 hr",
 * because that is the top of the picker it was chosen from.
 */
export function durationLabel(minutes: number): string {
    if (minutes > MINUTES_PER_DAY && minutes % MINUTES_PER_DAY === 0) {
        const days = minutes / MINUTES_PER_DAY
        return `${days} day${days === 1 ? '' : 's'}`
    }
    const hours = Math.floor(minutes / 60)
    const rest = minutes % 60
    if (hours === 0) return `${rest} min`
    if (rest === 0) return `${hours} hr`
    return `${hours} hr ${rest} min`
}

/**
 * The same value as a screen reader should say it: "2 hours 30 minutes".
 * "hr" and "min" are read letter by letter, or as "her", by some engines.
 */
export function durationSpoken(minutes: number): string {
    const plural = (n: number, unit: string) => `${n} ${unit}${n === 1 ? '' : 's'}`
    if (minutes > MINUTES_PER_DAY && minutes % MINUTES_PER_DAY === 0) {
        return plural(minutes / MINUTES_PER_DAY, 'day')
    }
    const hours = Math.floor(minutes / 60)
    const rest = minutes % 60
    if (hours === 0) return plural(rest, 'minute')
    if (rest === 0) return plural(hours, 'hour')
    return `${plural(hours, 'hour')} ${plural(rest, 'minute')}`
}

const UNIT_MINUTES: Record<string, number> = {
    d: MINUTES_PER_DAY,
    day: MINUTES_PER_DAY,
    days: MINUTES_PER_DAY,
    h: 60,
    hr: 60,
    hrs: 60,
    hour: 60,
    hours: 60,
    m: 1,
    min: 1,
    mins: 1,
    minute: 1,
    minutes: 1,
}

/**
 * Text read as a whole number of minutes, or null when it is not one.
 *
 * Takes what a merchant would type: bare minutes (`90`), hours and minutes in
 * words or short units (`1 hr 30 min`, `1h30`, `1.5 hours`, `2 hrs`), a clock
 * reading (`1:30`), and days (`3 days`). A bare number after an hour amount is
 * minutes, as people say it (`1 hr 30`).
 *
 * Strict where it matters: a bare decimal (`12.5`), a negative, an exponent
 * or anything with a fraction of a minute is NOT a duration, so it comes back
 * null and the text reaches the consumer exactly as typed for its own
 * validator to refuse in its own words. A value above any cap still parses,
 * on purpose: reading 4320 back as "3 days" is how a merchant sees a stray
 * digit.
 */
export function parseDuration(text: string): number | null {
    const trimmed = text.trim().toLowerCase()
    if (trimmed.length === 0) return null
    if (/^\d+$/.test(trimmed)) {
        const minutes = Number(trimmed)
        return Number.isSafeInteger(minutes) ? minutes : null
    }
    const clock = /^(\d{1,2}):([0-5]\d)$/.exec(trimmed)
    if (clock) return Number(clock[1]) * 60 + Number(clock[2])

    const normalised = trimmed.replace(/,|\band\b/g, ' ').replace(/\s+/g, ' ').trim()
    const token = /(\d+(?:\.\d+)?)\s*([a-z]+)?\s*/y
    let total = 0
    let index = 0
    let sawHours = false
    const seen = new Set<number>()
    while (index < normalised.length) {
        token.lastIndex = index
        const match = token.exec(normalised)
        if (!match || match[0].length === 0) return null
        index = token.lastIndex
        const amount = Number(match[1])
        const unit = match[2]
        let per: number
        if (unit === undefined) {
            // A trailing bare number is minutes only after an hour amount
            // ("1 hr 30"); on its own a decimal was already refused above.
            if (!sawHours || index < normalised.length) return null
            per = 1
        } else {
            const resolved = UNIT_MINUTES[unit]
            if (resolved === undefined) return null
            per = resolved
        }
        if (seen.has(per)) return null
        seen.add(per)
        if (per === 60) sawHours = true
        total += amount * per
    }
    // "1.5 hours" is 90; "1.5 min" is not a whole minute and is refused.
    const rounded = Math.round(total)
    if (Math.abs(total - rounded) > 1e-9) return null
    return Number.isSafeInteger(rounded) ? rounded : null
}

/** A chevron, drawn inline (autara-ui carries no icon dependency), in `em`. */
function Chevron() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="size-[1.125em] shrink-0 text-[var(--text-muted)]"
        >
            <path d="m6 9 6 6 6-6" />
        </svg>
    )
}

export interface DurationPickerProps
    extends Omit<
        React.ComponentPropsWithoutRef<'button'>,
        'value' | 'onChange' | 'type' | 'id' | 'disabled' | 'className' | 'aria-invalid' | 'children'
    > {
    /** Minutes, as text. `''` when empty. A stored value it cannot read is shown as it is. */
    value: string
    /** Called with whole minutes as text when a length is chosen. */
    onChange: (value: string) => void
    /**
     * The longest duration the sheet allows, presets and typing included.
     * @default 1440 (24 hours)
     */
    maxMinutes?: number
    /** The minute column's step. Typing reaches the minutes in between. @default 15 */
    minuteStep?: number
    /** The one-tap lengths above the columns, in minutes. Lengths over the cap are dropped. */
    presets?: readonly number[]
    /** What the field says when there is no length yet. @default 'Choose a length' */
    placeholder?: string
    disabled?: boolean
    /** Paints the error edge and sets `aria-invalid`. Always the consumer's call. */
    invalid?: boolean
    /** Names the field when no `<label htmlFor>` points at `id`. @default 'Duration' */
    label?: string
    /** Goes on the field's BUTTON, so a caller's `<label htmlFor>` names it and a click on the label focuses it. */
    id?: string
    /** Submitted with a native form as minutes, through a hidden input. */
    name?: string
    /**
     * Lands on the field's button. The sheet's parts take `{testId}-sheet`,
     * `-reading`, `-hours`, `-minutes`, `-manual-open`, `-manual` (the text
     * field) and `-done`.
     */
    testId?: string
    className?: string
}

/**
 * DurationPicker — how long a job takes.
 *
 * ── The field is a button ─────────────────────────────────────────────────
 *
 * Don, 2026-10-02, on the version with a typable field and a clock beside
 * it: the same value read twice ("2hrs 23min" typed, "2 hr 23 min" echoed).
 * So the field is one button that says the length in words, "2 hr 30 min",
 * or "Choose a length", and opens the sheet on a tap, Enter or Space. There
 * is no typing in the field and nothing beside it.
 *
 * It is still a labelled form control: a caller's `<label htmlFor={id}>`
 * names it and focuses it, its accessible name carries the value
 * ("Duration, 2 hr 30 min"), `invalid` sets `aria-invalid`, and a caller's
 * `aria-describedby` (the form's error) lands on it. With `name`, a hidden
 * input submits the minutes with a native form.
 *
 * ── The sheet ─────────────────────────────────────────────────────────────
 *
 * Tap-ready: the result in words at the top (announced, spoken in full),
 * the common lengths one tap each (they commit), then hours and minutes side
 * by side, both visible, as two labelled radio groups with arrow keys.
 * Done commits a column choice; Cancel, the scrim and Escape keep the value.
 *
 * "Type a length" swaps the columns for one text field that reads minutes or
 * words (90, 1h 30, 1.5 hours, 1:30), shows its reading live, and commits
 * with Done. That is where the minutes between the steps come from (2 hr 23
 * min). A length that is not a whole number of minutes, zero, or past the
 * cap is refused there, in words, with Done held, so the sheet never hands
 * the form a value it cannot save.
 *
 * Rejected on purpose: drilling from an hour into its minutes (the first
 * version: the minutes were hidden and it read as "hours only"), and wheels
 * (timespent, Wanderlog on Mobbin: a drag with no keyboard model and no 200%
 * text story).
 *
 * A stored value that is not on the steps (50 min, or 4320 from before the
 * cap) reads correctly on the field ("50 min", "3 days"), opens with nothing
 * chosen and a line saying so, and is kept unless the merchant picks again.
 *
 * ── Room for working days (AUTM-1575) ─────────────────────────────────────
 *
 * Multi-day work is a later mode, not a redesign: the sheet's header is
 * where an "Hours | Working days" switch goes, `Column` is generic (a days
 * column is `options={[1..14]}`), and the value stays minutes, so the field
 * and the consumer do not change. The cap moves with it, as `maxMinutes`.
 */
export function DurationPicker({
    value,
    onChange,
    maxMinutes = DEFAULT_MAX_DURATION_MINUTES,
    minuteStep = DEFAULT_MINUTE_STEP,
    presets = DEFAULT_PRESETS,
    placeholder = 'Choose a length',
    disabled = false,
    invalid = false,
    label = 'Duration',
    id,
    name,
    testId,
    className,
    ...rest
}: DurationPickerProps) {
    const [open, setOpen] = React.useState(false)
    const buttonRef = React.useRef<HTMLButtonElement>(null)
    const labelledBy = useLabelFor(id, () => buttonRef.current)
    const ownId = React.useId()
    const buttonId = id ?? `${ownId}-duration`

    const minutes = parseDuration(value)
    const reading = minutes === null ? (value.trim() === '' ? null : value) : durationLabel(minutes)
    const spoken = minutes === null ? reading : durationSpoken(minutes)

    return (
        <>
            <button
                {...rest}
                ref={buttonRef}
                id={buttonId}
                type="button"
                onClick={() => setOpen(true)}
                disabled={disabled}
                aria-haspopup="dialog"
                aria-expanded={open}
                aria-invalid={invalid || undefined}
                // Named by the caller's label AND its own text, so the value a
                // merchant sees is in the name (WCAG 2.5.3): "Duration, 2 hr
                // 30 min". With no label, its own `label` does the same.
                aria-labelledby={labelledBy ? `${labelledBy} ${buttonId}` : undefined}
                aria-label={labelledBy ? undefined : `${label}, ${spoken ?? placeholder}`}
                data-testid={testId}
                data-value={minutes ?? undefined}
                className={cn(
                    // AUTM-1594: the sheet's field, 52px, the field edge on
                    // paper. `min-h` so it grows at 200% text.
                    'flex min-h-13 w-full items-center justify-between gap-2 rounded-autara-md border bg-[var(--paper)] px-4 py-2 text-left',
                    'text-[1.0625rem] tabular-nums transition-colors',
                    'duration-[var(--motion-panel-in)] ease-[var(--motion-ease-out)]',
                    'focus-visible:outline-none focus-visible:border-[var(--accent)] focus-visible:shadow-[inset_0_0_0_1px_var(--accent)]',
                    'aria-expanded:border-[var(--accent)] aria-expanded:shadow-[inset_0_0_0_1px_var(--accent)]',
                    invalid
                        ? 'border-[var(--danger)] shadow-[inset_0_0_0_1px_var(--danger)]'
                        : ['border-[var(--field-edge)]', !disabled && 'hover:border-[var(--text-muted)]'],
                    'disabled:cursor-not-allowed disabled:border-[var(--hairline)] disabled:opacity-60',
                    className,
                )}
            >
                <span className={cn('min-w-0 flex-1', reading ? 'text-[var(--text-strong)]' : 'text-[var(--text-subtle)]')}>
                    {reading ?? placeholder}
                </span>
                <Chevron />
            </button>
            {name ? <input type="hidden" name={name} value={minutes ?? ''} /> : null}
            <DurationSheet
                open={open}
                onOpenChange={setOpen}
                current={minutes}
                maxMinutes={maxMinutes}
                minuteStep={minuteStep}
                presets={presets}
                testId={testId}
                onCommit={(next) => {
                    onChange(String(next))
                    setOpen(false)
                }}
            />
        </>
    )
}

interface DurationSheetProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    current: number | null
    maxMinutes: number
    minuteStep: number
    presets: readonly number[]
    testId?: string
    onCommit: (minutes: number) => void
}

/** Is `minutes` a value the two columns can express exactly? */
function onTheSteps(minutes: number | null, maxMinutes: number, step: number): minutes is number {
    return minutes !== null && minutes > 0 && minutes <= maxMinutes && minutes % step === 0
}

/** Why typed text cannot be committed, in words, or null when it can. */
function typedProblem(text: string, parsed: number | null, maxMinutes: number): string | null {
    if (text.trim() === '') return 'Type a length, like 90 or 1 hr 30.'
    if (parsed === null) return 'Use whole minutes (90) or hours and minutes (1 hr 30).'
    if (parsed <= 0) return 'A length has to be at least 1 min.'
    if (parsed > maxMinutes) return `That is ${durationLabel(parsed)}. The most is ${durationLabel(maxMinutes)}.`
    return null
}

function DurationSheet({
    open,
    onOpenChange,
    current,
    maxMinutes,
    minuteStep,
    presets,
    testId,
    onCommit,
}: DurationSheetProps) {
    const maxHours = Math.floor(maxMinutes / 60)
    const hourOptions = React.useMemo(
        () => Array.from({ length: maxHours + 1 }, (_, hour) => hour),
        [maxHours],
    )
    const minuteOptions = React.useMemo(
        () => Array.from({ length: Math.ceil(60 / minuteStep) }, (_, i) => i * minuteStep),
        [minuteStep],
    )
    const fits = onTheSteps(current, maxMinutes, minuteStep)

    // The draft, reset every time the sheet opens. null = not chosen yet.
    const [hours, setHours] = React.useState<number | null>(null)
    const [mins, setMins] = React.useState<number | null>(null)
    const [typing, setTyping] = React.useState(false)
    const [typed, setTyped] = React.useState('')
    const [wasOpen, setWasOpen] = React.useState(false)
    if (open !== wasOpen) {
        setWasOpen(open)
        if (open) {
            setHours(fits ? Math.floor(current / 60) : null)
            setMins(fits ? current % 60 : null)
            setTyping(false)
            setTyped(current !== null && current > 0 ? durationLabel(current) : '')
        }
    }

    const typedMinutes = parseDuration(typed)
    const problem = typing ? typedProblem(typed, typedMinutes, maxMinutes) : null

    const chosen = hours !== null || mins !== null
    const draft = typing ? typedMinutes : chosen ? (hours ?? 0) * 60 + (mins ?? 0) : null
    const shownTotal = draft ?? current
    const tooShort = !typing && draft !== null && draft <= 0
    const canDone = typing ? problem === null : draft !== null && draft > 0 && draft <= maxMinutes

    const ids = React.useId()
    const hoursLabelId = `${ids}-hours`
    const minutesLabelId = `${ids}-minutes`
    const typedId = `${ids}-typed`
    const typedHintId = `${ids}-typed-hint`
    const typedRef = React.useRef<HTMLInputElement>(null)

    function pickHour(hour: number) {
        setHours(hour)
        // The top hour has no minutes past it: 24 hr 15 min is over the cap.
        if (hour * 60 + (mins ?? 0) > maxMinutes) setMins(0)
        else if (mins === null) setMins(0)
    }
    function pickMinute(minute: number) {
        setMins(minute)
        if (hours === null) setHours(0)
    }
    function commit() {
        if (canDone && draft !== null) onCommit(draft)
    }

    const offeredPresets = presets.filter((p) => p > 0 && p <= maxMinutes)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                layout="responsive"
                data-testid={testId ? `${testId}-sheet` : undefined}
                // Focus the sheet itself, not its first control. Radix's
                // default lands on the first preset, and Safari draws that as
                // focus-visible on a tap, so "30 min" opened looking chosen
                // (seen on the iPad simulator). Tab still starts at the
                // presets, and Escape still closes.
                onOpenAutoFocus={(event) => {
                    event.preventDefault()
                    ;(event.currentTarget as HTMLElement | null)?.focus()
                }}
                // The sheet is a container, not a control: no focus ring on
                // it. Inline, because a consumer's unlayered
                // `*:focus-visible` outline (merchant-mobile has one) beats
                // any utility class, and the ring around the whole sheet read
                // as a selection.
                style={{ outline: 'none' }}
            >
                <DialogHeader>
                    <DialogTitle>Duration</DialogTitle>
                    <DialogDescription>
                        {typing
                            ? 'Type minutes, or hours and minutes.'
                            : 'Pick the hours and the minutes, or tap a common length.'}
                    </DialogDescription>
                </DialogHeader>
                <DialogBody className="space-y-5">
                    {/* The result in words, announced as it changes. The
                        spoken form says "hours", which "hr" is not. */}
                    <div className="rounded-2xl bg-[var(--band)] px-4 py-3.5">
                        <p
                            aria-live="polite"
                            data-testid={testId ? `${testId}-reading` : undefined}
                            className="text-[2rem] leading-tight font-black tabular-nums text-[var(--text-strong)]"
                        >
                            {shownTotal !== null && shownTotal > 0 ? (
                                <>
                                    <span aria-hidden="true">{durationLabel(shownTotal)}</span>
                                    <span className="sr-only">{durationSpoken(shownTotal)}</span>
                                </>
                            ) : (
                                <span className="text-[var(--text-muted)]">No length yet</span>
                            )}
                        </p>
                        {tooShort ? (
                            <p className="mt-1 text-[0.9375rem] text-[var(--danger)]">
                                Pick at least {durationLabel(minuteStep)}.
                            </p>
                        ) : !typing && current !== null && current > 0 && !fits && !chosen ? (
                            <p className="mt-1 text-[0.9375rem] leading-normal text-[var(--text-muted)]">
                                Not on the {minuteStep}-minute steps below. It stays as it is unless
                                you pick a new length.
                            </p>
                        ) : null}
                    </div>

                    {typing ? (
                        <div>
                            <label
                                htmlFor={typedId}
                                className="text-[0.9375rem] font-bold text-[var(--text-strong)]"
                            >
                                Type a length
                            </label>
                            <input
                                ref={typedRef}
                                id={typedId}
                                type="text"
                                autoComplete="off"
                                spellCheck={false}
                                value={typed}
                                onChange={(event) => setTyped(event.target.value)}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter') {
                                        event.preventDefault()
                                        commit()
                                    }
                                }}
                                placeholder="e.g. 2 hr 23 min, or 143"
                                aria-invalid={problem !== null && typed.trim() !== '' ? true : undefined}
                                aria-describedby={typedHintId}
                                data-testid={testId ? `${testId}-manual` : undefined}
                                className={cn(
                                    'mt-2 min-h-13 w-full rounded-autara-md border bg-[var(--paper)] px-4',
                                    'text-[1.0625rem] text-[var(--text-strong)] tabular-nums outline-none',
                                    'placeholder:text-[var(--text-subtle)]',
                                    problem !== null && typed.trim() !== ''
                                        ? 'border-[var(--danger)] shadow-[inset_0_0_0_1px_var(--danger)]'
                                        : 'border-[var(--field-edge)] focus:border-[var(--accent)] focus:shadow-[inset_0_0_0_1px_var(--accent)]',
                                )}
                            />
                            <p
                                id={typedHintId}
                                aria-live="polite"
                                className={cn(
                                    'mt-1.5 text-[0.9375rem] leading-normal',
                                    problem !== null && typed.trim() !== ''
                                        ? 'text-[var(--danger)]'
                                        : 'text-[var(--text-muted)]',
                                )}
                            >
                                {problem ?? `Up to ${durationLabel(maxMinutes)}.`}
                            </p>
                            <Button
                                variant="link"
                                size="sm"
                                className="mt-1 px-0"
                                onClick={() => setTyping(false)}
                            >
                                Pick from the list instead
                            </Button>
                        </div>
                    ) : (
                        <>
                            {offeredPresets.length > 0 ? (
                                <div role="group" aria-label="Common lengths" className="flex flex-wrap gap-2">
                                    {offeredPresets.map((preset) => {
                                        const pressed = shownTotal === preset
                                        return (
                                            <button
                                                key={preset}
                                                type="button"
                                                aria-pressed={pressed}
                                                onClick={() => onCommit(preset)}
                                                className={cn(
                                                    // A one-tap action, so the shared control
                                                    // radius (Button sm), not a status pill's.
                                                    'min-h-11 rounded-[1.375rem] px-4 text-[0.9375rem] font-medium',
                                                    'transition-[background-color,color,transform] duration-[var(--motion-panel-in)] ease-[var(--motion-ease-out)]',
                                                    'active:scale-[0.97] motion-reduce:active:scale-100',
                                                    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]',
                                                    pressed
                                                        ? 'bg-[var(--selected)] text-[var(--on-selected)]'
                                                        : 'bg-[var(--band)] text-[var(--text-strong)] hover:bg-[var(--band-press)]',
                                                )}
                                            >
                                                {durationLabel(preset)}
                                            </button>
                                        )
                                    })}
                                </div>
                            ) : null}

                            <div className="grid grid-cols-2 gap-3">
                                <Column
                                    labelId={hoursLabelId}
                                    heading="Hours"
                                    options={hourOptions}
                                    selected={hours}
                                    visible={(hour) => `${hour} hr`}
                                    spoken={(hour) => `${hour} ${hour === 1 ? 'hour' : 'hours'}`}
                                    disabledFor={() => false}
                                    onPick={pickHour}
                                    testId={testId ? `${testId}-hours` : undefined}
                                />
                                <Column
                                    labelId={minutesLabelId}
                                    heading="Minutes"
                                    options={minuteOptions}
                                    selected={mins}
                                    visible={(minute) => `${minute} min`}
                                    spoken={(minute) => `${minute} ${minute === 1 ? 'minute' : 'minutes'}`}
                                    disabledFor={(minute) => (hours ?? 0) * 60 + minute > maxMinutes}
                                    onPick={pickMinute}
                                    testId={testId ? `${testId}-minutes` : undefined}
                                />
                            </div>

                            <Button
                                variant="quiet"
                                size="sm"
                                data-testid={testId ? `${testId}-manual-open` : undefined}
                                onClick={() => {
                                    setTyping(true)
                                    requestAnimationFrame(() => typedRef.current?.focus())
                                }}
                            >
                                Type a length
                            </Button>
                        </>
                    )}
                </DialogBody>
                <DialogFooter>
                    <Button variant="quiet" size="md" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        variant="strong"
                        size="md"
                        disabled={!canDone}
                        onClick={commit}
                        data-testid={testId ? `${testId}-done` : undefined}
                    >
                        Done
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

interface ColumnProps {
    labelId: string
    heading: string
    options: number[]
    selected: number | null
    visible: (n: number) => string
    spoken: (n: number) => string
    disabledFor: (n: number) => boolean
    onPick: (n: number) => void
    testId?: string
}

/**
 * One column of the sheet: a radio group with a single tab stop. Up and Down
 * move AND select (the ARIA radio pattern), Home and End jump, and the chosen
 * row scrolls into view when the sheet opens, so "2 hr" is on screen for a
 * service that takes two hours.
 */
function Column({
    labelId,
    heading,
    options,
    selected,
    visible,
    spoken,
    disabledFor,
    onPick,
    testId,
}: ColumnProps) {
    const listRef = React.useRef<HTMLDivElement>(null)
    const enabled = options.filter((n) => !disabledFor(n))
    const tabStop = selected !== null && enabled.includes(selected) ? selected : enabled[0]

    React.useEffect(() => {
        const list = listRef.current
        if (!list || selected === null) return
        const row = list.querySelector<HTMLElement>(`[data-value="${selected}"]`)
        // Feature-detected: jsdom and older WebViews have none, and an effect
        // that throws takes the render down with it.
        if (row && typeof row.scrollIntoView === 'function') row.scrollIntoView({ block: 'nearest' })
        // On open only: following the selection as it changes would scroll
        // the column away from the finger that just tapped it.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    function move(from: number, delta: number | 'first' | 'last') {
        if (enabled.length === 0) return
        const at = enabled.indexOf(from)
        const next =
            delta === 'first'
                ? enabled[0]
                : delta === 'last'
                  ? enabled[enabled.length - 1]
                  : enabled[Math.min(enabled.length - 1, Math.max(0, (at === -1 ? 0 : at) + delta))]
        onPick(next)
        listRef.current?.querySelector<HTMLElement>(`[data-value="${next}"]`)?.focus()
    }

    return (
        <div className="min-w-0">
            <p id={labelId} className="mb-2 text-[0.9375rem] font-bold text-[var(--text-strong)]">
                {heading}
            </p>
            <div
                ref={listRef}
                role="radiogroup"
                aria-labelledby={labelId}
                data-testid={testId}
                className="max-h-[17rem] space-y-1 overflow-y-auto overscroll-contain rounded-2xl bg-[var(--band)] p-1.5"
                onKeyDown={(event) => {
                    const from = selected ?? tabStop
                    if (from === undefined) return
                    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') move(from, 1)
                    else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') move(from, -1)
                    else if (event.key === 'Home') move(from, 'first')
                    else if (event.key === 'End') move(from, 'last')
                    else return
                    event.preventDefault()
                }}
            >
                {options.map((n) => {
                    const checked = selected === n
                    const off = disabledFor(n)
                    return (
                        <button
                            key={n}
                            type="button"
                            role="radio"
                            aria-checked={checked}
                            aria-label={spoken(n)}
                            disabled={off}
                            tabIndex={n === tabStop ? 0 : -1}
                            data-value={n}
                            onClick={() => onPick(n)}
                            className={cn(
                                'flex min-h-11 w-full items-center justify-between gap-2 rounded-xl px-3 text-left',
                                'text-[1.0625rem] tabular-nums',
                                'transition-[background-color,color,transform] duration-[var(--motion-panel-in)] ease-[var(--motion-ease-out)]',
                                'active:scale-[0.985] motion-reduce:active:scale-100',
                                'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--accent)]',
                                'disabled:cursor-not-allowed disabled:opacity-45',
                                checked
                                    ? 'bg-[var(--selected)] font-bold text-[var(--on-selected)]'
                                    : 'text-[var(--text-strong)] not-disabled:hover:bg-[var(--band-press)]',
                            )}
                        >
                            <span aria-hidden="true">{visible(n)}</span>
                            {checked ? (
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    aria-hidden="true"
                                    className="size-[1.1em] shrink-0"
                                >
                                    <path
                                        d="m5 12.5 4.5 4.5L19 7.5"
                                        stroke="currentColor"
                                        strokeWidth="2.4"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            ) : null}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
