import type { Meta, StoryObj } from "@storybook/react-vite";
import { KpiCard } from "./KpiCard";

const meta = {
  title: "Merchant portal/KpiCard",
  component: KpiCard,
  parameters: { layout: "padded" },
  args: { label: "Bookings today", value: 12 },
} satisfies Meta<typeof KpiCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const StringValue: Story = {
  args: { label: "Earnings this week", value: "$1,240" },
};
export const Loading: Story = { args: { value: null, loading: true } };
export const WithTrend: Story = {
  args: {
    label: "Bookings this month",
    value: 47,
    trend: { value: "+12% vs last month", direction: "up" },
  },
};
export const TrendDown: Story = {
  args: {
    label: "Cancellation rate",
    value: "3.2%",
    trend: { value: "-0.4pp", direction: "down" },
  },
};
export const WithSublabel: Story = {
  args: {
    label: "This month",
    value: "$8,420",
    sublabel: "Through 30 May",
  },
};
export const WithIcon: Story = {
  args: {
    label: "Avg rating",
    value: "4.8",
    icon: (
      <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden>
        <path d="m12 17.27 6.18 3.73-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
      </svg>
    ),
  },
};

// ─── Tone variants — semantic role accents ───────────────────────────

/** Money-in role — lime-drive tick. Use for revenue, earnings,
 *  payouts received. */
export const ToneMoneyIn: Story = {
  args: {
    tone: "money-in",
    label: "Today's revenue",
    value: "$340",
    sublabel: "3 jobs",
  },
};

/** Money-out role — sky-aqua tick. Use for pending payouts,
 *  escrow, next payout. */
export const ToneMoneyOut: Story = {
  args: {
    tone: "money-out",
    label: "Pending payouts",
    value: "$262",
    sublabel: "Awaiting Stripe transfer",
  },
};

/** Needs-action role — warning-amber tick. Use for outstanding
 *  bookings, expiring requests, action queue depth. */
export const ToneNeedsAction: Story = {
  args: {
    tone: "needs-action",
    label: "Awaiting response",
    value: 4,
    sublabel: "2 expire today",
  },
};

/** Status-live role — success-green tick. Use for currently active /
 *  accepting / available. */
export const ToneStatusLive: Story = {
  args: {
    tone: "status-live",
    label: "Open now",
    value: "8h",
    sublabel: "Closes 17:00",
  },
};

/** Brand role — autara-purple tick. Use for non-financial KPIs
 *  (rating, count, status). Quietest tone. */
export const ToneBrand: Story = {
  args: {
    tone: "brand",
    label: "Avg rating",
    value: "4.8",
    sublabel: "12 reviews",
  },
};

// ─── In-context — merchant-mobile Today screen 4-up ──────────────────

/**
 * The merchant Today screen's KPI strip — money-in (Today, This month)
 * on the left, money-out (Pending payouts, Next payout) on the right.
 * Each tile carries a role-keyed hairline tick before the eyebrow so
 * the financial signal is glanceable without reading the label.
 *
 * "Next payout · Awaiting first booking" replaces the literal em-dash
 * empty value — the old version read as broken.
 */
export const TodayKpiStrip: Story = {
  render: () => (
    <div className="grid max-w-md grid-cols-2 gap-3">
      <KpiCard
        tone="money-in"
        label="Today's revenue"
        value="$340"
        sublabel="3 jobs"
      />
      <KpiCard
        tone="money-out"
        label="Pending payouts"
        value="$262"
        sublabel="Awaiting Stripe transfer"
      />
      <KpiCard
        tone="money-in"
        label="This month"
        value="$8,420"
        sublabel="Through 30 May"
      />
      <KpiCard
        tone="money-out"
        label="Next payout"
        value="—"
        sublabel="Awaiting first booking"
      />
    </div>
  ),
};

/** Canonical 4-up KPI strip on the Bookings tab — no tones,
 *  legacy default. */
export const BookingsKpiStrip: Story = {
  render: () => (
    <div className="grid max-w-md grid-cols-2 gap-3">
      <KpiCard label="Today" value="3" />
      <KpiCard label="This month" value="$8,420" />
      <KpiCard label="Pending" value="1" />
      <KpiCard label="Rating" value="4.8" />
    </div>
  ),
};

/** Loading state for the full strip — shape-matched. */
export const BookingsKpiStripLoading: Story = {
  render: () => (
    <div className="grid max-w-md grid-cols-2 gap-3">
      <KpiCard label="Today" loading />
      <KpiCard label="This month" loading />
      <KpiCard label="Pending" loading />
      <KpiCard label="Rating" loading />
    </div>
  ),
};
