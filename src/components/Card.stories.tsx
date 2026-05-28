import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "./Card";
import { Button } from "./Button";

const meta = {
  title: "Atoms/Card",
  component: Card,
  parameters: { layout: "padded" },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card className="max-w-sm">
      <CardHeader>
        <CardTitle>Booking confirmed</CardTitle>
        <CardDescription>
          See you Saturday at 10am. We'll send a reminder one hour before.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-[var(--text-muted)]">
          Cancel free up to 24 hours before your slot.
        </p>
      </CardContent>
      <CardFooter className="gap-2">
        <Button variant="outline" size="sm">
          Reschedule
        </Button>
        <Button size="sm">View booking</Button>
      </CardFooter>
    </Card>
  ),
};

/** Demonstrates the hairline-only hover signal (no shadow, no lift). */
export const HairlineHover: Story = {
  render: () => (
    <Card className="glass-card max-w-sm cursor-pointer">
      <CardHeader>
        <CardTitle>Detailing — Standard wash</CardTitle>
        <CardDescription>
          Hand wash, dry, tyre dressing, interior vacuum.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold tabular-nums text-[var(--text-strong)]">
          $80
        </p>
        <p className="text-xs text-[var(--text-muted)]">·  45 min</p>
      </CardContent>
    </Card>
  ),
};

/** Three async states side by side — the workspace's cross-stack rule. */
export const ThreeStates: Story = {
  parameters: { layout: "padded" },
  render: () => (
    <div className="grid max-w-3xl grid-cols-1 gap-4 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Success</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold tabular-nums text-[var(--text-strong)]">
            $1,240
          </p>
          <p className="text-xs text-[var(--text-muted)]">Earnings this week</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Loading</CardTitle>
        </CardHeader>
        <CardContent>
          <span
            aria-hidden="true"
            className="block h-7 w-20 animate-pulse rounded-md bg-[var(--surface-elevated)]"
          />
          <p className="mt-2 text-xs text-[var(--text-muted)]">
            Fetching your earnings…
          </p>
        </CardContent>
      </Card>

      <Card className="border-rose-200 bg-rose-50/40">
        <CardHeader>
          <CardTitle className="text-rose-900">Couldn't load</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-rose-800/80">
            We couldn't fetch your earnings — check your connection and retry.
          </p>
          <Button variant="outline" size="sm" className="mt-3">
            Retry
          </Button>
        </CardContent>
      </Card>
    </div>
  ),
};
