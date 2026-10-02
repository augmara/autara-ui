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

/**
 * Solar Bold style, drawn inline (autara-ui carries no icon dependency).
 * Sized in `em` so the glyph grows with the text beside it at 200%.
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
    /** Minutes, as text. `''` when empty. Anything the field cannot read is passed through as typed. */
    value: string
    /**
     * Called with whole minutes as text whenever the field reads as a
     * duration (typed `1 hr 30 min` sends `'90'`), and with the raw text
     * otherwise (`'12.5'` sends `'12.5'`), so the consumer's validator stays
     * the one authority on what saves.
     */
    onChange: (value: string) => void
    /**
     * The longest duration the sheet offers.
     * @default 1440 (24 hours)
     */
    maxMinutes?: number
    /** The minute column's step. @default 15 */
    minuteStep?: number
    /** The one-tap lengths above the columns, in minutes. Lengths over the cap are dropped. */
    presets?: readonly number[]
    /** @default 'e.g. 1 hr 30 min' */
    placeholder?: string
    disabled?: boolean
    /** Paints the error edge and sets `aria-invalid`. Always the consumer's call. */
    invalid?: boolean
    /** Names the field when no `<label htmlFor>` points at `id`. @default 'Duration' */
    label?: string
    /** Goes on the TEXT INPUT, so a caller's `<label htmlFor>` associates natively. */
    id?: string
    /** Lands on the input; the clock takes `{testId}-open`, the sheet `{testId}-sheet`. */
    testId?: string
    className?: string
}

/**
 * DurationPicker — how long a job takes.
 *
 * ── The field ─────────────────────────────────────────────────────────────
 *
 * A text field that READS in hours and minutes. A value that arrives from
 * outside (a stored service, the sheet) is shown in words, "2 hr 30 min",
 * never as 150. A merchant can also type, in minutes or in words: `90`,
 * `1h 30`, `1.5 hours` all mean the same thing, and the consumer receives 90.
 *
 * What a merchant typed is never rewritten. Two reasons, and the second is
 * load-bearing:
 *
 *  1. A field that changes under your fingers on blur reads as the app
 *     disagreeing with you.
 *  2. QA's suite drives this field with `.fill()` on `#service-duration`
 *     (`autara-web-automation`, `ServiceFormPage.ts`), including arbitrary
 *     invalid strings, then asserts the consumer's three validation messages
 *     and, for a valid value, that the field still holds exactly what was
 *     typed (`toHaveValue`). A control that normalised `720` to `12 hr` on
 *     blur would fail those assertions without the product being wrong.
 *
 * So typed text stays as typed, and its reading appears on the clock beside
 * it ("12 hr") whenever the text is not already the reading. `type="text"`:
 * `type="number"` draws a native spinner and refuses words.
 *
 * ── The sheet ─────────────────────────────────────────────────────────────
 *
 * Hours and minutes are chosen together, both visible: two labelled columns
 * side by side (a radio group each, one tab stop, arrow keys), with the
 * result in words at the top, announced politely. Above them, the common
 * lengths are one tap each and commit straight away. Done commits a column
 * choice; Cancel, the scrim and Escape keep the value as it was.
 *
 * Rejected on purpose (AUTM-1507, Don 2026-10-02): the first version drilled
 * from an hour into its minutes, which hid the minutes behind a chevron and
 * read as "hours only". And wheels (timespent, Wanderlog on Mobbin): a wheel
 * is a drag gesture with no keyboard model and no 200% text story, where a
 * column of 44px rows is a tap, an arrow key and a heading.
 *
 * A stored value that is not on the steps (50 min, or 4320 from before the
 * cap) opens with nothing selected and says so; it is kept unless the
 * merchant picks a new one.
 *
 * Validity stays the consumer's: the sheet only offers lengths that can be
 * saved, the field takes anything.
 */
