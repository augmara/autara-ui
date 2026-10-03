import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "./Card";
import { StatTile } from "./StatTile";
import { ListSection, ListSectionRow } from "./ListSection";
import { Badge } from "./Badge";
import { MoneyBreakdown } from "./MoneyBreakdown";
import { InfoRow } from "./InfoRow";

/**
 * Surfaces — canvas v44's section (AUTM-1594): band cards on paper, raised
 * rows inside them, one brand-deep hero per screen. Laid out at the sheet's
 * geometry for the overlay.
 */
const meta = {
  title: "Molecules/Surfaces",
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
          <h2 className="text-section m-0">Surfaces</h2>
          <p className="text-body m-0 text-[var(--text-muted)]">
            Band cards on paper, paper rows inside band cards, one brand-deep hero per screen. Radius 24 for cards, 20 for tiles, 16 for rows. No shadows: depth is the step between paper, band and raised.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-x-10 gap-y-8">
          <Specimen name="Card" component="Card">
            <Card className="w-full">
              <CardHeader>
                <CardTitle>When and where</CardTitle>
                <CardDescription>Fri 3 Oct, 11:00 am · 14 Foveaux St, Brunswick</CardDescription>
              </CardHeader>
            </Card>
          </Specimen>
          <Specimen name="Stat tiles" component="StatTile (hero / plain)">
            <StatTile hero label="Today" value="$429" caption="+12% on last Wednesday" className="min-w-[12.5rem]" />
            <StatTile label="Pending payouts" value="$202" caption="Awaiting Stripe transfer" className="min-w-[12.5rem]" />
          </Specimen>
          <Specimen name="Row in a card" component="ListSection row">
            <ListSection className="w-full">
              <ListSectionRow
                accent
                label="Elena Quinn"
                description="Full Interior Detail · Fri, 17 Oct 15:00"
                trailing={<span className="text-[1.0625rem] font-black">$189</span>}
              />
            </ListSection>
          </Specimen>
          <Specimen name="Hero card" component="Card variant=hero">
            <Card variant="hero" className="flex w-full flex-col gap-2 p-[1.375rem]">
              <Badge variant="lime" className="self-start">Confirmed</Badge>
              <span className="text-[1.375rem] leading-snug font-black">Full Interior Detail</span>
              <span className="text-[0.9375rem] leading-snug text-[var(--on-deep-muted)]">Demo Car Care · Fri 3 Oct, 11:00 am</span>
            </Card>
          </Specimen>
          <Specimen name="Money breakdown" component="MoneyBreakdown" note="Amounts come from the server; never summed on the page.">
            <MoneyBreakdown
              card
              className="w-full"
              title="If you cancel now"
              label="If you cancel now"
              rows={[
                { label: "Kept by the pro", value: "$0.00" },
                { label: "Deposit back", value: "$56.70" },
              ]}
              total={{ label: "You get back", value: "$56.70" }}
            />
          </Specimen>
          <Specimen name="Info row" component="InfoRow">
            <div className="w-full">
              <InfoRow label="Vehicle" value="Mazda CX-5, SUV" />
            </div>
          </Specimen>
        </div>
      </section>
    </div>
  ),
};
