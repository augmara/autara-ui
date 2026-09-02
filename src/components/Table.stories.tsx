import type { Meta, StoryObj } from '@storybook/react-vite'
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from './Table'

/**
 * Table — the dense data surface. Admin's light-mode tables are the hardest
 * case in the design system, so this is where the rules get tested rather
 * than admired.
 *
 * ─── AUTM-974: the selected row ─────────────────────────────────────────
 *
 * `data-[state=selected]` used to paint `bg-autara-purple-50` (#f5f0ff) — a
 * pastel tint of the accent, which is the first thing rule 4 of the Autara
 * Glass direction bans and a look Don has now rejected three times. It
 * measured 1.05:1 against a white row: on a twelve-row table you could not
 * tell which row you had selected without moving your head.
 *
 * It is now a solid `--act-fill` with `--on-act` ink, and the ink is FORCED
 * onto the cells rather than left to inherit — `TableCell` sets its colour on
 * the `<td>`, so a colour on the `<tr>` alone loses to it and the row would go
 * solid purple with purple-grade ink on top. Trading a banned outline for
 * failing text is the exact mistake the merchant-mobile booking-detail pass
 * nearly shipped at 3.40:1.
 *
 * The light branch also gave up `autara-gray-200` / `autara-gray-50`, which
 * are Tailwind ramps that do not track the theme (AUTM-936's finding).
 *
 * ─── AUTM-975: the default no longer needs hiding ───────────────────────
 *
 * These stories used to pass `theme="light"` on every single cell, because
 * every `theme` prop DEFAULTED to `'dark'` and a bare `<Table>` rendered
 * white-on-cream. The story that showed it was called `BareDefaultIsBroken`.
 *
 * The default is now the themed branch, so the markup below is what a
 * consumer would actually write — no prop at all. `InkSurface` at the bottom
 * is the opt-in that `theme="dark"` still buys you, and `BothThemes` proves
 * the default renders in dark mode as well as light, which is the part a
 * hard-coded `theme="light"` could never have shown.
 */
const meta: Meta<typeof Table> = {
    title: 'Molecules/Table',
    component: Table,
    parameters: { layout: 'padded' },
}
export default meta
type Story = StoryObj<typeof Table>

const BOOKINGS = [
    { id: 'BK-4821', customer: 'Priya N', service: 'Full detail — interior + exterior', when: 'Mon 09:00', total: '$240.00' },
    { id: 'BK-4822', customer: 'Dan R', service: 'Ceramic coating top-up', when: 'Mon 11:30', total: '$180.00' },
    { id: 'BK-4823', customer: 'Alex T', service: 'Express wash', when: 'Mon 14:15', total: '$65.00' },
    { id: 'BK-4824', customer: 'Sam K', service: 'Paint correction — stage 2', when: 'Tue 08:00', total: '$420.00' },
]

