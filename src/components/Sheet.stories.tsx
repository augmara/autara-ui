import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from './Button'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from './Sheet'
import { Switch } from './Switch'

/**
 * Sheet — edge-anchored drawer built on the Radix dialog primitive.
 *
 * Four `side` values — top / right / bottom / left — control both the
 * anchor and the entrance direction. Same cream-canvas grammar as
 * `Dialog`: `--surface` fill, hairline edge, ink overlay, Solar close.
 */
const meta: Meta = {
    title: 'Atoms/Sheet',
    parameters: { layout: 'centered' },
}
export default meta
type Story = StoryObj

// ─── Four sides ────────────────────────────────────────────────────
const SideStory: React.FC<{ side: 'top' | 'right' | 'bottom' | 'left' }> = ({
    side,
}) => (
    <Sheet>
        <SheetTrigger asChild>
            <Button variant="outline" size="sm">
                Open {side}
            </Button>
        </SheetTrigger>
        <SheetContent side={side}>
            <SheetHeader>
                <SheetTitle>{`Sheet — ${side}`}</SheetTitle>
                <SheetDescription>
                    Anchored to the {side} edge of the viewport. Animation
                    direction follows the anchor.
                </SheetDescription>
            </SheetHeader>
            <div className="flex-1 px-6 pb-4 text-sm text-[var(--text-muted)]">
                Body content sits here. Use it for filters, settings,
                long-form preview, or anything that doesn&apos;t fit a centre
                dialog.
            </div>
            <SheetFooter>
                <Button variant="outline" size="sm">
                    Cancel
                </Button>
                <Button variant="dark" size="sm">
                    Apply
                </Button>
            </SheetFooter>
        </SheetContent>
    </Sheet>
)

export const RightSide: Story = { render: () => <SideStory side="right" /> }
export const LeftSide: Story = { render: () => <SideStory side="left" /> }
export const TopSide: Story = { render: () => <SideStory side="top" /> }
export const BottomSide: Story = { render: () => <SideStory side="bottom" /> }

// ─── In context — settings drawer ──────────────────────────────────
export const SettingsDrawer: Story = {
    name: 'In context — settings drawer',
    render: () => (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="dark" size="sm">
                    Open settings
                </Button>
            </SheetTrigger>
            <SheetContent side="right">
                <SheetHeader>
                    <SheetTitle>Notification settings</SheetTitle>
                    <SheetDescription>
                        Choose what reaches you and how. Changes save
                        automatically.
                    </SheetDescription>
                </SheetHeader>
                <div className="flex-1 space-y-1 px-2 pb-4">
                    {[
                        {
                            title: 'New booking requests',
                            desc: 'Push + email the moment a customer books.',
                            on: true,
                        },
                        {
                            title: 'Reminders',
                            desc: '24h before a confirmed booking.',
                            on: true,
                        },
                        {
                            title: 'Weekly summary',
                            desc: 'Earnings + reviews delivered every Monday.',
                            on: false,
                        },
                        {
                            title: 'Product updates',
                            desc: 'New features and tips, monthly.',
                            on: false,
                        },
                    ].map((row) => (
                        <label
                            key={row.title}
                            className="flex cursor-pointer items-start justify-between gap-4 rounded-xl px-4 py-3 hover:bg-[var(--surface-elevated)]"
                        >
                            <div className="min-w-0">
                                <div className="text-sm font-medium text-[var(--text-strong)]">
                                    {row.title}
                                </div>
                                <div className="mt-0.5 text-xs text-[var(--text-muted)]">
                                    {row.desc}
                                </div>
                            </div>
                            <Switch
                                defaultChecked={row.on}
                                className="mt-0.5"
                            />
                        </label>
                    ))}
                </div>
                <SheetFooter>
                    <Button variant="outline" size="sm">
                        Reset to defaults
                    </Button>
                    <Button variant="dark" size="sm">
                        Done
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    ),
}
