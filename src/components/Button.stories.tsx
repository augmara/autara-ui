import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "./Button";

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
          <div className="w-24 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
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
