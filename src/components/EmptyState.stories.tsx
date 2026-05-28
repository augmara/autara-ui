import type { Meta, StoryObj } from "@storybook/react-vite";
import { EmptyState } from "./EmptyState";
import { BrandButton } from "./BrandButton";

const meta = {
  title: "Molecules/EmptyState",
  component: EmptyState,
  parameters: { layout: "padded" },
  args: {
    title: "No bookings yet",
    description:
      "New requests from customers will appear here. We'll send you a push notification when one comes in.",
  },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

const CalendarIcon = (
  <svg
    viewBox="0 0 24 24"
    width="20"
    height="20"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="3" y="5" width="18" height="16" rx="2.5" />
    <path d="M8 3v4M16 3v4M3 10h18" />
  </svg>
);

export const NoBookings: Story = {
  render: () => (
    <div className="max-w-md">
      <EmptyState
        icon={CalendarIcon}
        title="No bookings yet"
        description="New requests from customers will appear here. We'll send you a push notification the moment one comes in."
      />
    </div>
  ),
};

export const WithAction: Story = {
  render: () => (
    <div className="max-w-md">
      <EmptyState
        icon={CalendarIcon}
        title="Nothing on the calendar"
        description="Add your first service so customers can start booking."
        action={<BrandButton>Add a service</BrandButton>}
      />
    </div>
  ),
};

export const NoIcon: Story = {
  render: () => (
    <div className="max-w-md">
      <EmptyState
        title="No results"
        description="Try a different search term or broaden your filters."
      />
    </div>
  ),
};

export const Minimal: Story = {
  render: () => (
    <div className="max-w-md">
      <EmptyState title="No services yet" />
    </div>
  ),
};
