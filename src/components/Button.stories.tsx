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

// ─── AUTM-915 ──────────────────────────────────────────────────────
/**
 * The regression this size change exists for.
 *
 * Both columns are 183px wide — the content box measured on merchant-web
 * `/onboarding/complete` at a 375px viewport. The left column simulates
 * 200% text scale by setting the root font size on the container.
 *
 * Before AUTM-915, `whitespace-nowrap` in BASE plus a fixed `h-11` meant
 * "Go to your dashboard" rendered 372px wide inside that 183px box, with
 * roughly half the label off screen. It now wraps and the box grows.
 *
 * Every consumer inherited that defect, and merchant-web had already
 * shipped an `h-auto min-h-11 whitespace-normal py-1` override at each
 * call site. Needing an override everywhere is the usual sign the default
 * is wrong, so the fix moved into the primitive.
 */
export const LongLabelAtTextScale: Story = {
  name: "Edge — long label at 200% text scale",
  parameters: { layout: "padded" },
  render: () => (
    <div className="flex flex-wrap gap-10">
      {[
        { label: "200% text scale (32px root)", size: "32px" },
        { label: "Normal (16px root)", size: "16px" },
      ].map((col) => (
        <div key={col.label}>
          <p className="mb-3 text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]">
            {col.label}
          </p>
          <div
            style={{ fontSize: col.size, width: "183px" }}
            className="space-y-3 rounded-autara-lg border border-dashed border-[var(--border-strong)] p-2"
          >
            <Button variant="dark" fullWidth>
              Go to your dashboard
            </Button>
            <Button variant="outline" fullWidth size="sm">
              Contact Autara Support
            </Button>
            <Button variant="primary" fullWidth size="lg">
              Confirm and pay the deposit
            </Button>
          </div>
        </div>
      ))}
    </div>
  ),
};

/**
 * Heights are unchanged at normal text scale — that is the constraint the
 * fix had to hold. `min-h-*` renders identically to the old `h-*` for a
 * single line: sm 36px, md 44px, lg 48px, icon 40x40.
 */
export const HeightParity: Story = {
  name: "Sizes — unchanged at normal scale",
  parameters: { layout: "padded" },
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button size="sm">Small, 36</Button>
      <Button size="md">Medium, 44</Button>
      <Button size="lg">Large, 48</Button>
      <Button size="icon" aria-label="Add a service">
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.4}
          strokeLinecap="round"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
      </Button>
    </div>
  ),
};

/**
 * Opt back into a single line where you genuinely want one — a short label
 * in a fixed-width toolbar. `className` wins through tailwind-merge, so no
 * new prop was needed.
 */
export const OptInNowrap: Story = {
  name: "Edge — opting back into nowrap",
  parameters: { layout: "padded" },
  render: () => (
    <div className="flex w-40 gap-2 rounded-autara-lg border border-dashed border-[var(--border-strong)] p-2">
      <Button size="sm" variant="outline" className="whitespace-nowrap">
        Filters
      </Button>
      <Button size="sm" variant="dark" className="whitespace-nowrap">
        Sort
      </Button>
    </div>
  ),
};

/**
 * AUTM-955 — the reported bug, as a story you can look at.
 *
 * Don's screenshot: a search field and "New booking" side by side, the
 * button wrapped to two lines and standing visibly taller than the field
 * next to it, on a wide screen with room to spare.
 *
 * The first row is the layout that broke. The second is the same row at a
 * width that genuinely cannot fit the phrase — the label SHOULD wrap there,
 * and the button SHOULD grow; that is AUTM-915 working, not a regression.
 * Both behaviours come from one declaration, so check both when touching it.
 */
export const BesideAField = {
    render: () => (
        <div className="flex flex-col gap-8">
            <div>
                <p className="mb-2 text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                    Room to spare — one line, same height as the field
                </p>
                <div className="flex items-center gap-3">
                    <input
                        className="field-input min-h-11 flex-1"
                        placeholder="Find a booking"
                        aria-label="Find a booking"
                    />
                    <Button>New booking</Button>
                </div>
            </div>
            <div>
                <p className="mb-2 text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                    Genuinely too narrow — wraps and grows, rather than overflowing
                </p>
                <div className="flex w-[230px] items-center gap-3">
                    <input
                        className="field-input min-h-11 min-w-0 flex-1"
                        placeholder="Find"
                        aria-label="Find"
                    />
                    <Button>New booking</Button>
                </div>
            </div>
        </div>
    ),
}
