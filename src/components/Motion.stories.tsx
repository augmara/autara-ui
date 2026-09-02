import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from './Button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from './Dialog'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from './Sheet'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from './Tooltip'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from './DropdownMenu'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from './Select'
import {
    Popover,
    PopoverContent,
    PopoverDescription,
    PopoverHeader,
    PopoverTitle,
    PopoverTrigger,
} from './Popover'
import { PhoneInput } from './PhoneInput'

/**
 * MOTION — every enter and exit in the package, on one page (AUTM-967).
 *
 * ─── Why this page exists ───────────────────────────────────────────────
 *
 * Seven components styled their transitions with `animate-in`, `fade-in-0`,
 * `zoom-in-95` and `slide-in-from-*`. Those are `tailwindcss-animate`
 * utilities, and the plugin is not a dependency of this package or of
 * merchant-mobile, merchant-web or customer-web. **They emitted nothing.**
 * Every dialog, sheet, tooltip, dropdown, select, phone-input country list
 * and nav menu across all three web surfaces appeared and disappeared on the
 * frame it was asked for.
 *
 * The reason it survived from the first Radix wrapper until now is that
 * nothing errored, nothing warned, and the source read as though it was
 * handled. The only symptom was a product that felt abrupt — Perceived
 * Performance failing on the most repeated interaction there is.
 *
 * A page rather than one story per component, because the thing worth
 * reviewing is whether they feel like ONE product. Open a dialog, then a
 * sheet, then a dropdown: enters run on the same easing and exits are
 * shorter than enters everywhere, because an opening surface is asking for
 * attention and a closing one is getting out of the way.
 *
 * ─── What to check ──────────────────────────────────────────────────────
 *
 * 1. Every surface animates BOTH ways. Radix keeps an exiting node mounted
 *    until `animationend`, so a missing exit shows up as a snap on close.
 * 2. The Sheet's direction matches its edge. That slide is the affordance —
 *    it says where dismissing the panel will send it.
 * 3. Turn on "Reduce motion" in your OS and reload. Everything should appear
 *    and dismiss instantly, and nothing should be left parked off-screen.
 * 4. Both themes, from the toolbar.
 */
const meta: Meta = {
    title: 'Design System/Motion',
    parameters: { layout: 'padded' },
}
export default meta
type Story = StoryObj

function Row({
    label,
    note,
    children,
}: {
    label: string
    note: string
    children: React.ReactNode
}) {
    return (
        <div className="flex flex-col gap-2 rounded-autara-lg bg-[var(--surface)] p-5">
            <p className="text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]">
                {label}
            </p>
            <div className="flex flex-wrap items-center gap-3">{children}</div>
            <p className="text-sm leading-relaxed text-[var(--text-muted)]">{note}</p>
        </div>
    )
}

function Surfaces() {
    const [phone, setPhone] = React.useState('')
    return (
        <div className="grid gap-4 lg:grid-cols-2">
            <Row
                label="Dialog"
                note="Scrim fades, panel scales from 96%. 200ms in, 150ms out."
            >
                <Dialog>
                    <DialogTrigger asChild>
                        <Button size="sm">Open dialog</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Cancel this booking?</DialogTitle>
                            <DialogDescription>
                                Priya N is expecting you at 09:00. She will be
                                notified and her deposit refunded.
                            </DialogDescription>
                        </DialogHeader>
                    </DialogContent>
                </Dialog>
            </Row>

            <Row
                label="Sheet"
                note="Slides from its own edge. 280ms in, 200ms out — the longest in the set, because it travels the furthest."
            >
                {(['right', 'left', 'bottom', 'top'] as const).map((side) => (
                    <Sheet key={side}>
                        <SheetTrigger asChild>
                            <Button size="sm" variant="light">
                                {side}
                            </Button>
                        </SheetTrigger>
                        <SheetContent side={side} className="p-6">
                            <SheetHeader>
                                <SheetTitle>From the {side}</SheetTitle>
                                <SheetDescription>
                                    Dismiss it and it goes back the way it came.
                                </SheetDescription>
                            </SheetHeader>
                        </SheetContent>
                    </Sheet>
                ))}
            </Row>

            <Row
                label="Tooltip"
                note="Hover and wait. Its open states are `delayed-open` and `instant-open`, never `open` — a rule written against `open` would give it an exit and no entrance."
            >
                <TooltipProvider>
                    {(['top', 'bottom', 'left', 'right'] as const).map((side) => (
                        <Tooltip key={side}>
                            <TooltipTrigger asChild>
                                <Button size="sm" variant="light">
                                    {side}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side={side}>
                                Grows out of the {side} edge
                            </TooltipContent>
                        </Tooltip>
                    ))}
                </TooltipProvider>
            </Row>

            <Row
                label="DropdownMenu"
                note="Scales from the trigger — the origin comes from Radix's own transform-origin variable, so it is correct on every side and alignment without a rule per side."
            >
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="light">
                            Booking actions
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem>Message customer</DropdownMenuItem>
                        <DropdownMenuItem>Reschedule</DropdownMenuItem>
                        <DropdownMenuItem>Cancel booking</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </Row>

            <Row
                label="Select"
                note="Same floating-panel treatment. The popper nudge still applies: Tailwind v4 compiles `translate-*` to the standalone `translate:` property, so it composes with the keyframes instead of fighting them."
            >
                <Select>
                    {/* The accessible name is the CONSUMER's job — a trigger
                        whose only content is a placeholder has none, which
                        axe flags as critical. A story without one models the
                        thing a consumer would then ship. */}
                    <SelectTrigger className="w-56" aria-label="Service">
                        <SelectValue placeholder="Choose a service" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ppf">Full-body PPF</SelectItem>
                        <SelectItem value="ceramic">Ceramic coating</SelectItem>
                        <SelectItem value="wash">Express wash</SelectItem>
                    </SelectContent>
                </Select>
            </Row>

            <Row
                label="PhoneInput country list"
                note="The one nobody thinks of, opened on the first screen of merchant onboarding."
            >
                <div className="w-full max-w-sm">
                    <PhoneInput value={phone} onChange={setPhone} />
                </div>
            </Row>

            <Row
                label="Popover"
                note="Shipped with real CSS in v5.1.0 and was the component that found this bug. It now shares the one implementation rather than carrying a near-duplicate."
            >
                <Popover>
                    <PopoverTrigger asChild>
                        <Button size="sm" variant="light">
                            Notifications
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent>
                        <PopoverHeader>
                            <div>
                                <PopoverTitle>Notifications</PopoverTitle>
                                <PopoverDescription>
                                    Two new booking requests
                                </PopoverDescription>
                            </div>
                        </PopoverHeader>
                    </PopoverContent>
                </Popover>
            </Row>
        </div>
    )
}

