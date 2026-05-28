import type { Meta, StoryObj } from "@storybook/react-vite";
import { StepCard } from "./StepCard";
import { SectionBand } from "./SectionBand";
import { SectionHeading } from "./SectionHeading";

const meta = {
  title: "Marketplace/StepCard",
  component: StepCard,
  parameters: { layout: "padded" },
  args: {
    step: 1,
    total: 3,
    title: "Find a professional",
    description:
      "Wrap installers, detailers, ceramic coaters, tinters — search by service, location, and availability. See reviews from customers who actually booked the job.",
    chips: ["ABN verified", "Customer reviews"],
  },
} satisfies Meta<typeof StepCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Single: Story = {
  render: (args) => (
    <div className="max-w-md">
      <StepCard {...args} />
    </div>
  ),
};

export const Interactive: Story = {
  args: { as: "a", href: "#example" },
  render: (args) => (
    <div className="max-w-md">
      <StepCard {...args} />
    </div>
  ),
};

/**
 * The canonical "How it works in three steps." composition — the
 * lime-band homepage section that anchors customer-web's hero.
 *
 * Three StepCards inside a `.hairline-grid` utility (1px hairline
 * dividers between cards), inside a `SectionBand tone="lime"`.
 */
export const LimeBandComposition: Story = {
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        story:
          "The full lime 'How it works' section as it appears on autara.au — `SectionBand` + `SectionHeading editorial` + three `StepCard` in `.hairline-grid`. The defining Autara editorial moment.",
      },
    },
  },
  render: () => (
    <SectionBand tone="lime" withNoise>
      <SectionHeading
        editorial
        eyebrow="How it works"
        title="How it works, in three steps."
        description="Autara connects you with car-care professionals across Australia — detailing, wraps, paint protection, ceramic, tinting. Every one of them is ABN verified before they can take bookings."
        tone="lime"
      />

      <div
        className="hairline-grid lg:grid-cols-3"
        style={{ background: "rgba(17,24,39,0.08)" }}
      >
        <StepCard
          step={1}
          title="Find a professional"
          description="Wrap installers, detailers, ceramic coaters, tinters — search by service, location, and availability. See reviews from customers who actually booked the job."
          chips={["ABN verified", "Customer reviews"]}
          as="a"
          href="#step-1"
        />
        <StepCard
          step={2}
          title="Book a time"
          description="Pick a slot that suits you and pay a deposit through Stripe. Your booking is confirmed straight away."
          chips={["Secure payment", "Instant confirmation"]}
          as="a"
          href="#step-2"
        />
        <StepCard
          step={3}
          title="Get it sorted"
          description="They come to your driveway or you visit their workshop — whatever the merchant offers. Message them in the app, leave a review when the job is done."
          chips={["Mobile or workshop", "In-app messaging"]}
          as="a"
          href="#step-3"
        />
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-3 text-sm text-[#111827]/75">
        <span className="relative flex h-2 w-2" aria-hidden>
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-autara-purple)]/50" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--color-autara-purple)]" />
        </span>
        <span>
          <span className="font-semibold text-[#111827]">
            Launching in Melbourne first.
          </span>{" "}
          <span className="text-[#111827]/55">
            Sydney and Brisbane coming soon.
          </span>
        </span>
      </div>
    </SectionBand>
  ),
};
