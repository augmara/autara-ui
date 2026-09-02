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
import { Badge } from "./Badge";
import { GradientGround } from "./GlassSurface";

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

// ─── AUTM-948 (reworks AUTM-934) ───────────────────────────────────
/**
 * The default, side by side with the padded `light` variant consumers pin
 * today.
 *
 * `glass` is the default and it is the house material — translucent fill,
 * `backdrop-filter`, and the 1px inset top highlight. Neither variant carries
 * padding of its own except `light`, so `glass` composes with `CardHeader` /
 * `CardContent` / `CardFooter` (each of which brings its own `p-6`) instead of
 * double-padding them.
 *
 * AUTM-934 measured the OLD `glass` at 1.001:1 against the canvas and moved
 * the default to an opaque `surface`. The finding was right; under the Autara
 * Glass direction the remedy changed to a correct glass treatment. `surface`
 * survives as the opaque option for list rows.
 *
 * **This story is on a flat canvas on purpose** — it is the worst case for
 * glass, and the card still reads, because the edge and the highlight carry
 * it when there is no bloom behind. See `OnTheGradientGround` for the case it
 * was designed for.
 */
export const DefaultVsPadded: Story = {
  name: "Default (glass) vs light (padded)",
  render: () => (
    <div className="grid max-w-3xl gap-5 sm:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>glass — the default</CardTitle>
          <CardDescription>
            No padding of its own. Sub-parts own their spacing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--text-muted)]">
            Use this whenever you compose with CardHeader / CardContent.
          </p>
        </CardContent>
      </Card>
      <Card variant="light">
        <CardTitle>light — padded panel</CardTitle>
        <CardDescription className="mt-1.5">
          Carries p-7. Lay the content out yourself.
        </CardDescription>
      </Card>
    </div>
  ),
};

/**
 * Edge case — CardDescription on both surfaces. Until AUTM-934 this
 * text was a hardcoded `text-white/35`, which measured 1.02:1 on every
 * light surface: the secondary copy on every card in the library was
 * invisible, in both themes. It now uses `--text-muted`.
 *
 * Flip the Storybook theme toolbar to check both.
 */
export const DescriptionLegibility: Story = {
  name: "Edge — description on surface and elevated",
  render: () => (
    <div className="grid max-w-3xl gap-5 sm:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>On --surface</CardTitle>
          <CardDescription>
            Cancel free up to 24 hours before your slot. After that the
            deposit is retained by the detailer.
          </CardDescription>
        </CardHeader>
      </Card>
      <div className="rounded-autara-lg bg-[var(--surface-elevated)] p-1">
        <Card>
          <CardHeader>
            <CardTitle>Nested on --surface-elevated</CardTitle>
            <CardDescription>
              Cancel free up to 24 hours before your slot. After that the
              deposit is retained by the detailer.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  ),
};

/**
 * In context — the booking-summary panel shape that merchant-mobile and
 * customer-web both render, built only from Card sub-parts with no
 * variant passed anywhere.
 */
export const InContextBookingSummary: Story = {
  name: "In context — booking summary",
  render: () => (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Full interior and exterior detail</CardTitle>
        <CardDescription>
          Saturday 14 September, 10:00 with Northside Mobile Detailing.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-[var(--text-muted)]">Service</dt>
            <dd className="text-[var(--text-strong)]">$240.00</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[var(--text-muted)]">Deposit paid</dt>
            <dd className="text-[var(--text-strong)]">$48.00</dd>
          </div>
          <div className="flex justify-between gap-4 border-t border-[var(--border-subtle)] pt-2">
            <dt className="text-[var(--text-strong)]">Due on the day</dt>
            <dd className="text-[var(--text-strong)]">$192.00</dd>
          </div>
        </dl>
      </CardContent>
      <CardFooter className="gap-2">
        <Button variant="outline" size="sm">
          Reschedule
        </Button>
        <Button variant="dark" size="sm">
          View booking
        </Button>
      </CardFooter>
    </Card>
  ),
};

/**
 * Where the default is actually meant to live. Three glass Cards on the
 * gradient ground, in both themes at once so the pair can be judged without
 * the toolbar.
 *
 * Reviewing a glass surface on a white Storybook canvas is how the previous
 * `variant="glass"` shipped at 1.001:1 for months — nobody looked at it
 * anywhere it would have been obvious.
 */
export const OnTheGradientGround: Story = {
  name: "In context — on the gradient ground, both themes",
  parameters: { layout: "fullscreen" },
  render: () => (
    <div className="grid lg:grid-cols-2">
      {(["light", "dark"] as const).map((theme) => (
        <div key={theme} data-theme={theme}>
          <GradientGround className="min-h-[28rem] p-8">
            <p className="mb-4 text-[0.6875rem] font-medium uppercase tracking-[0.22em] text-[var(--text-subtle)]">
              {theme}
            </p>
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle>Full interior and exterior detail</CardTitle>
                    <Badge variant="flight">On the way</Badge>
                  </div>
                  <CardDescription>
                    Saturday 14 September, 10:00 with Northside Mobile
                    Detailing.
                  </CardDescription>
                </CardHeader>
                <CardFooter className="gap-2">
                  <Button variant="glass" size="sm">
                    Reschedule
                  </Button>
                  <Button size="sm">View booking</Button>
                </CardFooter>
              </Card>

              {/* A list row: glass-flat drops the backdrop-filter, which is
                  per-frame GPU work and invisible at row density anyway. */}
              <Card variant="glass-flat" className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[var(--text-strong)]">
                      Tom A. · Interior only
                    </p>
                    <p className="truncate text-xs text-[var(--text-muted)]">
                      12:30 · Hilux
                    </p>
                  </div>
                  <Badge variant="money">Paid</Badge>
                </div>
              </Card>

              <Card variant="surface" className="p-4">
                <p className="text-sm text-[var(--text-muted)]">
                  <code>variant=&quot;surface&quot;</code> — the opaque twin.
                  No GPU cost, and what glass collapses to under{" "}
                  <code>prefers-reduced-transparency</code>.
                </p>
              </Card>
            </div>
          </GradientGround>
        </div>
      ))}
    </div>
  ),
};
