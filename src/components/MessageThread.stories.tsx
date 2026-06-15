import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { MessageThread, type MessageItem } from "./MessageThread";
import { MessageComposer } from "./MessageComposer";

// Fixed base time so timestamp separators render deterministically.
const BASE = Date.UTC(2026, 4, 15, 9, 17);
const MIN = 60 * 1000;

const SAMPLE: MessageItem[] = [
  {
    id: "s1",
    side: "system",
    text: "Booking confirmed · Fri 15 May, 9:00 AM",
    createdAt: BASE - 60 * MIN,
  },
  {
    id: "1",
    side: "incoming",
    text: "Hi! Are you able to do the interior deep clean this Friday?",
    createdAt: BASE - 58 * MIN,
  },
  {
    id: "2",
    side: "own",
    text: "Yes — 9am works. I'll bring the full kit.",
    createdAt: BASE - 57 * MIN,
  },
  {
    id: "3",
    side: "incoming",
    text: "Perfect. The car's a black SUV, fairly muddy after the weekend.",
    createdAt: BASE - 20 * MIN,
  },
  {
    id: "4",
    side: "own",
    text: "No problem at all. See you Friday.",
    createdAt: BASE - 19 * MIN,
  },
];

const EmptyTile = (
  <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] px-5 py-6 text-center">
    <p className="text-[14px] font-bold text-[var(--text-strong)]">
      No messages yet
    </p>
    <p className="mt-1 text-[13px] text-[var(--text-muted)]">
      Start the conversation — your customer will be notified by push and email.
    </p>
  </div>
);

const meta = {
  title: "Molecules/MessageThread",
  component: MessageThread,
  parameters: { layout: "fullscreen" },
  args: { items: [] },
} satisfies Meta<typeof MessageThread>;

export default meta;
type Story = StoryObj<typeof meta>;

function Frame({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-[520px] flex-col bg-[var(--background)]">{children}</div>
  );
}

export const Default: Story = {
  render: () => (
    <Frame>
      <MessageThread items={SAMPLE} />
    </Frame>
  ),
};

export const Loading: Story = {
  render: () => (
    <Frame>
      <MessageThread items={[]} loading />
    </Frame>
  ),
};

/** Empty state is vertically centered — no stranded tile + void. */
export const Empty: Story = {
  render: () => (
    <Frame>
      <MessageThread items={[]} emptyState={EmptyTile} />
    </Frame>
  ),
};

export const ErrorState: Story = {
  render: () => (
    <Frame>
      <MessageThread items={[]} error onRetry={() => {}} />
    </Frame>
  ),
};

/** In context — thread + docked composer, the real screen shape. */
export const InContext: Story = {
  render: () => (
    <Frame>
      <MessageThread items={SAMPLE} />
      <MessageComposer value="" onChange={() => {}} onSend={() => {}} />
    </Frame>
  ),
};
