import type { Meta, StoryObj } from "@storybook/react-vite";
import { MessageBubble } from "./MessageBubble";

const meta = {
  title: "Molecules/MessageBubble",
  component: MessageBubble,
  parameters: { layout: "padded" },
  argTypes: {
    side: {
      control: { type: "select" },
      options: ["own", "incoming", "system"],
    },
  },
  args: {
    side: "incoming",
    children: "Hi — I'm running about 10 minutes late, see you soon!",
  },
} satisfies Meta<typeof MessageBubble>;

export default meta;
type Story = StoryObj<typeof meta>;

const Column = (props: { children: React.ReactNode }) => (
  <div className="flex max-w-[420px] flex-col">{props.children}</div>
);

export const Incoming: Story = {
  render: (args) => (
    <Column>
      <MessageBubble {...args} />
    </Column>
  ),
};

export const Own: Story = {
  args: { side: "own", children: "No worries — the gate code is 4821." },
  render: (args) => (
    <Column>
      <MessageBubble {...args} />
    </Column>
  ),
};

export const System: Story = {
  args: { side: "system", children: "Booking confirmed · Fri 15 May, 9:00 AM" },
  render: (args) => (
    <Column>
      <MessageBubble {...args} />
    </Column>
  ),
};

/** Long unbroken token + an explicit newline — proves break-words + pre-wrap. */
export const EdgeWrapping: Story = {
  args: {
    side: "incoming",
    children:
      "Here's the link: https://autara.au/m/628c6519/booking/confirmation-9f2a7c1e\nLet me know if it doesn't open.",
  },
  render: (args) => (
    <Column>
      <MessageBubble {...args} />
    </Column>
  ),
};

/** In context — a short exchange as it renders inside a thread column. */
export const InContext: Story = {
  parameters: { layout: "fullscreen" },
  render: () => (
    <div className="mx-auto flex max-w-[680px] flex-col gap-2 p-6">
      <MessageBubble side="system">
        Booking confirmed · Fri 15 May, 9:00 AM
      </MessageBubble>
      <MessageBubble side="incoming">
        Hi! Are you able to do the interior deep clean this Friday?
      </MessageBubble>
      <MessageBubble side="own">Yes — 9am works. I'll bring the full kit.</MessageBubble>
      <MessageBubble side="incoming">Perfect, thank you.</MessageBubble>
      <MessageBubble side="own">See you then.</MessageBubble>
    </div>
  ),
};