export const EverySurface: Story = {
    name: 'Every animated surface',
    render: () => <Surfaces />,
}

export const BothThemes: Story = {
    name: 'In context — light and dark canvas',
    render: () => (
        <div className="grid gap-6 2xl:grid-cols-2">
            {[
                { label: 'light', theme: undefined },
                { label: 'dark', theme: 'dark' as const },
            ].map((col) => (
                <div
                    key={col.label}
                    data-theme={col.theme}
                    className="space-y-4 rounded-autara-lg bg-[var(--background)] p-5"
                >
                    <p className="text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]">
                        {col.label}
                    </p>
                    {/* Dialogs, sheets, tooltips and menus all PORTAL to
                        document.body, so they escape this themed island and
                        render in whatever the toolbar is set to. That is
                        correct — the app stamps `data-theme` on <html> — but
                        it means the dark column's panels follow the toolbar,
                        not the column. Use the toolbar to review them. */}
                    <Surfaces />
                </div>
            ))}
        </div>
    ),
}

/**
 * The reason this ticket was not simply "add transitions".
 *
 * Storybook cannot emulate `prefers-reduced-motion`, so this story states the
 * contract and tells you how to check it for real: turn on Reduce Motion in
 * macOS System Settings → Accessibility → Display (or Chrome DevTools →
 * Rendering → Emulate CSS prefers-reduced-motion), reload, and open anything
 * above.
 */
export const ReducedMotion: Story = {
    name: 'A11y — prefers-reduced-motion',
    render: () => (
        <div className="max-w-2xl space-y-3 rounded-autara-lg bg-[var(--surface)] p-6">
            <h3 className="text-base font-medium text-[var(--text-strong)]">
                What a reduced-motion user gets
            </h3>
            <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-[var(--text-muted)]">
                <li>
                    Every animation is clamped to 0.01ms by the global block in
                    <code className="px-1">utilities/animations.css</code>, so
                    surfaces appear and dismiss instantly.
                </li>
                <li>
                    Unmounting still works. Radix waits for{' '}
                    <code className="px-1">animationend</code> before removing an
                    exiting node, and a 0.01ms animation still fires it — which
                    is why the answer is a clamp and not{' '}
                    <code className="px-1">animation: none</code>.
                </li>
                <li>
                    Every motion offset is reset as well as clamped. A sheet
                    left parked at <code className="px-1">translateX(100%)</code>{' '}
                    is an invisible modal with a focus trap inside it, which is
                    worse than an unanimated one.
                </li>
            </ul>
            <p className="text-sm leading-relaxed text-[var(--text-muted)]">
                To check: DevTools → Rendering → Emulate CSS media feature
                prefers-reduced-motion → reduce, then reload and open anything
                in “Every animated surface”.
            </p>
        </div>
    ),
}
