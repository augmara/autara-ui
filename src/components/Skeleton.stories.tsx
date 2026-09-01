import type { Meta, StoryObj } from "@storybook/react-vite";
import { Skeleton } from "./Skeleton";

/**
 * Skeleton — the primitive loading block.
 *
 * Reach for `AsyncSkeleton` when you want a ready-made list / card /
 * text arrangement. Reach for `Skeleton` when you are hand-composing a
 * layout and just need the block.
 *
 * AUTM-934: the fill was `bg-white/[0.06]`, which measures 1.003:1
 * against the warm-cream canvas — the placeholder did not render, so a
 * loading list was indistinguishable from an empty list. That is the
 * worst failure a loading state has available to it: the user concludes
 * there is nothing there and leaves before the data arrives.
 */
const meta = {
  title: "Atoms/Skeleton",
  component: Skeleton,
  parameters: { layout: "padded" },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <Skeleton className="h-11 w-64" label="Loading your bookings" />,
};

/**
 * Sizes are className-driven — the component brings the fill, the pulse
 * and the radius, you bring the shape.
 */
export const Shapes: Story = {
  render: () => (
    <div className="flex max-w-lg flex-col gap-4">
      <Skeleton className="h-8 w-40" label="Loading heading" />
      <Skeleton className="h-4 w-full" label={null} />
      <Skeleton className="h-4 w-4/5" label={null} />
      <Skeleton className="h-24 w-full rounded-autara-lg" label={null} />
      <Skeleton className="h-12 w-12 rounded-full" label={null} />
    </div>
  ),
};

/**
 * Edge case — a decorative block. Pass `label={null}` when an ancestor
 * already announces the loading region, otherwise a skeleton grid
 * announces "Loading" once per block and floods the screen reader.
 */
export const Silent: Story = {
  name: "Edge — decorative (label={null})",
  render: () => (
    <div role="status" aria-live="polite" className="max-w-lg">
      <span className="sr-only">Loading your service list</span>
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-20" label={null} />
        ))}
      </div>
    </div>
  ),
};

/**
 * In context — a service row mid-load, shape-matched to the row that
 * replaces it. Shape-matching is the whole point: the layout must not
 * jump when the data lands.
 */
export const InContextServiceRow: Story = {
  name: "In context — service list loading",
  render: () => (
    <div
      role="status"
      aria-live="polite"
      className="max-w-md divide-y divide-[var(--border-subtle)] rounded-autara-lg border border-[var(--border-subtle)] bg-[var(--surface)]"
    >
      <span className="sr-only">Fetching your services</span>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-4">
          <Skeleton className="h-12 w-12 shrink-0 rounded-autara" label={null} />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3" label={null} />
            <Skeleton className="h-3 w-1/3" label={null} />
          </div>
          <Skeleton className="h-4 w-14 shrink-0" label={null} />
        </div>
      ))}
    </div>
  ),
};
