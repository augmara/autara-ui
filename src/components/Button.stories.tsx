import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "./Button";
import { GradientGround } from "./GlassSurface";
import { Input } from "./Input";
import { Badge } from "./Badge";
import { MetaChip } from "./MetaChip";
import { Avatar, AvatarFallback } from "./Avatar";

/**
 * Button — the single canonical Autara CTA primitive. Merges what used
 * to be split as `Button` + `BrandButton` into one component.
 *
 * Variants:
 *   - `primary`     brand purple (on dark/photo surfaces)
 *   - `dark`        solid black (PRIMARY action on cream — the most-used)
 *   - `outline`     hairline border on white
 *   - `secondary`   surface-elevated fill
 *   - `ghost`       transparent, hover bg
 *   - `destructive` rose (cancel / delete)
 *   - `link`        underline text only
 *   - `glass`       translucent — a secondary action ON the gradient ground
 *                   or on a glass panel (AUTM-948)
 *
 * Sizes: `sm` (36) → `md`/`default` (44) → `lg` (48) → `icon` (40²).
 *
 * Polymorphic via `asChild` (Radix Slot). Compose with your framework's
 * Link by wrapping a single anchor child.
 */
const meta = {
  title: "Atoms/Button",
  component: Button,
  parameters: { layout: "centered" },
  argTypes: {
    variant: {
      control: { type: "select" },
      options: [
        "primary",
        "dark",
        "outline",
        "secondary",
        "ghost",
        "destructive",
        "link",
        "acid",
      ],
    },
    size: {
      control: { type: "select" },
      options: ["sm", "md", "lg", "icon"],
    },
    disabled: { control: "boolean" },
    fullWidth: { control: "boolean" },
  },
  args: {
    children: "Book now",
    variant: "primary",
    size: "md",
    disabled: false,
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Dark: Story = {
  args: { variant: "dark", children: "Continue" },
};

export const Outline: Story = { args: { variant: "outline" } };
export const Secondary: Story = { args: { variant: "secondary" } };
export const Ghost: Story = { args: { variant: "ghost", children: "Skip" } };
export const Destructive: Story = {
  args: { variant: "destructive", children: "Cancel booking" },
};
export const Link: Story = { args: { variant: "link", children: "View terms" } };

export const Acid: Story = {
  name: "Acid — high-pop CTA on cream",
  args: { variant: "acid", children: "Try it free" },
};

export const Small: Story = { args: { size: "sm" } };
export const Large: Story = { args: { size: "lg", children: "Get started" } };

export const FullWidth: Story = {
  parameters: { layout: "padded" },
  args: { fullWidth: true, variant: "dark" },
  render: (args) => (
    <div className="max-w-sm">
      <Button {...args} />
    </div>
  ),
};

export const WithLeadingIcon: Story = {
  args: {
    leadingIcon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M15 18l-6-6 6-6" />
      </svg>
    ),
    children: "Back",
    variant: "outline",
  },
};

export const WithTrailingIcon: Story = {
  args: {
    trailingIcon: (
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M9 18l6-6-6-6" />
      </svg>
    ),
    children: "Continue",
    variant: "dark",
  },
};

export const Disabled: Story = { args: { disabled: true } };

export const AsAnchor: Story = {
  args: { asChild: true, variant: "dark" },
  render: (args) => (
    <Button {...args}>
      <a href="#example">Open as anchor</a>
    </Button>
  ),
};

/**
 * Full variant × size matrix — every variant × every size, rendered as a
 * grid so visual regressions are obvious. Light-surface aware (cream
 * background) — all variants are visible.
 */
export const Matrix: Story = {
  parameters: { layout: "padded" },
  render: () => (
    <div className="space-y-5">
      {(
        [
          "primary",
          "dark",
          "outline",
          "secondary",
          "ghost",
          "destructive",
          "link",
          "acid",
        ] as const
      ).map((variant) => (
        <div key={variant} className="flex items-center gap-3">
          <div className="w-24 text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
            {variant}
          </div>
          <Button variant={variant} size="sm">
            Small
          </Button>
          <Button variant={variant} size="md">
            Default
          </Button>
          <Button variant={variant} size="lg">
            Large
          </Button>
        </div>
      ))}
    </div>
  ),
};

// ─── AUTM-948 ──────────────────────────────────────────────────────
/**
 * `variant="glass"` — the outline button's translucent twin.
 *
 * `outline` paints an OPAQUE `--surface` fill. On a glass panel or over the
 * gradient ground that punches a white slab through the material, which is
 * the same failure mode `ErrorCard`'s white retry button had in dark mode
 * (AUTM-936). The middle button in each pane below is the problem; the right
 * one is the fix.
 *
 * **Buttons keep normal geometry.** Rule 1 puts the skew on pills and status
 * ONLY — a revision that skewed buttons and cut their corners was rejected by
 * Don on 2026-09-01. The pill radius stands.
 *
 * It does not blur. A button is small and there are usually several per
 * screen, and each blurring element is its own GPU surface; the panel
 * underneath supplies the blur.
 */
export const GlassOnGround: Story = {
  name: "Glass — on the gradient ground, both themes",
  parameters: { layout: "fullscreen" },
  render: () => (
    <div className="grid sm:grid-cols-2">
      {(["light", "dark"] as const).map((theme) => (
        <div key={theme} data-theme={theme}>
          <GradientGround className="min-h-[16rem] p-8">
            <p className="mb-4 text-[0.6875rem] font-medium uppercase tracking-[0.22em] text-[var(--text-subtle)]">
              {theme}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button>Accept booking</Button>
              <Button variant="outline">outline (opaque slab)</Button>
              <Button variant="glass">glass</Button>
            </div>
            <div className="glass-surface mt-5 flex flex-wrap items-center gap-3 p-5">
              <Button size="sm">Accept</Button>
              <Button variant="glass" size="sm">
                Decline
              </Button>
              <Button variant="ghost" size="sm">
                Message
              </Button>
            </div>
          </GradientGround>
        </div>
      ))}
    </div>
  ),
};

// ─── The shape language (Don, 2026-09-01) ──────────────────────────
/**
 * **Buttons are not pills. They take the input's radius.**
 *
 * A button and the field beside it are ONE control group — type, then act. A
 * pill next to a rounded rectangle reads as two unrelated objects that happen
 * to be adjacent. Matching the radius makes them read as a pair. The top row
 * is what shipped before this; the second row is the rule.
 *
 * This reverses the 2026-08-16 call that made buttons fully round. The
 * complaint then was that buttons "read square" — the answer was never a
 * pill, it was the input's own radius.
 *
 * **What the change buys.** The shape language collapses from three families
 * to two, which is what makes it enforceable:
 *
 * | Family | Radius | Means |
 * |---|---|---|
 * | Shared | `--radius-autara-md` **14px** (cards 16, chips 8) | a surface or a control |
 * | Rounded parallelogram | skew + radius | status, and only status |
 *
 * And the third row below is the payoff: with buttons off `rounded-full`, the
 * only fully-round things left are **avatars and indicator dots**, so round
 * now means "a person or a state light" and never "an action". That meaning
 * is a finite resource — `shape-language.test.ts` makes spending it a
 * deliberate act with a name attached.
 *
 * Note `lg` steps up to 16px: `.field-input--lg` is 48px at 16px, and the
 * 48px button beside it has to match. Same-height elements, same radius.
 */
export const PairedRadius: Story = {
  name: "Shape language — the button pairs with the input",
  parameters: { layout: "fullscreen" },
  render: () => (
    <GradientGround className="min-h-[26rem] p-8">
      <p className="mb-2 text-[0.6875rem] font-medium uppercase tracking-[0.22em] text-[var(--text-subtle)]">
        Before — pill beside a rounded rectangle
      </p>
      <div className="mb-6 flex items-center gap-2">
        <Input
          surface="glass"
          placeholder="Find a booking"
          aria-label="Find a booking (before)"
          className="w-56"
        />
        <button
          type="button"
          className="h-11 whitespace-nowrap rounded-full bg-[var(--act-fill)] px-5 text-sm font-medium text-[var(--on-act)]"
        >
          New booking
        </button>
      </div>

      <p className="mb-2 text-[0.6875rem] font-medium uppercase tracking-[0.22em] text-[var(--text-subtle)]">
        After — one control group
      </p>
      <div className="mb-6 flex items-center gap-2">
        <Input
          surface="glass"
          placeholder="Find a booking"
          aria-label="Find a booking (after)"
          className="w-56"
        />
        <Button data-testid="story-paired-radius-submit">New booking</Button>
      </div>

      <p className="mb-2 text-[0.6875rem] font-medium uppercase tracking-[0.22em] text-[var(--text-subtle)]">
        48px rung — lg button pairs with the lg field
      </p>
      <div className="mb-6 flex items-center gap-2">
        <Input
          size="lg"
          surface="glass"
          placeholder="Business name"
          aria-label="Business name"
          className="w-56"
        />
        <Button size="lg">Continue</Button>
      </div>

      <p className="mb-2 text-[0.6875rem] font-medium uppercase tracking-[0.22em] text-[var(--text-subtle)]">
        What round still means
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarFallback>PN</AvatarFallback>
        </Avatar>
        <MetaChip tone="flight" dot>
          On the way
        </MetaChip>
        <Badge variant="money">Paid</Badge>
        <span className="text-sm text-[var(--text-muted)]">
          a person · a state light · a status marker
        </span>
      </div>
    </GradientGround>
  ),
};
