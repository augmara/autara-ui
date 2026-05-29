import type { Meta, StoryObj } from "@storybook/react-vite";
import { MetaChip } from "./MetaChip";

const meta = {
  title: "Molecules/MetaChip",
  component: MetaChip,
  parameters: { layout: "centered" },
  argTypes: {
    tone: {
      control: { type: "select" },
      options: ["neutral", "success", "brand", "muted"],
    },
    dot: { control: "boolean" },
  },
  args: { children: "Verified", tone: "neutral" },
} satisfies Meta<typeof MetaChip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Neutral: Story = {};
export const Success: Story = {
  args: { tone: "success", children: "Open today · 9–17" },
};
export const Brand: Story = {
  args: { tone: "brand", children: "Highly rated" },
};
export const Muted: Story = { args: { tone: "muted", children: "Closed" } };

export const WithDot: Story = {
  args: { tone: "success", dot: true, children: "Open now" },
};

/** All tones rendered together — the canonical chip vocabulary in the
 *  refreshed editorial weight (uppercase + tracked, brand-aligned ink). */
export const Vocabulary: Story = {
  parameters: { layout: "padded" },
  render: () => (
    <div className="flex max-w-md flex-wrap gap-1.5">
      <MetaChip tone="success" dot>
        Open today · 9–17
      </MetaChip>
      <MetaChip>4 services</MetaChip>
      <MetaChip tone="brand">Comes to you · 10 km</MetaChip>
      <MetaChip tone="brand">Highly rated</MetaChip>
      <MetaChip tone="muted" dot>
        Closed today
      </MetaChip>
      <MetaChip tone="success">Verified</MetaChip>
      <MetaChip tone="muted">15+ years</MetaChip>
    </div>
  ),
};
