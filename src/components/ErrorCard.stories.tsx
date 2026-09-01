import type { Meta, StoryObj } from "@storybook/react-vite";
import { ErrorCard } from "./ErrorCard";

const meta = {
  title: "Molecules/ErrorCard",
  component: ErrorCard,
  parameters: { layout: "padded" },
  args: {
    message: "Check your connection and tap retry.",
  },
} satisfies Meta<typeof ErrorCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="max-w-md">
      <ErrorCard {...args} />
    </div>
  ),
};

export const WithCustomTitle: Story = {
  args: {
    title: "Couldn't load your bookings",
    message: "Check your connection and tap retry.",
  },
  render: (args) => (
    <div className="max-w-md">
      <ErrorCard {...args} />
    </div>
  ),
};

export const WithRetry: Story = {
  args: {
    title: "Couldn't load your bookings",
    message: "Check your connection and tap retry.",
    onRetry: () => {},
  },
  render: (args) => (
    <div className="max-w-md">
      <ErrorCard {...args} />
    </div>
  ),
};

export const WithDetail: Story = {
  args: {
    title: "Couldn't load your bookings",
    message: "Check your connection and tap retry.",
    detail: "NetworkError: Failed to fetch (status 503)",
    onRetry: () => {},
  },
  render: (args) => (
    <div className="max-w-md">
      <ErrorCard {...args} />
    </div>
  ),
};

export const Warning: Story = {
  args: {
    tone: "warning",
    title: "Slow connection",
    message: "Your bookings are loading. This is taking longer than usual.",
  },
  render: (args) => (
    <div className="max-w-md">
      <ErrorCard {...args} />
    </div>
  ),
};

export const WithIcon: Story = {
  args: {
    title: "Couldn't load your bookings",
    message: "Check your connection and tap retry.",
    onRetry: () => {},
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4M12 16h.01" />
      </svg>
    ),
  },
  render: (args) => (
    <div className="max-w-md">
      <ErrorCard {...args} />
    </div>
  ),
};

// ─── AUTM-936 ──────────────────────────────────────────────────────
/**
 * Both tones on both canvases. The right-hand column forces
 * `data-theme="dark"` on a wrapper so the two are visible side by side
 * without touching the Storybook toolbar.
 *
 * Before AUTM-936 the right-hand column was the bug: `bg-rose-50/40`
 * composited over the dark canvas to a muddy grey with the title at
 * 1.82:1, and the retry button — `bg-white text-rose-900` — was a white
 * slab. Every value is a token now, so both columns track the ladder.
 */
export const BothThemes: Story = {
  name: "Tones — light and dark canvas",
  args: { message: "Check your connection and tap retry." },
  render: () => (
    <div className="grid gap-6 sm:grid-cols-2">
      {[
        { label: "light", theme: undefined },
        { label: "dark", theme: "dark" as const },
      ].map((col) => (
        <div
          key={col.label}
          data-theme={col.theme}
          className="space-y-4 rounded-autara-lg bg-[var(--background)] p-5"
        >
          <p className="text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]">
            {col.label}
          </p>
          <ErrorCard
            title="Couldn't load your bookings"
            message="Check your connection and tap retry."
            onRetry={() => {}}
          />
          <ErrorCard
            tone="warning"
            title="Showing yesterday's numbers"
            message="We couldn't reach the earnings service. These figures are from 6:00 this morning."
            onRetry={() => {}}
            retryLabel="Refresh"
          />
        </div>
      ))}
    </div>
  ),
};

/**
 * Edge case — long copy, a dev detail line, and a long retry label. The
 * detail line is the one consumers pass `error.message` into, so it has to
 * survive an unbroken stack-trace-ish token without pushing the card wide.
 */
export const LongCopy: Story = {
  name: "Edge — long copy and a dev detail",
  args: { message: "" },
  render: () => (
    <div className="max-w-md">
      <ErrorCard
        title="We couldn't confirm this booking"
        message="The payment went through but we haven't heard back from the detailer's calendar. Nothing has been charged twice. Tap retry, and if it happens again we'll sort it out from our side."
        detail="MERCHANT_CALENDAR_TIMEOUT: upstream did not respond within 8000ms"
        onRetry={() => {}}
        retryLabel="Try confirming again"
      />
    </div>
  ),
};

/**
 * In context — the shape merchant-mobile renders inside
 * `AppErrorBoundary`, which is what made the dark-mode defect a whole-app
 * problem rather than a component one. The retry control is the only way
 * out of this screen, so it is the one that must be reachable, legible and
 * keyboard-focusable. Tab to it.
 */
export const InContextBoundary: Story = {
  name: "In context — app error boundary",
  args: { message: "" },
  render: () => (
    <div className="mx-auto grid min-h-80 max-w-sm place-items-center rounded-autara-lg bg-[var(--background)] p-6">
      <div className="w-full">
        <ErrorCard
          title="The app hit a problem"
          message="We've logged what happened. Reload to pick up where you left off — your bookings are safe."
          onRetry={() => {}}
          retryLabel="Reload the app"
        />
      </div>
    </div>
  ),
};

/**
 * Without `onRetry` there is no button — for the cases where retrying is
 * genuinely not the answer and the copy has to carry the whole message.
 */
export const NoRetry: Story = {
  name: "Edge — nothing to retry",
  args: { message: "" },
  render: () => (
    <div className="max-w-md">
      <ErrorCard
        tone="warning"
        title="This booking was cancelled"
        message="The detailer cancelled 20 minutes ago and your deposit is on its way back. It usually lands within 5 business days."
      />
    </div>
  ),
};
