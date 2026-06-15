import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { MessageComposer, type MessageComposerProps } from "./MessageComposer";

const meta = {
  title: "Molecules/MessageComposer",
  component: MessageComposer,
  parameters: { layout: "fullscreen" },
  args: { value: "", onChange: () => {}, onSend: () => {} },
} satisfies Meta<typeof MessageComposer>;

export default meta;
type Story = StoryObj<typeof meta>;

function Demo(props: Partial<MessageComposerProps>) {
  const [value, setValue] = useState(props.value ?? "");
  return (
    <div className="flex min-h-[240px] flex-col bg-[var(--background)]">
      <div className="flex flex-1 items-center justify-center text-[13px] text-[var(--text-subtle)]">
        thread scroll area
      </div>
      <MessageComposer
        value={value}
        onChange={setValue}
        onSend={() => setValue("")}
        {...props}
      />
    </div>
  );
}

export const Default: Story = { render: () => <Demo /> };

export const WithText: Story = {
  render: () => <Demo value="On my way — about 5 minutes out." />,
};

export const Sending: Story = {
  render: () => <Demo value="On my way — about 5 minutes out." sending />,
};

export const WithError: Story = {
  render: () => (
    <Demo
      value="On my way — about 5 minutes out."
      error="We couldn't send your message — check your connection and try again."
    />
  ),
};
