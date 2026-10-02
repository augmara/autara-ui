import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'

import { MonthCalendar } from './MonthCalendar'
import { type DayState } from './DatePicker'
import { Button } from './Button'
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './Dialog'

/**
 * Every story pins `today`: the component refuses to read the clock (see
 * `lib/calendar.ts`), and it keeps the screenshots stable.
 */
const TODAY = '2026-10-03'

const meta: Meta<typeof MonthCalendar> = {
    title: 'Forms/MonthCalendar',
    component: MonthCalendar,
    parameters: {
        docs: {
            description: {
                component:
                    'One month of days, any month. Today is ringed, the chosen day is filled, closed days are muted and hatched but still selectable, and refused days are inert. Keyboard: arrows move a day or a week, Home and End the week, Page Up and Page Down a month (with Shift, a year). AUTM-1633.',
            },
        },
    },
}
export default meta
type Story = StoryObj<typeof MonthCalendar>

function Controlled(props: Partial<React.ComponentProps<typeof MonthCalendar>>) {
    const [value, setValue] = React.useState(props.value ?? '')
    return (
        <div className="max-w-sm rounded-[1.5rem] bg-[var(--paper)] p-5">
            <MonthCalendar {...props} today={props.today ?? TODAY} value={value} onSelect={setValue} testId="story" />
            <p className="mt-3 text-sm text-[var(--text-muted)]">Chosen: {value || 'nothing yet'}</p>
        </div>
    )
}

/** Nothing chosen: opens on today's month with today ringed. */
export const Default: Story = { render: () => <Controlled /> }

/** No past days: the floor is today, as on New booking, so Back starts disabled. */
export const FromToday: Story = { render: () => <Controlled min={TODAY} value="2026-10-08" /> }

/** The merchant's hours: Sundays and Mondays closed, a Friday nearly full. */
export const Availability: Story = {
    render: () => (
        <Controlled
            min={TODAY}
            value="2026-10-09"
            dayState={(date): DayState => {
                const weekday = new Date(`${date}T00:00:00Z`).getUTCDay()
                if (weekday === 0 || weekday === 1) return 'closed'
                if (date === '2026-10-16') return 'limited'
                return 'available'
            }}
        />
    ),
}

/** Bounded both ends: Next stops at the month holding `max`. */
export const Bounded: Story = { render: () => <Controlled min={TODAY} max="2026-11-20" /> }

/** A chosen day next year opens on its own month. */
export const FarDate: Story = { render: () => <Controlled min={TODAY} value="2027-03-15" /> }

/** Sized in rem: the grid thins out under system text scaling rather than truncating. */
export const TextScale200: Story = {
    name: 'At 200% text scale',
    render: () => (
        <div style={{ fontSize: '200%' }}>
            <Controlled min={TODAY} value="2026-10-08" />
        </div>
    ),
}

/**
 * In context: how DatePicker opens it, as the library's responsive dialog. A
 * bottom sheet below `sm`, a centred card from `sm`. Resize the canvas to see
 * both. Focus lands on the chosen day, so the arrow keys work at once.
 */
export const InResponsiveDialog: Story = {
    render: () => {
        const [open, setOpen] = React.useState(false)
        const [value, setValue] = React.useState('2026-10-08')
        return (
            <>
                <Button variant="quiet" size="sm" onClick={() => setOpen(true)}>
                    Pick a date
                </Button>
                <p className="mt-2 text-sm text-[var(--text-muted)]">Chosen: {value}</p>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogContent layout="responsive" className="sm:max-w-[26rem]">
                        <DialogHeader>
                            <DialogTitle>Pick a date</DialogTitle>
                            <DialogDescription>
                                Muted days are outside your hours. They&apos;re still yours to take.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogBody>
                            <MonthCalendar
                                value={value}
                                today={TODAY}
                                min={TODAY}
                                dayState={(date): DayState =>
                                    new Date(`${date}T00:00:00Z`).getUTCDay() === 0 ? 'closed' : 'available'
                                }
                                onSelect={(date) => {
                                    setValue(date)
                                    setOpen(false)
                                }}
                            />
                        </DialogBody>
                    </DialogContent>
                </Dialog>
            </>
        )
    },
}
