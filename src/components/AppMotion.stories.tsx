import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState, type ReactNode } from 'react'
import { CountUp } from './CountUp'
import {
    Dialog,
    DialogBody,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from './Dialog'
import { markNavigation } from '../lib/navigation-motion'

/**
 * AUTM-1781: the app motion vocabulary (Don, 2026-10-09: "can we apply slight
 * animation in our app too"). One soft ease-out, a small overshoot only for a
 * pop, transform and opacity only, once per arrival, nothing under reduced
 * motion. Classes and tokens are in utilities/animations.css, "App motion".
 *
 * Each story has a Replay control, because every movement here runs once.
 */
const meta: Meta = {
    title: 'Foundations/App motion',
    parameters: { layout: 'padded' },
}
export default meta
type Story = StoryObj

function Replay({ children }: { children: (key: number) => ReactNode }) {
    const [key, setKey] = useState(0)
    return (
        <div className="flex max-w-[390px] flex-col gap-4">
            <button
                type="button"
                onClick={() => setKey((k) => k + 1)}
                className="motion-press self-start rounded-full bg-[var(--band)] px-4 py-2 text-sm font-medium"
            >
                Replay
            </button>
            <div key={key}>{children(key)}</div>
        </div>
    )
}

const Card = ({ children }: { children: ReactNode }) => (
    <div className="rounded-3xl bg-[var(--band)] p-4 text-[var(--text-strong)]">{children}</div>
)

/** `.motion-rise`: a screen's sections rise 18px from 98.5%, 60ms apart. */
export const ScreenEnter: Story = {
    render: () => (
        <Replay>
            {() => (
                <div className="motion-rise flex flex-col gap-3">
                    <p className="text-[2.75rem] leading-none font-black tracking-[-0.02em]">Sat 17 Oct</p>
                    <Card>Fitzroy Paint Co, Paint correction</Card>
                    <Card>Where: 41 Smith Street, Fitzroy</Card>
                    <Card>Payment: $156 paid, $364 after the job</Card>
                </div>
            )}
        </Replay>
    ),
}

/** `.motion-rows`: list rows rise 4px and fade, 30ms apart, the first 12. */
export const Rows: Story = {
    render: () => (
        <Replay>
            {() => (
                <ul className="motion-rows m-0 flex list-none flex-col p-0">
                    {['Paint correction', 'Maintenance wash', 'Interior refresh', 'Headlight restoration', 'Ceramic top-up'].map(
                        (t) => (
                            <li key={t} className="border-b border-[var(--hairline)] py-3 text-[1.0625rem]">
                                {t}
                            </li>
                        ),
                    )}
                </ul>
            )}
        </Replay>
    ),
}

/** CountUp: money counts up once, 900ms; the DOM holds the final value throughout. */
export const Numbers: Story = {
    render: () => (
        <Replay>
            {() => (
                <div className="flex gap-3">
                    {[
                        ['Paid', 85.5, '$85.50'],
                        ['After the job', 199.5, '$199.50'],
                    ].map(([label, value, text]) => (
                        <div key={label as string} className="flex-1 rounded-2xl bg-[var(--band)] px-4 py-3.5">
                            <p className="text-[0.9375rem] font-medium text-[var(--text-muted)]">{label}</p>
                            <CountUp
                                value={value as number}
                                text={text as string}
                                formatOptions={{ style: 'currency', currency: 'AUD' }}
                                className="text-[1.75rem] font-black tracking-[-0.02em]"
                            />
                        </div>
                    ))}
                </div>
            )}
        </Replay>
    ),
}

/** `.motion-pop`: a chip pops when it is chosen (1, 1.04, .99, 1, on the overshoot). */
export const Pop: Story = {
    render: function Pop() {
        const [chosen, setChosen] = useState<string | null>(null)
        return (
            <div role="radiogroup" aria-label="Why are you cancelling?" className="flex max-w-[390px] flex-wrap gap-2">
                {['Plans changed', 'Found another time', 'Booked by mistake', 'Price', 'Something else'].map((r) => (
                    <button
                        key={r}
                        type="button"
                        role="radio"
                        aria-checked={chosen === r}
                        onClick={() => setChosen(r)}
                        className={
                            'motion-pop min-h-11 rounded-full px-4 text-base font-medium ' +
                            (chosen === r
                                ? 'bg-[var(--brand)] text-[var(--on-brand)]'
                                : 'bg-[var(--band)] text-[var(--text-strong)]')
                        }
                    >
                        {r}
                    </button>
                ))}
            </div>
        )
    },
}

/** `.motion-sheet-soft` on a responsive Dialog: a sheet rises on a phone, a card settles from sm. */
export const Sheet: Story = {
    render: function Sheet() {
        const [open, setOpen] = useState(false)
        return (
            <>
                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    className="motion-press rounded-full bg-[var(--lime)] px-5 py-3 font-medium text-[var(--on-lime)]"
                >
                    Review the extra
                </button>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogContent layout="responsive" className="motion-sheet-soft">
                        <DialogHeader>
                            <DialogTitle>Fitzroy Paint Co found something</DialogTitle>
                            <DialogDescription>Nothing is charged unless you approve it.</DialogDescription>
                        </DialogHeader>
                        <DialogBody>Headlight restoration, $90.</DialogBody>
                        <DialogFooter>
                            <button type="button" onClick={() => setOpen(false)} className="rounded-full bg-[var(--band)] px-5 py-3">
                                Not today
                            </button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </>
        )
    },
}

/** `.motion-screen` with `markNavigation`: push slides in from the right, back from the left. */
export const ScreenDirection: Story = {
    render: function ScreenDirection() {
        const [screen, setScreen] = useState<'list' | 'booking'>('list')
        const go = (to: 'list' | 'booking') => {
            markNavigation(to === 'booking' ? 'push' : 'back')
            setScreen(to)
        }
        return (
            <div className="max-w-[390px] overflow-hidden">
                <div key={screen} className="motion-screen flex flex-col gap-3">
                    {screen === 'list' ? (
                        <>
                            <p className="text-xl font-bold">Bookings</p>
                            <button type="button" onClick={() => go('booking')} className="motion-press-row rounded-2xl bg-[var(--band)] p-4 text-left">
                                Paint correction, Sat 17 Oct
                            </button>
                        </>
                    ) : (
                        <>
                            <button type="button" onClick={() => go('list')} className="self-start rounded-full bg-[var(--band)] px-4 py-2">
                                Back
                            </button>
                            <p className="text-[2.75rem] leading-none font-black">Sat 17 Oct</p>
                        </>
                    )}
                </div>
            </div>
        )
    },
}
