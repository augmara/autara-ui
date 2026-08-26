import type { Meta, StoryObj } from "@storybook/react-vite";
import { CarouselHeader } from "./CarouselHeader";

/** v3 (AUTM-837): eyebrow with no hairline tick. */
const meta = {
  title: "Components/CarouselHeader",
  component: CarouselHeader,
  parameters: { layout: "padded" },
} satisfies Meta<typeof CarouselHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    eyebrow: "Just joined",
    title: "New pros on Autara",
    description: "Recently verified businesses near you.",
  },
};