export function DurationPicker({
    value,
    onChange,
    maxMinutes = DEFAULT_MAX_DURATION_MINUTES,
    minuteStep = DEFAULT_MINUTE_STEP,
    presets = DEFAULT_PRESETS,
    placeholder = 'e.g. 1 hr 30 min',
    disabled = false,
    invalid = false,
    label = 'Duration',
    id,
    testId,
    className,
    onFocus,
    onBlur,
    'aria-describedby': describedBy,
    ...rest
}: DurationPickerProps) {
    const [open, setOpen] = React.useState(false)
    const inputRef = React.useRef<HTMLInputElement>(null)
    const labelledBy = useLabelFor(id, () => inputRef.current)
    const readingId = `${React.useId()}-reading`

    /*
     * What the merchant typed, kept as typed. It stays until the value is
     * changed from OUTSIDE (a stored service hydrating, the sheet, a reset),
     * which is detected as a value that is not the one this field last sent.
     */
    const [typed, setTyped] = React.useState<string | null>(null)
    const lastSent = React.useRef<string | null>(null)
    if (typed !== null && value !== lastSent.current) {
        // Render-phase reset is React's sanctioned way to derive state from a
        // prop change without an effect and a flash of the stale text.
        setTyped(null)
    }

    const minutes = parseDuration(value)
    const reading = minutes === null ? null : durationLabel(minutes)
    const shown = typed ?? (reading ?? value)
    // The clock spells the reading only when the field does not already.
    const clockReading = reading !== null && shown.trim() !== reading ? reading : null
    // ...and then the input is described by it too, spoken in full words, so
    // a screen reader on the field hears "12 hours" after "720".
    const describedByAll =
        [describedBy, clockReading !== null ? readingId : null].filter(Boolean).join(' ') || undefined

    function send(next: string) {
        lastSent.current = next
        onChange(next)
    }

    return (
        <>
            <div
                data-testid={testId ? `${testId}-field` : undefined}
                className={cn(
                    // `min-h`, not `h`, and `flex-wrap`, so at large text the
                    // clock wraps under the input instead of crushing it.
                    // AUTM-1594: the sheet's field, 52px, the field edge on
                    // paper; focus a 2px accent ring with no tint.
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
                    type="text"
                    autoComplete="off"
                    spellCheck={false}
                    value={shown}
                    onChange={(event) => {
                        const text = event.target.value
                        setTyped(text)
                        const parsed = parseDuration(text)
                        send(parsed === null ? text : String(parsed))
                    }}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    placeholder={placeholder}
                    disabled={disabled}
                    aria-invalid={invalid || undefined}
                    aria-describedby={describedByAll}
                    aria-labelledby={labelledBy}
                    aria-label={labelledBy ? undefined : label}
                    data-testid={testId}
                    className={cn(
                        // `basis-28` gives the input a floor so the clock
                        // wraps away rather than squeezing it to nothing.
                        'min-h-[3.125rem] min-w-0 flex-1 basis-28 bg-transparent px-4',
                        'text-[1.0625rem] text-[var(--text-strong)] tabular-nums outline-none',
                        'placeholder:text-[var(--text-subtle)]',
                        'disabled:cursor-not-allowed disabled:text-[var(--text-subtle)]',
                    )}
                />
                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    disabled={disabled}
                    aria-haspopup="dialog"
                    aria-expanded={open}
                    data-testid={testId ? `${testId}-open` : undefined}
                    className={cn(
                        // `min-w-11` too: with no reading the trigger is the
                        // glyph and its padding, 42px wide before this.
                        'flex min-h-11 min-w-11 shrink-0 items-center justify-center gap-1.5 rounded-autara-md px-3',
                        'text-base font-medium text-[var(--text-muted)] transition-colors',
                        'duration-[var(--motion-panel-in)] ease-[var(--motion-ease-out)]',
                        'hover:bg-[var(--band)] hover:text-[var(--text-strong)]',
                        // Drawn inside the button: it sits flush on the
                        // field's edge, so an outward ring would straddle it.
                        // `--accent`, not the fill-grade purple (AUTM-974).
                        'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--accent)]',
                        'disabled:cursor-not-allowed disabled:hover:bg-transparent',
                    )}
                >
                    <DurationGlyph />
                    <span className="sr-only">Choose duration</span>
                    {clockReading ? <span className="whitespace-nowrap">{clockReading}</span> : null}
                </button>
                {clockReading !== null && minutes !== null ? (
                    <span id={readingId} hidden>
                        {durationSpoken(minutes)}
                    </span>
                ) : null}
            </div>
            <DurationSheet
                open={open}
                onOpenChange={setOpen}
                current={minutes}
                maxMinutes={maxMinutes}
                minuteStep={minuteStep}
                presets={presets}
                testId={testId}
                onCommit={(next) => {
                    send(String(next))
                    setTyped(null)
                    setOpen(false)
                    // Back to the field, so a keyboard merchant is not left
                    // at the top of the document when the sheet unmounts.
                    requestAnimationFrame(() => inputRef.current?.focus())
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
    const [wasOpen, setWasOpen] = React.useState(false)
    if (open !== wasOpen) {
        setWasOpen(open)
        if (open) {
            setHours(fits ? Math.floor(current / 60) : null)
            setMins(fits ? current % 60 : null)
        }
    }

    const chosen = hours !== null || mins !== null
    const draft = chosen ? (hours ?? 0) * 60 + (mins ?? 0) : null
    const shownTotal = draft ?? current
    const tooShort = draft !== null && draft <= 0
    const canDone = draft !== null && draft > 0 && draft <= maxMinutes

    const ids = React.useId()
    const hoursLabelId = `${ids}-hours`
    const minutesLabelId = `${ids}-minutes`

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

    const offeredPresets = presets.filter((p) => p > 0 && p <= maxMinutes)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent layout="responsive" data-testid={testId ? `${testId}-sheet` : undefined}>
                <DialogHeader>
                    <DialogTitle>Duration</DialogTitle>
                    <DialogDescription>
                        Pick the hours and the minutes, or tap a common length.
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
                        ) : current !== null && current > 0 && !fits && !chosen ? (
                            <p className="mt-1 text-[0.9375rem] leading-normal text-[var(--text-muted)]">
                                Not on the {minuteStep}-minute steps below. It stays as it is unless
                                you pick a new length.
                            </p>
                        ) : null}
                    </div>

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
                </DialogBody>
                <DialogFooter>
                    <Button variant="quiet" size="md" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        variant="strong"
                        size="md"
                        disabled={!canDone}
                        onClick={() => draft !== null && onCommit(draft)}
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
