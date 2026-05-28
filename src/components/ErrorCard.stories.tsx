import type { Meta, StoryObj } from "@storybook/react-vite";
import { ErrorCard } from "./ErrorCard";

const meta = {
  title: "Molecules/ErrorCard",
  component: ErrorCard,
  parameters: { layout: "padded" },
  args: {
    message: "Check your connection and tap retry.",
  },
} satisfies Meta<typeof ErrorCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="max-w-md">
      <ErrorCard {...args} />
    </div>
  ),
};

export const WithCustomTitle: Story = {
  args: {
    title: "Couldn't load your bookings",
    message: "Check your connection and tap retry.",
  },
  render: (args) => (
    <div className="max-w-md">
      <ErrorCard {...args} />
    </div>
  ),
};

export const WithRetry: Story = {
  args: {
    title: "Couldn't load your bookings",
    message: "Check your connection and tap retry.",
    onRetry: () => {},
  },
  render: (args) => (
    <div className="max-w-md">
      <ErrorCard {...args} />
    </div>
  ),
};

export const WithDetail: Story = {
  args: {
    title: "Couldn't load your bookings",
    message: "Check your connection and tap retry.",
    detail: "NetworkError: Failed to fetch (status 503)",
    onRetry: () => {},
  },
  render: (args) => (
    <div className="max-w-md">
      <ErrorCard {...args} />
    </div>
  ),
};

export const Warning: Story = {
  args: {
    tone: "warning",
    title: "Slow connection",
    message: "Your bookings are loading. This is taking longer than usual.",
  },
  render: (args) => (
    <div className="max-w-md">
      <ErrorCard {...args} />
    </div>
  ),
};

export const WithIcon: Story = {
  args: {
    title: "Couldn't load your bookings",
    message: "Check your connection and tap retry.",
    onRetry: () => {},
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4M12 16h.01" />
      </svg>
    ),
  },
  render: (args) => (
    <div className="max-w-md">
      <ErrorCard {...args} />
    </div>
  ),
};
