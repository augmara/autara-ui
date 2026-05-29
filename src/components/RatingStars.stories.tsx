import type { Meta, StoryObj } from "@storybook/react-vite";
import { RatingStars } from "./RatingStars";

const meta = {
  title: "Marketplace/RatingStars",
  component: RatingStars,
  parameters: { layout: "centered" },
  argTypes: {
    rating: { control: { type: "range", min: 0, max: 5, step: 0.1 } },
    size: { control: { type: "select" }, options: ["sm", "md", "lg"] },
    showHalf: { control: "boolean" },
  },
  args: { rating: 4.5, size: "md" },
} satisfies Meta<typeof RatingStars>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const FullFive: Story = { args: { rating: 5 } };
export const Zero: Story = { args: { rating: 0 } };
export const HalfStar: Story = { args: { rating: 3.5 } };
export const NoHalf: Story = {
  args: { rating: 3.5, showHalf: false },
};

/** Size ladder. */
export const Sizes: Story = {
  parameters: { layout: "padded" },
  render: () => (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="w-12 text-xs uppercase tracking-wider text-[var(--text-muted)]">
          sm
        </span>
        <RatingStars rating={4.5} size="sm" />
      </div>
      <div className="flex items-center gap-3">
        <span className="w-12 text-xs uppercase tracking-wider text-[var(--text-muted)]">
          md
        </span>
        <RatingStars rating={4.5} size="md" />
      </div>
      <div className="flex items-center gap-3">
        <span className="w-12 text-xs uppercase tracking-wider text-[var(--text-muted)]">
          lg
        </span>
        <RatingStars rating={4.5} size="lg" />
      </div>
    </div>
  ),
};

/** Composed with the merchant-card pattern. */
export const InContext: Story = {
  parameters: { layout: "padded" },
  render: () => (
    <div className="max-w-sm rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] p-5">
      <h3 className="text-base font-bold text-[var(--text-strong)]">
        Sydney Detailing Co.
      </h3>
      <div className="mt-2 flex items-center gap-2 text-sm">
        <RatingStars rating={4.7} size="md" />
        <span className="font-semibold tabular-nums text-[var(--text-strong)]">
          4.7
        </span>
        <span className="text-[var(--text-muted)]">·  127 reviews</span>
      </div>
    </div>
  ),
};
