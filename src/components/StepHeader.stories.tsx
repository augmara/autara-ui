import type { Meta, StoryObj } from "@storybook/react-vite";
import { StepHeader } from "./StepHeader";
import { Stepper } from "./Stepper";

const meta: Meta<typeof StepHeader> = {
  title: "Components/StepHeader",
  component: StepHeader,
  parameters: { layout: "padded" },
};
export default meta;

type Story = StoryObj<typeof StepHeader>;

export const Default: Story = {
  args: {
    eyebrow: "Business details",
    title: "Tell us about your business",
    dek: "Your ABN and trading name, exactly as they appear on the register.",
  },
};

export const TitleOnly: Story = {
  args: { title: "Review and confirm" },
};

export const AutoFocused: Story = {
  args: {
    eyebrow: "Documents",
    title: "Upload your public liability insurance",
    dek: "A current certificate of currency. PDF or a clear photo both work.",
    autoFocus: true,
  },
};

/** In context — the wizard-step composition both wizards converge on:
 *  Stepper (progress) above StepHeader (step identity) above the form. */
export const InWizardContext: Story = {
  render: () => (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <Stepper
          steps={[
            { id: "abn", label: "Business" },
            { id: "terms", label: "Terms" },
            { id: "docs", label: "Documents" },
            { id: "payment", label: "Payment" },
            { id: "review", label: "Review" },
          ]}
          currentStep={2}
          ariaLabel="Onboarding progress"
          hideLabels
        />
      </div>
      <StepHeader
        eyebrow="Documents"
        title="Upload your public liability insurance"
        dek="A current certificate of currency. PDF or a clear photo both work."
        titleId="step-docs-heading"
      />
      <div
        aria-labelledby="step-docs-heading"
        className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] p-6 text-sm text-[var(--text-muted)]"
      >
        Form fields render here.
      </div>
    </div>
  ),
};
