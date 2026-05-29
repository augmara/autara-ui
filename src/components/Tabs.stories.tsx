import type { Meta, StoryObj } from '@storybook/react-vite'
import { Tabs, TabsList, TabsTrigger, TabsContent } from './Tabs'

/**
 * Tabs — Radix tab primitive styled for the cream canvas.
 *
 * - **Container** carries a hairline border on `--surface-elevated`.
 * - **Inactive trigger** uses muted ink; lifts to strong ink on hover.
 * - **Active trigger** pops to a solid `--surface` fill with strong
 *   ink and a hairline ring. No drop shadow — elevation comes from
 *   surface contrast, per the Autara house rule.
 *
 * Dark-surface companion deferred to a future PR.
 */
const meta: Meta<typeof Tabs> = {
    title: 'Molecules/Tabs',
    component: Tabs,
    parameters: { layout: 'padded' },
}
export default meta
type Story = StoryObj<typeof Tabs>

const Pane: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--surface)] p-5 text-sm leading-relaxed text-[var(--text-strong)]">
        {children}
    </div>
)

// ─── Default — 3 tabs with content panes ───────────────────────────
export const Default: Story = {
    render: () => (
        <div className="max-w-xl">
            <Tabs defaultValue="overview">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="services">Services</TabsTrigger>
                    <TabsTrigger value="reviews">Reviews</TabsTrigger>
                </TabsList>
                <TabsContent value="overview">
                    <Pane>
                        Premium hand-detail studio operating out of Surry
                        Hills. Booked solid through next weekend; openings
                        Tuesday onwards.
                    </Pane>
                </TabsContent>
                <TabsContent value="services">
                    <Pane>
                        Full interior + exterior package, ceramic top-up,
                        headlight restoration. Add-ons available at checkout.
                    </Pane>
                </TabsContent>
                <TabsContent value="reviews">
                    <Pane>
                        4.8 average across 312 customer reviews. Most recent:
                        “Sam was incredibly thorough — booked the same studio
                        for next month.”
                    </Pane>
                </TabsContent>
            </Tabs>
        </div>
    ),
}

// ─── Two-tab variant — common in dashboards ────────────────────────
export const TwoTabs: Story = {
    render: () => (
        <div className="max-w-md">
            <Tabs defaultValue="upcoming">
                <TabsList>
                    <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                    <TabsTrigger value="past">Past</TabsTrigger>
                </TabsList>
                <TabsContent value="upcoming">
                    <Pane>
                        3 bookings this week — next at 09:30 tomorrow with
                        Maya R.
                    </Pane>
                </TabsContent>
                <TabsContent value="past">
                    <Pane>
                        12 bookings completed in the past 30 days, 4.9 average
                        rating.
                    </Pane>
                </TabsContent>
            </Tabs>
        </div>
    ),
}

// ─── Disabled tab ──────────────────────────────────────────────────
export const WithDisabledTab: Story = {
    render: () => (
        <div className="max-w-xl">
            <Tabs defaultValue="now">
                <TabsList>
                    <TabsTrigger value="now">Available now</TabsTrigger>
                    <TabsTrigger value="later">Later today</TabsTrigger>
                    <TabsTrigger value="tomorrow" disabled>
                        Tomorrow
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="now">
                    <Pane>4 merchants accepting bookings within the hour.</Pane>
                </TabsContent>
                <TabsContent value="later">
                    <Pane>12 merchants have openings after 14:00.</Pane>
                </TabsContent>
                <TabsContent value="tomorrow">
                    <Pane>Disabled while you’re browsing today’s window.</Pane>
                </TabsContent>
            </Tabs>
        </div>
    ),
}

// ─── In context — Tabs inside a Card-like surface ──────────────────
export const InCardSurface: Story = {
    name: 'In context — inside a Card surface',
    render: () => (
        <div className="max-w-xl rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] p-6">
            <div className="mb-1 text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]">
                Merchant detail
            </div>
            <h3 className="mb-4 text-lg font-medium text-[var(--text-strong)]">
                Autobahn Auto Spa
            </h3>
            <Tabs defaultValue="overview">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="services">Services</TabsTrigger>
                    <TabsTrigger value="reviews">Reviews</TabsTrigger>
                </TabsList>
                <TabsContent value="overview">
                    <p className="text-sm leading-relaxed text-[var(--text-muted)]">
                        Mobile detail studio servicing inner-city Sydney
                        Monday through Saturday.
                    </p>
                </TabsContent>
                <TabsContent value="services">
                    <p className="text-sm leading-relaxed text-[var(--text-muted)]">
                        Exterior, interior, full package, ceramic top-up.
                    </p>
                </TabsContent>
                <TabsContent value="reviews">
                    <p className="text-sm leading-relaxed text-[var(--text-muted)]">
                        4.8 across 312 reviews.
                    </p>
                </TabsContent>
            </Tabs>
        </div>
    ),
}
