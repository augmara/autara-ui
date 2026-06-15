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

/** With a leading control (e.g. an attach / plus button) left of the field. */
export const WithLeading: Story = {
  render: () => (
    <Demo
      leading={
        <button
          type="button"
          aria-label="Add attachment"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-lg text-[var(--text-subtle)] transition-colors hover:text-[var(--text-muted)]"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.2" />
            <path
              d="M12 8.5v7M8.5 12h7"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      }
    />
  ),
};
