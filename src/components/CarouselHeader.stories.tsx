import type { Meta, StoryObj } from "@storybook/react-vite";
import { CarouselHeader } from "./CarouselHeader";

/**
 * v3 (AUTM-837): eyebrow with no hairline tick. AUTM-1483: the eyebrow reads
 * "Just joined" as written, at 0.8125rem and weight 500 with no
 * letterspacing. It used to render as 11px letterspaced capitals.
 */
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
