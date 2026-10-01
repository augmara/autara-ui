import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import { InlineAlert } from "./InlineAlert";
import { Banner } from "./Banner";

/**
 * Sheets, dialogs and toasts — the inline half of canvas v44's section
 * (AUTM-1594), at the sheet's geometry for the overlay. Dialogs, sheets and
 * toasts open in a portal, so they are checked in their own stories
 * (ConfirmDialog, Sheet, PickerSheet, Toast) rather than mocked up here.
 */
const meta = {
  title: "Molecules/Sheets, dialogs and toasts",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function Specimen({ name, component, children }: { name: string; component: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-2.5">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[0.9375rem] leading-[normal] font-bold">{name}</span>
        <code className="font-mono text-xs text-[var(--text-subtle)]">{component}</code>
      </div>
      <div className="flex flex-wrap items-center gap-2.5">{children}</div>
    </div>
  );
}

export const Sheet: Story = {
  render: () => (
    <div style={{ padding: "72px 80px", background: "var(--paper)", color: "var(--text-strong)" }}>
      <section className="flex flex-col gap-5 border-t border-[var(--hairline)] py-10">
        <div className="flex flex-col gap-1.5">
          <h2 className="text-section m-0">Sheets, dialogs and toasts</h2>
          <p className="text-body m-0 text-[var(--text-muted)]">
            Bottom sheets on phones and in the native app; centred dialogs on a scrim on the web. Toasts are ink with a status dot, bottom centre, and never the only place an error is told.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-x-10 gap-y-8">
          <div />
          <Specimen name="Inline alert" component="InlineAlert">
            <InlineAlert title="Not taking new bookings right now" className="w-full">
              On a short break. Back from Monday, 13 October.
            </InlineAlert>
          </Specimen>
          <Specimen name="Banner" component="Banner (offline)">
            <Banner className="w-full">No connection. We’ll catch up as soon as you’re back.</Banner>
          </Specimen>
        </div>
      </section>
    </div>
  ),
};
