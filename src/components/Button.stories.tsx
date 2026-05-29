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