function BookingTable({ selected }: { selected?: string }) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Booking</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>When</TableHead>
                    <TableHead>Total</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {BOOKINGS.map((b) => (
                    <TableRow
                        key={b.id}
                       
                        data-state={b.id === selected ? 'selected' : undefined}
                    >
                        <TableCell>{b.id}</TableCell>
                        <TableCell>{b.customer}</TableCell>
                        <TableCell>{b.service}</TableCell>
                        <TableCell>{b.when}</TableCell>
                        <TableCell>{b.total}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}

export const Default: Story = {
    name: 'Default — nothing selected',
    render: () => <BookingTable />,
}

/**
 * The row this ticket is about. Compare it against `Default` above: the fill
 * is 9.48:1 from the row beside it in light and 2.72:1 in dark, where the
 * tint it replaced was 1.05:1 in both.
 */
export const SelectedRow: Story = {
    name: 'AUTM-974 — the selected row is solid',
    render: () => <BookingTable selected="BK-4822" />,
}

export const BothThemes: Story = {
    name: 'In context — light and dark canvas',
    render: () => (
        <div className="grid gap-6 xl:grid-cols-2">
            {[
                { label: 'light', theme: undefined },
                { label: 'dark', theme: 'dark' as const },
            ].map((col) => (
                <div
                    key={col.label}
                    data-theme={col.theme}
                    className="space-y-3 rounded-autara-lg bg-[var(--background)] p-5"
                >
                    <p className="text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]">
                        {col.label}
                    </p>
                    <div className="rounded-autara-lg bg-[var(--surface)] p-2">
                        <BookingTable selected="BK-4822" />
                    </div>
                </div>
            ))}
        </div>
    ),
}

/**
 * Edge — a long service name and a caption, which is where a dense row
 * actually breaks. The selected row's ink has to survive the wrap too.
 */
export const LongContent: Story = {
    name: 'Edge — long labels, footer and caption',
    render: () => (
        <Table>
            <TableCaption>
                Bookings for the week beginning 7 September
            </TableCaption>
            <TableHeader>
                <TableRow>
                    <TableHead>Booking</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Total</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                <TableRow data-state="selected">
                    <TableCell>BK-4825</TableCell>
                    <TableCell>
                        Full-body paint protection film with ceramic top-up,
                        headlight restoration and interior deep clean
                    </TableCell>
                    <TableCell>$1,980.00</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell>BK-4826</TableCell>
                    <TableCell>Express wash</TableCell>
                    <TableCell>$65.00</TableCell>
                </TableRow>
            </TableBody>
            <TableFooter>
                <TableRow>
                    <TableCell>Total</TableCell>
                    <TableCell />
                    <TableCell>$2,045.00</TableCell>
                </TableRow>
            </TableFooter>
        </Table>
    ),
}

/**
 * The opt-in that `theme="dark"` still buys: a STATIC ink treatment, for a
 * table sitting on a photo or on a marketing surface. It is not the dark
 * theme — the tokens handle that on their own, which is what the second
 * column of `BothThemes` above demonstrates with no prop at all.
 */
export const InkSurface: Story = {
    name: 'Opt-in — theme="dark" on an ink ground',
    render: () => (
        <div className="rounded-autara-lg bg-[var(--ink)] p-5">
            <Table>
                <TableHeader>
                    <TableRow theme="dark">
                        <TableHead theme="dark">Booking</TableHead>
                        <TableHead theme="dark">Customer</TableHead>
                        <TableHead theme="dark">Total</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {BOOKINGS.slice(0, 3).map((b) => (
                        <TableRow key={b.id} theme="dark">
                            <TableCell theme="dark">{b.id}</TableCell>
                            <TableCell theme="dark">{b.customer}</TableCell>
                            <TableCell theme="dark">{b.total}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    ),
}

/**
 * The regression this ticket closes, kept as a story so it stays visible.
 *
 * Left: a bare `<Table>` — no `theme` prop anywhere, which is what a consumer
 * writes first. It used to render `text-white/70` cells on the cream canvas.
 * Right: the same markup with the ink treatment forced on, on the cream
 * canvas, which is what the old default silently produced.
 *
 * `default-variant.test.ts` could not catch the old default: that scan reads
 * cva `defaultVariants`, and Table's default was a TypeScript parameter
 * default. It resolves parameter defaults now, and Avatar and Progress had
 * the same shape.
 */
export const DefaultVsInkOnCream: Story = {
    name: 'AUTM-975 — the bare default, beside what it used to do',
    render: () => (
        <div className="grid gap-6 xl:grid-cols-2">
            <div className="space-y-2">
                <p className="text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]">
                    Now — no theme prop
                </p>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Booking</TableHead>
                            <TableHead>Customer</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {BOOKINGS.slice(0, 2).map((b) => (
                            <TableRow key={b.id}>
                                <TableCell>{b.id}</TableCell>
                                <TableCell>{b.customer}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <div className="space-y-2">
                <p className="text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]">
                    Before — the ink treatment, on cream
                </p>
                <Table>
                    <TableHeader>
                        <TableRow theme="dark">
                            <TableHead theme="dark">Booking</TableHead>
                            <TableHead theme="dark">Customer</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {BOOKINGS.slice(0, 2).map((b) => (
                            <TableRow key={b.id} theme="dark">
                                <TableCell theme="dark">{b.id}</TableCell>
                                <TableCell theme="dark">{b.customer}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    ),
}
