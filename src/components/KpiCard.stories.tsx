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

/** Canonical 4-up KPI strip on the Bookings tab. */
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
