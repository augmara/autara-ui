import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { OtpInput, type OtpInputProps } from "./OtpInput";

/**
 * OtpInput is controlled, so every story wraps it in a tiny stateful host.
 * `seed` pre-fills the boxes; `length` and `invalid` pass straight through.
 */
function ControlledOtp({
  seed = "",
  length,
  invalid,
  autoFocus = false,
}: {
  seed?: string;
  length?: OtpInputProps["length"];
  invalid?: boolean;
  autoFocus?: boolean;
}) {
  const [code, setCode] = useState(seed);
  const [done, setDone] = useState<string | null>(null);
  return (
    <div className="flex flex-col items-center gap-3">
      <OtpInput
        value={code}
        onChange={(c) => {
          setCode(c);
          setDone(null);
        }}
        onComplete={setDone}
        length={length}
        invalid={invalid}
        autoFocus={autoFocus}
      />
      <p className="text-xs text-[var(--text-subtle)]">
        {done ? `Completed: ${done}` : `Value: ${code || "—"}`}
      </p>
    </div>
  );
}

const meta = {
  title: "Forms/OtpInput",
  component: OtpInput,
  parameters: { layout: "centered" },
  // Required props live here so the render-based stories below don't each
  // have to restate them (the stories drive state via ControlledOtp).
  args: { value: "", onChange: () => {} },
} satisfies Meta<typeof OtpInput>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Empty six-box default — type or paste a code; `onComplete` fires on the 6th digit. */
export const Default: Story = {
  render: () => <ControlledOtp autoFocus />,
};

/** Pre-filled (e.g. restored from autofill). */
export const Filled: Story = {
  render: () => <ControlledOtp seed="123456" />,
};

/** Error tone — boxes go red after a rejected code. */
export const Invalid: Story = {
  render: () => <ControlledOtp seed="1234" invalid />,
};

/** Configurable length — four boxes. */
export const FourDigit: Story = {
  render: () => <ControlledOtp length={4} />,
};

/**
 * In context — the merchant sign-in "Enter your code" stage: heading +
 * subtitle + the segmented input that auto-confirms on completion.
 */
export const InContext: Story = {
  parameters: { layout: "padded" },
  render: () => (
    <div className="mx-auto flex max-w-sm flex-col items-center gap-6 text-center">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-[var(--text-strong)]">
          Enter your code
        </h2>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          We sent a code to sam@example.com.
        </p>
      </div>
      <ControlledOtp autoFocus />
    </div>
  ),
};
