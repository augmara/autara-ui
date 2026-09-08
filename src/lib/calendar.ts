/**
 * AUTM-1166 — calendar arithmetic for DatePicker and TimePicker.
 *
 * Everything here works on `YYYY-MM-DD` and `HH:mm` STRINGS and never hands a
 * `Date` across the boundary. That is deliberate and it is the whole safety
 * property of these components.
 *
 * A merchant's day belongs to their shop's timezone, not the tablet's
 * (AUT-575: `merchant_profiles.timezone` is the source of truth, and hardcoding
 * a default is a P0 correctness bug once a non-Sydney merchant onboards). A
 * component that calls `new Date()` to decide what "today" is has silently
 * chosen the DEVICE's zone, and it will be wrong for a Perth merchant on a
 * tablet left on Sydney time, in the direction that hides a bookable slot.
 *
 * So the caller passes `today` in, already resolved in the merchant's zone,
 * and nothing below reads the clock. The `Date` objects that do appear are
 * constructed and read entirely in UTC, where they are just a calendar
 * calculator and carry no zone meaning.
 */

/** Days of the week as the strip and the month grid order them, Monday first. */
export const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/
const ISO_TIME = /^\d{2}:\d{2}$/

export function isISODate(value: string | null | undefined): boolean {
    return typeof value === 'string' && ISO_DATE.test(value)
}

export function isISOTime(value: string | null | undefined): boolean {
    return typeof value === 'string' && ISO_TIME.test(value)
}

/** `YYYY-MM-DD` -> a UTC Date used only as a calendar calculator. */
function toUTC(date: string): Date {
    const [y, m, d] = date.split('-').map(Number)
    return new Date(Date.UTC(y, m - 1, d))
}

function fromUTC(date: Date): string {
    return date.toISOString().slice(0, 10)
}

/** Shift a `YYYY-MM-DD` by whole days. Month and year roll over correctly. */
export function addDays(date: string, days: number): string {
    const d = toUTC(date)
    d.setUTCDate(d.getUTCDate() + days)
    return fromUTC(d)
}

/** Whole days from `a` to `b`. Negative when `b` is earlier. */
export function daysBetween(a: string, b: string): number {
    return Math.round((toUTC(b).getTime() - toUTC(a).getTime()) / 86_400_000)
}

/** 0 = Monday ... 6 = Sunday. */
export function weekdayIndex(date: string): number {
    return (toUTC(date).getUTCDay() + 6) % 7
}

export function dayOfMonth(date: string): number {
    return toUTC(date).getUTCDate()
}

/**
 * Weekday and month names come from `Intl` pinned to `en-AU` and UTC rather
 * than the device locale. A merchant in a shop should read the same label on
 * every tablet in it, and an unpinned formatter would also reintroduce the
 * device-zone bug this module exists to avoid.
 */
const MONTH_YEAR = new Intl.DateTimeFormat('en-AU', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
})
const LONG_DATE = new Intl.DateTimeFormat('en-AU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
})

export function monthYearLabel(date: string): string {
    return MONTH_YEAR.format(toUTC(date))
}

/** "Tuesday 9 September" — the unambiguous spoken form, for screen readers. */
export function longDateLabel(date: string): string {
    return LONG_DATE.format(toUTC(date))
}

/**
 * The month `date` sits in, as whole Monday-first weeks.
 *
 * Leading and trailing cells belong to the neighbouring months and are
 * returned rather than blanked, so the grid is always 7 wide and the caller
 * can dim them. `inMonth` says which is which.
 */
export function monthGrid(date: string): { date: string; inMonth: boolean }[] {
    const first = `${date.slice(0, 7)}-01`
    const start = addDays(first, -weekdayIndex(first))
    const month = date.slice(0, 7)
    const cells: { date: string; inMonth: boolean }[] = []
    for (let i = 0; i < 42; i++) {
        const cell = addDays(start, i)
        cells.push({ date: cell, inMonth: cell.slice(0, 7) === month })
        // Stop at a whole week once the month is behind us, so a 28-day
        // February renders four rows rather than six empty-ish ones.
        if (i % 7 === 6 && cell.slice(0, 7) > month) break
    }
    return cells
}

/** `HH:mm` -> minutes since midnight. */
export function toMinutes(time: string): number {
    const [h, m] = time.split(':').map(Number)
    return h * 60 + m
}

/** Minutes since midnight -> `HH:mm`. Values past midnight are clamped. */
export function toTime(minutes: number): string {
    const clamped = Math.max(0, Math.min(24 * 60 - 1, Math.round(minutes)))
    const h = Math.floor(clamped / 60)
    const m = clamped % 60
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/**
 * Every slot from `start` to `end` inclusive at `interval` minutes.
 *
 * `include` forces a time into the result even when it is off the grid. That
 * matters for editing: a booking taken at 10:20 by a merchant who has since
 * moved to 30-minute slots must still show as selected rather than silently
 * reading as unset, which would look like the form had lost the value.
 */
export function timeSlots(
    start: string,
    end: string,
    interval: number,
    include?: string | null,
): string[] {
    const step = Math.max(1, Math.round(interval))
    const from = toMinutes(start)
    const to = toMinutes(end)
    const slots: string[] = []
    for (let m = from; m <= to; m += step) slots.push(toTime(m))
    if (include && isISOTime(include) && !slots.includes(include)) {
        slots.push(include)
        slots.sort((a, b) => toMinutes(a) - toMinutes(b))
    }
    return slots
}

/** 12-hour display, because a merchant reads "2:30 pm" faster than "14:30". */
export function timeLabel(time: string): string {
    const total = toMinutes(time)
    const h24 = Math.floor(total / 60)
    const m = total % 60
    const suffix = h24 < 12 ? 'am' : 'pm'
    const h12 = h24 % 12 === 0 ? 12 : h24 % 12
    return `${h12}:${String(m).padStart(2, '0')} ${suffix}`
}
