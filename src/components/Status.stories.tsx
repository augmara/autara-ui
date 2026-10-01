import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import { Badge } from "./Badge";
import { StatusDot } from "./StatusDot";
import { MetaChip } from "./MetaChip";

/**
 * Status and counts — canvas v44's section (AUTM-1594): booking status on
 * both surfaces, counts, dots and meta chips, laid out at the sheet's
 * geometry for the overlay.
 */
const meta = {
  title: "Molecules/Status and counts",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function Specimen({ name, component, note, children }: { name: string; component: string; note?: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-2.5">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[0.9375rem] leading-[normal] font-bold">{name}</span>
        <code className="font-mono text-xs text-[var(--text-subtle)]">{component}</code>
      </div>
      <div className="flex flex-wrap items-center gap-2.5">{children}</div>
      {note && <span className="text-[0.8125rem] leading-[1.45] text-[var(--text-subtle)]">{note}</span>}
    </div>
  );
}

export const Sheet: Story = {
  render: () => (
    <div style={{ padding: "72px 80px", background: "var(--paper)", color: "var(--text-strong)" }}>
      <section className="flex flex-col gap-5 border-t border-[var(--hairline)] py-10">
        <div className="flex flex-col gap-1.5">
          <h2 className="text-section m-0">Status and counts</h2>
          <p className="text-body m-0 text-[var(--text-muted)]">
            Solid, rounded pills: purple acts or is live, aqua is in flight, lime is done. Counts are purple in navigation, red on the bell and the dock. No tints, no outlines.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-x-10 gap-y-8">
          <Specimen name="Merchant booking status" component="Badge (booking-status-display)">
            <Badge variant="brand">Pending</Badge>
            <Badge variant="brand">Confirmed</Badge>
            <Badge variant="amber">Awaiting customer</Badge>
            <Badge variant="aqua">In progress</Badge>
            <Badge variant="lime">Completed</Badge>
            <Badge variant="danger">Cancelled</Badge>
            <Badge variant="band">No-show</Badge>
          </Specimen>
          <Specimen name="Customer booking status" component="Badge (customer tones)" note="Waiting is ink, off is band with danger text, expired is band.">
            <Badge variant="waiting">Awaiting confirmation</Badge>
            <Badge variant="waiting">Payment incomplete</Badge>
            <Badge variant="brand">Confirmed</Badge>
            <Badge variant="aqua">In progress</Badge>
            <Badge variant="lime">Completed</Badge>
            <Badge variant="off">Cancelled</Badge>
            <Badge variant="band">Expired</Badge>
          </Specimen>
          <Specimen name="Counts" component="Badge variant=count">
            <Badge variant="count">3</Badge>
            <Badge variant="count-quiet">3</Badge>
            <Badge variant="count-alert">12</Badge>
            <Badge variant="count-alert">99+</Badge>
          </Specimen>
          <Specimen name="Dots" component="StatusDot" note="A status said in words always sits beside the dot.">
            <StatusDot tone="open">Open</StatusDot>
            <StatusDot tone="closing">Closes 17:00</StatusDot>
            <StatusDot tone="away">Away</StatusDot>
            <StatusDot tone="starting">Starts in 25m</StatusDot>
          </Specimen>
          <Specimen name="Default and meta" component="MetaChip / Badge neutral">
            <MetaChip tone="money">Default</MetaChip>
            <MetaChip>Example data</MetaChip>
            <MetaChip>Comes to you</MetaChip>
          </Specimen>
        </div>
      </section>
    </div>
  ),
};
