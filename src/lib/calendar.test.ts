import { describe, expect, it } from 'vitest'

import {
    addDays,
    daysBetween,
    monthGrid,
    monthYearLabel,
    timeLabel,
    timeSlots,
    toTime,
    weekdayIndex,
} from './calendar'

describe('calendar arithmetic', () => {
    it('rolls over months and years', () => {
        expect(addDays('2026-09-30', 1)).toBe('2026-10-01')
        expect(addDays('2026-01-01', -1)).toBe('2025-12-31')
    })

    it('handles a leap day', () => {
        expect(addDays('2028-02-28', 1)).toBe('2028-02-29')
        expect(daysBetween('2028-02-01', '2028-03-01')).toBe(29)
    })

    it('does not drift across a southern-hemisphere DST boundary', () => {
        // The trap this module exists to avoid. AEDT starts on the first
        // Sunday of October, and date maths done on a LOCAL Date across it
        // returns 23 or 25 hours, so "+1 day" can land back on the same
        // calendar day. Everything here is UTC, so a day is always a day.
        expect(addDays('2026-10-03', 1)).toBe('2026-10-04')
        expect(addDays('2026-10-04', 1)).toBe('2026-10-05')
        expect(daysBetween('2026-10-03', '2026-10-05')).toBe(2)
        // ...and again when the clocks go back in April.
        expect(addDays('2026-04-04', 1)).toBe('2026-04-05')
        expect(daysBetween('2026-04-01', '2026-04-30')).toBe(29)
    })

    it('counts weekdays Monday-first', () => {
        expect(weekdayIndex('2026-09-07')).toBe(0) // a Monday
        expect(weekdayIndex('2026-09-13')).toBe(6) // the Sunday after
    })

    it('builds whole Monday-first weeks that cover the month', () => {
        const grid = monthGrid('2026-09-09')
        expect(grid.length % 7).toBe(0)
        expect(weekdayIndex(grid[0].date)).toBe(0)
        const inMonth = grid.filter((c) => c.inMonth).map((c) => c.date)
        expect(inMonth[0]).toBe('2026-09-01')
        expect(inMonth[inMonth.length - 1]).toBe('2026-09-30')
        expect(inMonth).toHaveLength(30)
    })

    it('covers February without trailing empty weeks', () => {
        const grid = monthGrid('2027-02-10')
        expect(grid.filter((c) => c.inMonth)).toHaveLength(28)
        expect(grid.length % 7).toBe(0)
    })

    it('labels the month in en-AU regardless of device locale', () => {
        expect(monthYearLabel('2026-09-09')).toBe('September 2026')
    })
})

describe('time slots', () => {
    it('includes both ends of the range', () => {
        const slots = timeSlots('09:00', '10:00', 30)
        expect(slots).toEqual(['09:00', '09:30', '10:00'])
    })

    it('keeps an off-grid value so editing never looks like a lost field', () => {
        // A booking taken at 10:20 under a 15-minute interval, reopened after
        // the merchant moved to 30. Dropping it would render the form as if
        // no time were set.
        const slots = timeSlots('09:00', '11:00', 30, '10:20')
        expect(slots).toContain('10:20')
        expect(slots.indexOf('10:20')).toBe(slots.indexOf('10:00') + 1)
    })

    it('does not duplicate an on-grid value', () => {
        expect(timeSlots('09:00', '10:00', 30, '09:30')).toHaveLength(3)
    })

    it('refuses to loop forever on a zero interval', () => {
        expect(timeSlots('09:00', '10:00', 0).length).toBe(61)
    })

    it('clamps rather than wrapping past midnight', () => {
        expect(toTime(24 * 60 + 30)).toBe('23:59')
        expect(toTime(-10)).toBe('00:00')
    })

    it('reads as a merchant would say it', () => {
        expect(timeLabel('00:00')).toBe('12:00 am')
        expect(timeLabel('12:00')).toBe('12:00 pm')
        expect(timeLabel('14:30')).toBe('2:30 pm')
        expect(timeLabel('09:05')).toBe('9:05 am')
    })
})
