import type { Meta, StoryObj } from "@storybook/react-vite";
import { TrustItem } from "./TrustItem";

const meta = {
  title: "Molecules/TrustItem",
  component: TrustItem,
  parameters: { layout: "padded" },
  args: {
    title: "Secure payments",
    description: "Stripe-processed. Cards never stored by Autara.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M12 2 4 6v6c0 5 3.5 9.7 8 10 4.5-.3 8-5 8-10V6l-8-4z" />
      </svg>
    ),
  },
} satisfies Meta<typeof TrustItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="max-w-xs">
      <TrustItem {...args} />
    </div>
  ),
};

/** The canonical 3-up trust strip used on the merchant profile and below booking CTAs. */
export const TrustStrip: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Three trust signals side by side — the strip that appears beneath the primary booking CTA on customer-web's merchant profile.",
      },
    },
  },
  render: () => (
    <div className="grid max-w-3xl gap-3 sm:grid-cols-3">
      <TrustItem
        title="Secure payments"
        description="Stripe-processed. Cards never stored by Autara."
        icon={
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M12 2 4 6v6c0 5 3.5 9.7 8 10 4.5-.3 8-5 8-10V6l-8-4z" />
          </svg>
        }
      />
      <TrustItem
        title="Verified merchants"
        description="ABN-verified, ID-checked pros only."
        icon={
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="12" cy="12" r="9" />
            <path d="M8 12l3 3 5-6" />
          </svg>
        }
      />
      <TrustItem
        title="Free cancellation"
        description="Cancel free up to 24 hours before your slot."
        icon={
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
        }
      />
    </div>
  ),
};
