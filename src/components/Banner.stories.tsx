import type { Meta, StoryObj } from "@storybook/react-vite";
import { Banner } from "./Banner";
import { Button } from "./Button";

/** Banner — canvas v44 "Banner (offline)" (AUTM-1594). Flip the Theme toolbar for dark. */
const meta = {
  title: "Molecules/Banner",
  component: Banner,
  parameters: { layout: "padded" },
  args: { children: "No connection. We’ll catch up as soon as you’re back." },
} satisfies Meta<typeof Banner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Offline: Story = {};
export const WithAction: Story = {
  args: {
    children: "We couldn’t reach Autara. Your changes are saved on this device.",
    action: (
      <Button variant="ondeep" size="sm">
        Retry
      </Button>
    ),
  },
};
