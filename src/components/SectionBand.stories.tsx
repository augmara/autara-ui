import type { Meta, StoryObj } from "@storybook/react-vite";
import { SectionBand } from "./SectionBand";
import { SectionHeading } from "./SectionHeading";

const meta = {
  title: "Layout/SectionBand",
  component: SectionBand,
  parameters: { layout: "fullscreen" },
  args: { tone: "lime", children: null },
} satisfies Meta<typeof SectionBand>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Lime: Story = {
  render: (args) => (
    <SectionBand {...args}>
      <SectionHeading
        editorial
        eyebrow="How it works"
        title="How it works, in three steps."
        description="Autara connects you with car-care professionals across Australia — detailing, wraps, paint protection, ceramic, tinting. Every one of them is ABN verified before they can take bookings."
        tone="lime"
      />
    </SectionBand>
  ),
};

export const Aqua: Story = {
  args: { tone: "aqua" },
  render: (args) => (
    <SectionBand {...args}>
      <SectionHeading
        editorial
        eyebrow="Why merchants choose us"
        title="The fastest way to fill your week."
        description="Get matched with customers actively looking for your service — no marketing budget required."
        tone="aqua"
      />
    </SectionBand>
  ),
};

export const Cream: Story = {
  args: { tone: "cream" },
  render: (args) => (
    <SectionBand {...args} spacing="md">
      <SectionHeading
        editorial
        eyebrow="Recently booked"
        title="See what's trending in your city."
        tone="brand"
      />
    </SectionBand>
  ),
};
