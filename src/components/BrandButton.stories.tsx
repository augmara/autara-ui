import type { Meta, StoryObj } from "@storybook/react-vite";
import { BrandButton } from "./BrandButton";

/**
 * BrandButton — Autara's opinionated CTA primitive. Promoted from
 * autara-customer-web in v1.1.0. Primary fill is brand purple; hover
 * lifts via translate (not shadow). Polymorphic via `asChild`.
 */
const meta = {
  title: "Atoms/BrandButton",
  component: BrandButton,
  parameters: { layout: "centered" },
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["primary", "outline", "ghost", "secondary", "destructive"],
    },
    size: { control: { type: "select" }, options: ["sm", "md", "lg"] },
    fullWidth: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  args: {
    children: "Book now",
    variant: "primary",
    size: "md",
  },
} satisfies Meta<typeof BrandButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Outline: Story = { args: { variant: "outline" } };

export const Ghost: Story = { args: { variant: "ghost", children: "Skip" } };

export const Secondary: Story = { args: { variant: "secondary" } };

export const Destructive: Story = {
  args: { variant: "destructive", children: "Cancel booking" },
};

export const Small: Story = { args: { size: "sm" } };
export const Large: Story = { args: { size: "lg", children: "Get started" } };

export const FullWidth: Story = {
  parameters: { layout: "padded" },
  args: { fullWidth: true },
  render: (args) => (
    <div className="max-w-sm">
      <BrandButton {...args} />
    </div>
  ),
};

export const WithIcons: Story = {
  args: {
    leadingIcon: (
      <svg
        viewBox="0 0 24 24"
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M15 18l-6-6 6-6" />
      </svg>
    ),
    children: "Back",
  },
};

export const TrailingIcon: Story = {
  args: {
    trailingIcon: (
      <svg
        viewBox="0 0 24 24"
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9 18l6-6-6-6" />
      </svg>
    ),
    children: "Continue",
  },
};

export const Disabled: Story = { args: { disabled: true } };

/**
 * Polymorphic — wrap your framework's Link via `asChild`. autara-ui
 * never imports next/link or react-router-dom; the consumer composes.
 */
export const AsAnchor: Story = {
  args: { asChild: true },
  render: (args) => (
    <BrandButton {...args}>
      <a href="#example">Open as anchor</a>
    </BrandButton>
  ),
};

/** Full variant × size matrix. */
export const Matrix: Story = {
  parameters: { layout: "padded" },
  render: () => (
    <div className="space-y-4">
      {(
        ["primary", "outline", "ghost", "secondary", "destructive"] as const
      ).map((variant) => (
        <div key={variant} className="flex items-center gap-3">
          <div className="w-24 text-xs uppercase tracking-wider text-[var(--text-muted)]">
            {variant}
          </div>
          <BrandButton variant={variant} size="sm">
            Small
          </BrandButton>
          <BrandButton variant={variant} size="md">
            Default
          </BrandButton>
          <BrandButton variant={variant} size="lg">
            Large
          </BrandButton>
        </div>
      ))}
    </div>
  ),
};
