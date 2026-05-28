import type { Meta, StoryObj } from "@storybook/react-vite";
import { Input } from "./Input";

/**
 * Input — the autara-ui React component. For non-React surfaces (or
 * forms that don't need React state), use the `.field-input` utility
 * class directly.
 */
const meta = {
  title: "Atoms/Input",
  component: Input,
  parameters: { layout: "centered" },
  args: {
    placeholder: "name@example.com",
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

export const Disabled: Story = {
  args: { disabled: true, placeholder: "Disabled input" },
};

/**
 * The `.field-input` utility class — Autara's canonical text-field
 * treatment with the 4px brand-purple halo on focus. Used directly
 * (no React wrapper) in autara-merchant-mobile and autara-customer-web
 * form-heavy surfaces.
 */
export const FieldInputUtility: Story = {
  parameters: { layout: "padded" },
  render: () => (
    <div className="max-w-md space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-[var(--text-subtle)]">
          Default
        </span>
        <input className="field-input" placeholder="44px height" />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-[var(--text-subtle)]">
          Large
        </span>
        <input className="field-input field-input--lg" placeholder="48px height" />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-[var(--text-subtle)]">
          Invalid
        </span>
        <input
          className="field-input"
          aria-invalid="true"
          defaultValue="abc"
          placeholder="aria-invalid=true"
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-[var(--text-subtle)]">
          Disabled
        </span>
        <input className="field-input" disabled placeholder="Disabled state" />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-[var(--text-subtle)]">
          Textarea
        </span>
        <textarea
          className="field-textarea"
          placeholder="Multi-line — resize: vertical"
        />
      </label>
    </div>
  ),
};
