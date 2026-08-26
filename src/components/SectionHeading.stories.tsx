import type { Meta, StoryObj } from "@storybook/react-vite";
import { SectionHeading } from "./SectionHeading";

/**
 * v3 (AUTM-837): the editorial variant's eyebrow renders with NO hairline
 * tick - eyebrows are plain uppercase tracked labels platform-wide. The new
 * `size="lg"` gives content sections (merchant profile) a middle register
 * between the compact default and the editorial display clamp.
 */
const meta = {
  title: "Components/SectionHeading",
  component: SectionHeading,
  parameters: { layout: "padded" },
} satisfies Meta<typeof SectionHeading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    eyebrow: "Services",
    title: "Everything you offer",
    description: "The compact register for carousels and list headers.",
  },
};

export const Large: Story = {
  args: {
    eyebrow: "Reviews",
    title: "What customers say",
    description:
      "size=\"lg\" - the content-section register used on the merchant profile.",
    size: "lg",
  },
};

export const Editorial: Story = {
  args: {
    eyebrow: "How it works",
    title: "Booked in three steps.",
    description: "Display register in the 3/9 editorial grid. No tick.",
    editorial: true,
  },
};

export const WithTrailing: Story = {
  args: {
    eyebrow: "Top rated",
    title: "Pros near you",
    trailing: <a href="#all">See all</a>,
  },
};
