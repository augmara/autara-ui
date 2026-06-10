import type { Meta, StoryObj } from "@storybook/react-vite";
import { FieldStack, FieldStackRow, FieldStackField } from "./FieldStack";
import { Button } from "./Button";

/**
 * FieldStack — the unified field-group grammar (AUT-683). One hairline
 * container, internal hairline dividers; the stack IS the card. Built
 * for marketing / conversion forms (waitlist, lead capture).
 *
 * Visual rules:
 *   - Uppercase eyebrow micro-label + borderless input per cell.
 *   - Focus: warm-cream cell tint + 3px inset brand-purple bar — this
 *     grammar's stand-in for the 4px halo (which would clip against
 *     the container's `overflow: hidden`).
 *   - Invalid (`error` prop / `aria-invalid`): bar + tint go error red.
 *   - Never nest a FieldStack inside another bordered panel.
 */
const meta = {
  title: "Atoms/FieldStack",
  component: FieldStack,
  parameters: { layout: "padded" },
} satisfies Meta<typeof FieldStack>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "Default — waitlist shape",
  render: () => (
    <div className="max-w-md">
      <FieldStack>
        <FieldStackRow>
          <FieldStackField
            label="First name"
            name="firstName"
            autoComplete="given-name"
            placeholder="Jess"
            required
          />
          <FieldStackField
            label="Last name"
            name="lastName"
            autoComplete="family-name"
            placeholder="Walker"
            required
          />
        </FieldStackRow>
        <FieldStackField
          label="Email address"
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          placeholder="jess@example.com"
          required
        />
        <FieldStackRow>
          <FieldStackField
            label="Phone · optional"
            type="tel"
            name="phone"
            autoComplete="tel"
            inputMode="tel"
            placeholder="04XX XXX XXX"
          />
          <FieldStackField
            label="Suburb / city"
            name="suburb"
            autoComplete="address-level2"
            placeholder="Melbourne"
          />
        </FieldStackRow>
      </FieldStack>
    </div>
  ),
};

export const SingleColumn: Story = {
  name: "Single column",
  render: () => (
    <div className="max-w-md">
      <FieldStack>
        <FieldStackField
          label="Business name"
          name="businessName"
          autoComplete="organization"
          placeholder="Sam's Mobile Detail"
        />
        <FieldStackField
          label="Email address"
          type="email"
          name="email"
          placeholder="sam@example.com"
        />
      </FieldStack>
    </div>
  ),
};

export const Invalid: Story = {
  name: "Invalid — error prop + long values",
  render: () => (
    <div className="max-w-md">
      <FieldStack>
        <FieldStackRow>
          <FieldStackField
            label="First name"
            name="firstName"
            defaultValue="Alexandrina-Wilhelmina"
          />
          <FieldStackField label="Last name" name="lastName" placeholder="Walker" />
        </FieldStackRow>
        <FieldStackField
          label="Email address"
          type="email"
          name="email"
          defaultValue="not-an-email"
          error="Enter a valid email address — e.g. jess@example.com."
        />
      </FieldStack>
    </div>
  ),
};

export const WithCustomControl: Story = {
  name: "Custom control — native select cell",
  render: () => (
    <div className="max-w-md">
      <FieldStack>
        <FieldStackField
          label="Email address"
          type="email"
          name="email"
          placeholder="jess@example.com"
        />
        <FieldStackField label="State" name="state">
          <select className="field-stack-input" name="state" defaultValue="VIC">
            <option value="VIC">Victoria</option>
            <option value="NSW">New South Wales</option>
            <option value="QLD">Queensland</option>
            <option value="WA">Western Australia</option>
          </select>
        </FieldStackField>
      </FieldStack>
    </div>
  ),
};

// ─── In context — waitlist conversion panel ─────────────────────────
export const InWaitlistPanel: Story = {
  name: "In context — waitlist conversion panel",
  render: () => (
    <form className="max-w-md space-y-4" noValidate>
      <div>
        <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]">
          Launching soon
        </div>
        <h3 className="mt-1 text-lg font-medium leading-tight text-[var(--text-strong)]">
          Be the first to know
        </h3>
      </div>
      <FieldStack>
        <FieldStackRow>
          <FieldStackField
            label="First name"
            name="firstName"
            autoComplete="given-name"
            placeholder="Jess"
            required
          />
          <FieldStackField
            label="Last name"
            name="lastName"
            autoComplete="family-name"
            placeholder="Walker"
            required
          />
        </FieldStackRow>
        <FieldStackField
          label="Email address"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="jess@example.com"
          required
        />
        <FieldStackRow>
          <FieldStackField
            label="Phone · optional"
            type="tel"
            name="phone"
            placeholder="04XX XXX XXX"
          />
          <FieldStackField
            label="Suburb / city"
            name="suburb"
            placeholder="Melbourne"
          />
        </FieldStackRow>
      </FieldStack>
      <Button type="submit" variant="dark" fullWidth className="rounded-full">
        Join the waiting list
      </Button>
      <p className="text-center text-xs text-[var(--text-subtle)]">
        We&apos;ll only use your info to notify you when Autara launches in
        your area.
      </p>
    </form>
  ),
};
