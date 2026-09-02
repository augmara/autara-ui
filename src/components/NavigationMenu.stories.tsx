import type { Meta, StoryObj } from '@storybook/react-vite'
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from './NavigationMenu'

/**
 * NavigationMenu — the marketing-site nav. Dark by design, not by theme:
 * rule 6 of the Autara Glass direction keeps the marketing surfaces fixed
 * dark, so this component paints its own ink chrome rather than tracking the
 * token stack. Every story below therefore sits on an ink ground.
 *
 * ─── AUTM-967: it had no stories, and none of its motion was real ───────
 *
 * This file did not exist, which is a large part of why the component shipped
 * with THREE separate dead classes on it and nobody saw:
 *
 *   - Eight `data-[motion…]` variants of `animate-in` / `slide-in-from-*-52`
 *     on the content, so moving the pointer between two open triggers cut
 *     between panels with no travel at all.
 *   - `zoom-in-90` / `zoom-out-95` on the viewport.
 *   - `origin-top-center`, which is not a Tailwind utility in any version.
 *     The viewport was scaling about its centre while the source said it grew
 *     downward out of the trigger.
 *
 * All three are real CSS now (`utilities/animations.css`), and the 13rem
 * travel is the value the dead classes named rather than a new one invented
 * at the fix.
 *
 * What to look at: open "Product", then move the pointer sideways to
 * "Merchants" WITHOUT closing. That cross-fade-and-slide is the interaction
 * the eight dead classes were for, and it is the one that reads as broken
 * when it snaps.
 */
const meta: Meta<typeof NavigationMenu> = {
    title: 'Marketing/NavigationMenu',
    component: NavigationMenu,
    parameters: { layout: 'fullscreen' },
}
export default meta
type Story = StoryObj<typeof NavigationMenu>

function Ink({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-[26rem] bg-[#0c0614] p-8">
            <div className="flex justify-center">{children}</div>
        </div>
    )
}

function Panel({
    items,
}: {
    items: { title: string; blurb: string }[]
}) {
    return (
        <ul className="grid w-[32rem] gap-1 p-3 md:grid-cols-2">
            {items.map((i) => (
                <li key={i.title}>
                    <NavigationMenuLink
                        href="#"
                        className="block rounded-lg p-3 text-left transition-colors hover:bg-white/[0.06]"
                    >
                        <span className="block text-sm font-medium text-white/90">
                            {i.title}
                        </span>
                        <span className="mt-0.5 block text-[13px] leading-relaxed text-white/50">
                            {i.blurb}
                        </span>
                    </NavigationMenuLink>
                </li>
            ))}
        </ul>
    )
}

export const Default: Story = {
    name: 'Default — two menus and a link',
    render: () => (
        <Ink>
            <NavigationMenu>
                <NavigationMenuList>
                    <NavigationMenuItem>
                        <NavigationMenuTrigger>Product</NavigationMenuTrigger>
                        <NavigationMenuContent>
                            <Panel
                                items={[
                                    { title: 'Bookings', blurb: 'Your whole book, one screen.' },
                                    { title: 'Payments', blurb: 'Deposits up front, payout on completion.' },
                                    { title: 'Messaging', blurb: 'Talk to a customer inside the booking.' },
                                    { title: 'Reviews', blurb: 'Both sides rate, both sides see it.' },
                                ]}
                            />
                        </NavigationMenuContent>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <NavigationMenuTrigger>Merchants</NavigationMenuTrigger>
                        <NavigationMenuContent>
                            <Panel
                                items={[
                                    { title: 'Mobile detailers', blurb: 'You go to them.' },
                                    { title: 'Shopfronts', blurb: 'They come to you.' },
                                    { title: 'Pricing', blurb: '15% and nothing up front.' },
                                    { title: 'Founding vendors', blurb: 'First five customers free.' },
                                ]}
                            />
                        </NavigationMenuContent>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <NavigationMenuLink
                            href="#"
                            className={navigationMenuTriggerStyle()}
                        >
                            Support
                        </NavigationMenuLink>
                    </NavigationMenuItem>
                </NavigationMenuList>
            </NavigationMenu>
        </Ink>
    ),
}

/**
 * The interaction AUTM-967 restored, isolated.
 *
 * Open the first menu, then move the pointer along the row without leaving
 * it. Radix marks the outgoing panel `data-motion="to-start"` and the
 * incoming one `data-motion="from-end"` (and the reverse going the other
 * way), which is what the 13rem horizontal travel keys off. Before this fix
 * the two panels swapped on one frame.
 */
export const MovingBetweenTriggers: Story = {
    name: 'AUTM-967 — moving between two open triggers',
    render: () => (
        <Ink>
            <NavigationMenu>
                <NavigationMenuList>
                    {['One', 'Two', 'Three'].map((label, i) => (
                        <NavigationMenuItem key={label}>
                            <NavigationMenuTrigger>{label}</NavigationMenuTrigger>
                            <NavigationMenuContent>
                                <Panel
                                    items={[
                                        { title: `${label} — first`, blurb: `Panel ${i + 1}, slot one.` },
                                        { title: `${label} — second`, blurb: `Panel ${i + 1}, slot two.` },
                                    ]}
                                />
                            </NavigationMenuContent>
                        </NavigationMenuItem>
                    ))}
                </NavigationMenuList>
            </NavigationMenu>
        </Ink>
    ),
}

/**
 * Edge — a single long panel, which is where the viewport's height animation
 * and its transform-origin actually show. `origin-top` rather than the
 * `origin-top-center` that was never a real class: the panel should grow
 * downward out of the trigger, not outward from its own middle.
 */
export const TallPanel: Story = {
    name: 'Edge — a tall panel resizing the viewport',
    render: () => (
        <Ink>
            <NavigationMenu>
                <NavigationMenuList>
                    <NavigationMenuItem>
                        <NavigationMenuTrigger>Short</NavigationMenuTrigger>
                        <NavigationMenuContent>
                            <Panel items={[{ title: 'One thing', blurb: 'That is all.' }]} />
                        </NavigationMenuContent>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <NavigationMenuTrigger>Tall</NavigationMenuTrigger>
                        <NavigationMenuContent>
                            <Panel
                                items={Array.from({ length: 8 }, (_, i) => ({
                                    title: `Row ${i + 1}`,
                                    blurb: 'The viewport animates its own height between the two.',
                                }))}
                            />
                        </NavigationMenuContent>
                    </NavigationMenuItem>
                </NavigationMenuList>
            </NavigationMenu>
        </Ink>
    ),
}
