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
 * ─── One thing these stories do NOT hide ────────────────────────────────
 *
 * Every `theme` prop on this component defaults to `'dark'`, so a bare
 * `<Table>` renders white-on-cream. That is AUTM-975 and it is deliberately
 * not fixed here — changing a public prop default deserves its own revert
 * boundary. `BareDefaultIsBroken` at the bottom shows it rather than quietly
 * passing `theme="light"` everywhere and leaving the next person to find it.
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
                <TableRow theme="light">
                    <TableHead theme="light">Booking</TableHead>
                    <TableHead theme="light">Customer</TableHead>
                    <TableHead theme="light">Service</TableHead>
                    <TableHead theme="light">When</TableHead>
                    <TableHead theme="light">Total</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {BOOKINGS.map((b) => (
                    <TableRow
                        key={b.id}
                        theme="light"
                        data-state={b.id === selected ? 'selected' : undefined}
                    >
                        <TableCell theme="light">{b.id}</TableCell>
                        <TableCell theme="light">{b.customer}</TableCell>
                        <TableCell theme="light">{b.service}</TableCell>
                        <TableCell theme="light">{b.when}</TableCell>
                        <TableCell theme="light">{b.total}</TableCell>
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
            <TableCaption theme="light">
                Bookings for the week beginning 7 September
            </TableCaption>
            <TableHeader>
                <TableRow theme="light">
                    <TableHead theme="light">Booking</TableHead>
                    <TableHead theme="light">Service</TableHead>
                    <TableHead theme="light">Total</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                <TableRow theme="light" data-state="selected">
                    <TableCell theme="light">BK-4825</TableCell>
                    <TableCell theme="light">
                        Full-body paint protection film with ceramic top-up,
                        headlight restoration and interior deep clean
                    </TableCell>
                    <TableCell theme="light">$1,980.00</TableCell>
                </TableRow>
                <TableRow theme="light">
                    <TableCell theme="light">BK-4826</TableCell>
                    <TableCell theme="light">Express wash</TableCell>
                    <TableCell theme="light">$65.00</TableCell>
                </TableRow>
            </TableBody>
            <TableFooter>
                <TableRow theme="light">
                    <TableCell theme="light">Total</TableCell>
                    <TableCell theme="light" />
                    <TableCell theme="light">$2,045.00</TableCell>
                </TableRow>
            </TableFooter>
        </Table>
    ),
}

/**
 * NOT a design choice — a defect, shown on purpose (AUTM-975).
 *
 * Every `theme` prop defaults to `'dark'`, so this is what a consumer gets
 * for writing the obvious thing. On cream the cells are `text-white/70`.
 * `default-variant.test.ts` cannot catch it because that scan reads cva
 * `defaultVariants` and Table's default is a TypeScript parameter default.
 */
export const BareDefaultIsBroken: Story = {
    name: 'Known defect — bare <Table> defaults to the ink treatment (AUTM-975)',
    render: () => (
        <div className="space-y-3">
            <p className="text-sm text-[var(--text-muted)]">
                No `theme` prop passed. The rows below are white-on-cream.
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
    ),
}
