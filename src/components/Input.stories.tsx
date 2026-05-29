import type { Meta, StoryObj } from "@storybook/react-vite";
import { Input } from "./Input";

/**
 * Input — Autara's canonical text input. Wraps the `.field-input`
 * utility class so React consumers get the same look as plain HTML
 * `<input className="field-input">` usage in customer-web /
 * merchant-mobile form-heavy surfaces.
 *
 * Visual rules:
 *   - 44 × full-width pill on cream surface (`size="md"`, default).
 *   - 48 × full-width on hero / onboarding panels (`size="lg"`).
 *   - 4px brand-purple halo on focus.
 *   - Red border + red halo when `aria-invalid="true"`.
 *   - Disabled fills with `--surface-warm` and dims text.
 */
const meta = {
  title: "Atoms/Input",
  component: Input,
  parameters: { layout: "centered" },
  argTypes: {
    size: { control: { type: "select" }, options: ["md", "lg"] },
    disabled: { control: "boolean" },
  },
  args: {
    placeholder: "name@example.com",
    size: "md",
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Email: Story = {
  args: { type: "email", placeholder: "name@example.com" },
};

export const Phone: Story = {
  args: { type: "tel", placeholder: "+61 4XX XXX XXX" },
};

export const Filled: Story = {
  args: { defaultValue: "Don Vish", placeholder: "Full name" },
};

export const Large: Story = {
  name: "Large — 48 high (hero/onboarding panels)",
  args: { size: "lg" },
};

export const Invalid: Story = {
  name: "Invalid — aria-invalid=true",
  args: {
    "aria-invalid": "true",
    defaultValue: "not-an-email",
  },
};

export const Disabled: Story = {
  args: { disabled: true, placeholder: "Disabled input" },
};

// ─── State matrix — all 4 states on one canvas ─────────────────────
export const StateMatrix: Story = {
  name: "State matrix — default / focus-hint / invalid / disabled",
  parameters: { layout: "padded" },
  render: () => (
    <div className="max-w-md space-y-4">
      {[
        { eyebrow: "Default", props: { placeholder: "44 px height" } },
        {
          eyebrow: "Filled",
          props: { defaultValue: "Don Vish", placeholder: "Full name" },
        },
        {
          eyebrow: "Invalid — aria-invalid=true",
          props: {
            "aria-invalid": "true" as const,
            defaultValue: "abc",
            placeholder: "Email",
          },
        },
        {
          eyebrow: "Disabled",
          props: { disabled: true, placeholder: "Disabled state" },
        },
      ].map((row) => (
        <label key={row.eyebrow} className="block">
          <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]">
            {row.eyebrow}
          </span>
          <Input {...row.props} />
        </label>
      ))}
    </div>
  ),
};

// ─── Size pair — md × lg ───────────────────────────────────────────
export const SizePair: Story = {
  name: "Size pair — md × lg",
  parameters: { layout: "padded" },
  render: () => (
    <div className="max-w-md space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]">
          md — 44 px (default)
        </span>
        <Input placeholder="name@example.com" />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]">
          lg — 48 px (hero / onboarding panels)
        </span>
        <Input size="lg" placeholder="name@example.com" />
      </label>
    </div>
  ),
};

// ─── In context — onboarding form ──────────────────────────────────
export const InOnboardingForm: Story = {
  name: "In context — onboarding form",
  parameters: { layout: "padded" },
  render: () => (
    <form className="max-w-md space-y-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] p-6">
      <div>
        <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]">
          Step 1 of 5
        </div>
        <h3 className="mt-1 text-lg font-medium leading-tight text-[var(--text-strong)]">
          Tell us about your business
        </h3>
      </div>
      <label className="grid gap-1.5">
        <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]">
          Business name
        </span>
        <Input placeholder="Sam's Mobile Detail" autoComplete="organization" />
      </label>
      <label className="grid gap-1.5">
        <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]">
          ABN
        </span>
        <Input
          inputMode="numeric"
          placeholder="11-digit ABN"
          aria-invalid="true"
          defaultValue="123"
        />
        <span className="text-xs text-[var(--color-autara-error)]">
          ABN must be 11 digits.
        </span>
      </label>
      <label className="grid gap-1.5">
        <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]">
          Email
        </span>
        <Input type="email" placeholder="sam@example.com" autoComplete="email" />
      </label>
    </form>
  ),
};
