import type { Meta, StoryObj } from "@storybook/react-vite";
import { AsyncSkeleton } from "./AsyncSkeleton";

const meta = {
  title: "Molecules/AsyncSkeleton",
  component: AsyncSkeleton,
  parameters: { layout: "padded" },
} satisfies Meta<typeof AsyncSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const List: Story = {
  render: () => (
    <div className="max-w-md">
      <AsyncSkeleton variant="list" count={3} />
    </div>
  ),
};

export const ListShort: Story = {
  render: () => (
    <div className="max-w-md">
      <AsyncSkeleton variant="list" count={5} rowHeight="h-14" />
    </div>
  ),
};

export const Card: Story = {
  render: () => (
    <div className="max-w-md">
      <AsyncSkeleton variant="card" rowHeight="h-48" />
    </div>
  ),
};

export const Row: Story = {
  render: () => (
    <div className="max-w-md">
      <AsyncSkeleton variant="row" count={4} />
    </div>
  ),
};

export const Text: Story = {
  render: () => (
    <div className="max-w-md">
      <AsyncSkeleton variant="text" count={4} />
    </div>
  ),
};

/** All variants stacked — visual reference. */
export const Gallery: Story = {
  render: () => (
    <div className="grid max-w-3xl gap-6 lg:grid-cols-2">
      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          list (default)
        </p>
        <AsyncSkeleton variant="list" />
      </div>
      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          card
        </p>
        <AsyncSkeleton variant="card" />
      </div>
      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          row
        </p>
        <AsyncSkeleton variant="row" count={4} />
      </div>
      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          text
        </p>
        <AsyncSkeleton variant="text" count={3} />
      </div>
    </div>
  ),
};
