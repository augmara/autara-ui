import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import { CloseButton, IconButton } from "./IconButton";
import { Button } from "./Button";
import { Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./Dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "./Sheet";

/**
 * IconButton — the icon disc (AUTM-1594; AUTM-1756).
 *
 * Don, 2026-10-05: "this close button is very small in every dialog and
 * places, make it large and highlight it like a rounded one, not only a
 * cross", and of a bare sidebar chevron, "every button should have that vibe,
 * don't show only the icon". So every icon-only control is a FILLED disc:
 *
 *   - `tone="neutral"` (default): the Wise pattern. A soft lavender grey disc
 *     with an ink glyph on light grounds; a disc a step lighter than the
 *     surface with a white glyph on dark ones
 *   - `tone="onbrand"`: a white disc with a brand-deep glyph, for purple grounds
 *   - `tone="strong"`: the ink disc, for the one icon action that leads
 *
 * `md` is 44px (48px to a finger), `lg` 48px; the glyph is 20 or 24px. Hover
 * and press step the fill, the press scales to 97%, focus is Button's ring.
 * `CloseButton` is the cross on it, used by Dialog, Sheet, Toast and
 * PWAInstallBanner. `label` is required and is the accessible name.
 */
const meta = {
  title: "Atoms/IconButton",
  component: IconButton,
  parameters: { layout: "centered" },
  argTypes: {
    tone: { control: "inline-radio", options: ["neutral", "onbrand", "strong"] },
    size: { control: "inline-radio", options: ["md", "lg"] },
  },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

const svg = (children: ReactNode) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);
const Doc = svg(
  <>
    <path d="M7 3.5h7l4 4v13H7z" />
    <path d="M14 3.5v4h4" />
    <path d="M10 13h5M10 16.5h5" />
  </>,
);
const Bell = svg(
  <>
    <path d="M6.5 16.5V11a5.5 5.5 0 0 1 11 0v5.5l1.5 2h-14z" />
    <path d="M10 20.5h4" />
  </>,
);
const Back = svg(<path d="M14.5 6l-6 6 6 6" />);
const Collapse = svg(
  <>
    <path d="M13 7l-5 5 5 5" />
    <path d="M18 7l-5 5 5 5" />
  </>,
);
const More = svg(
  <>
    <circle cx="12" cy="5.5" r="1.2" fill="currentColor" />
    <circle cx="12" cy="12" r="1.2" fill="currentColor" />
    <circle cx="12" cy="18.5" r="1.2" fill="currentColor" />
  </>,
);
/* Stand-in for Badge variant="count" until the status family lands. */
const Count = (
  <span className="inline-flex h-[1.375rem] min-w-[1.375rem] items-center justify-center rounded-full bg-[#e11d48] px-[0.4375rem] text-xs font-bold text-white">
    12
  </span>
);

export const Neutral: Story = { args: { icon: Doc, label: "Remove" } };
export const Large: Story = { args: { icon: Doc, label: "Remove", size: "lg" } };
export const Strong: Story = { args: { icon: Doc, label: "Remove", tone: "strong" } };
export const WithCount: Story = { args: { icon: Bell, label: "Notifications, 12 unread", badge: Count } };
export const OnBrand: Story = {
  args: { icon: Bell, label: "Notifications", tone: "onbrand" },
  render: (args) => (
    <div className="flex gap-3 rounded-[1.25rem] bg-[var(--brand)] p-3.5">
      <IconButton {...args} />
      <CloseButton tone="onbrand" />
    </div>
  ),
};
export const Disabled: Story = { args: { icon: Doc, label: "Remove", disabled: true } };

/** One row of the controls Don named: close, back, collapse, the bell, a kebab. */
function Row({ tone, size }: { tone?: "neutral" | "onbrand" | "strong"; size?: "md" | "lg" }) {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <CloseButton tone={tone} size={size} />
      <IconButton icon={Back} label="Back" tone={tone} size={size} />
      <IconButton icon={Collapse} label="Collapse the sidebar" tone={tone} size={size} />
      <IconButton icon={Bell} label="Notifications, 12 unread" badge={Count} tone={tone} size={size} />
      <IconButton icon={More} label="More actions" tone={tone} size={size} />
    </div>
  );
}

function Ground({ name, note, theme, bg, children }: { name: string; note: string; theme?: "dark"; bg: string; children: ReactNode }) {
  return (
    <div data-theme={theme} className="flex flex-col gap-3 rounded-[1.25rem] p-5" style={{ background: bg }}>
      <p className="m-0 text-sm font-medium" style={{ color: theme || bg.includes("brand") || bg.includes("strong") ? "#fff" : "var(--text-muted)" }}>
        {name}
        <span className="font-normal opacity-80"> · {note}</span>
      </p>
      {children}
    </div>
  );
}

/**
 * Every ground the disc is drawn on, at both sizes. On light grounds the
 * neutral disc is soft with an ink glyph; on dark grounds it is a step
 * lighter than the surface with a white glyph. On purple it is the on-brand
 * disc. The glyph is 4.5:1 or better on its disc everywhere; the disc is held
 * to a visibility floor on its ground (IconButton.colour.test.ts).
 */
export const EveryGround: Story = {
  name: "Every ground, both sizes",
  args: { icon: Doc, label: "x" },
  parameters: { layout: "padded" },
  render: () => (
    <div className="grid gap-3 lg:grid-cols-2">
      <Ground name="Light, paper" note="a dialog, a page" bg="var(--paper)">
        <Row />
        <Row size="lg" />
      </Ground>
      <Ground name="Light, band" note="the warm ground, a card" bg="var(--band)">
        <Row />
        <Row size="lg" />
      </Ground>
      <Ground name="Dark island in a light app" note='an ink sidebar, the inverse toast: data-theme="dark"' theme="dark" bg="#0e0a1a">
        <Row />
        <Row size="lg" />
      </Ground>
      <Ground name="Dark, paper" note="a dark dialog or sheet" theme="dark" bg="var(--paper)">
        <Row />
        <Row size="lg" />
      </Ground>
      <Ground name="Dark, band" note="a dark card" theme="dark" bg="var(--band)">
        <Row />
        <Row size="lg" />
      </Ground>
      <Ground name="Dark, raised" note="a row on a dark card" theme="dark" bg="var(--raised)">
        <Row />
        <Row size="lg" />
      </Ground>
      <Ground name="Brand" note="on-brand tone" bg="var(--brand)">
        <Row tone="onbrand" />
        <Row tone="onbrand" size="lg" />
      </Ground>
      <Ground name="Brand-deep" note="on-brand tone, the hero and the merchant sidebar" bg="var(--brand-deep)">
        <Row tone="onbrand" />
        <Row tone="onbrand" size="lg" />
      </Ground>
      <Ground name="Strong tone" note="the one icon action that leads" bg="var(--paper)">
        <Row tone="strong" />
      </Ground>
    </div>
  ),
};

/** Rest, disabled and busy keep the real colour (AUTM-1719). */
export const States: Story = {
  args: { icon: Doc, label: "x" },
  parameters: { layout: "padded" },
  render: () => (
    <div className="grid gap-3 lg:grid-cols-2">
      {[undefined, "dark" as const].map((theme) => (
        <div key={theme ?? "light"} data-theme={theme} className="flex flex-col gap-3 rounded-[1.25rem] bg-[var(--paper)] p-5">
          {(["rest", "disabled", "busy"] as const).map((state) => (
            <div key={state} className="flex items-center gap-3">
              <span className="w-16 text-sm text-[var(--text-muted)]">{state}</span>
              <CloseButton disabled={state === "disabled"} busy={state === "busy"} />
              <IconButton icon={Bell} label={`Notifications, ${state}`} disabled={state === "disabled"} busy={state === "busy"} />
              <CloseButton tone="strong" disabled={state === "disabled"} busy={state === "busy"} />
            </div>
          ))}
        </div>
      ))}
    </div>
  ),
};

function CancelDialog() {
  return (
    <Dialog defaultOpen>
      <DialogContent layout="responsive">
        <DialogHeader>
          <DialogTitle>Cancel this booking?</DialogTitle>
          <DialogDescription>Your deposit is refunded in full. The pro is told straight away.</DialogDescription>
        </DialogHeader>
        <DialogBody>
          <p className="m-0 text-[var(--text-muted)]">Full interior and exterior clean, Sat 17 Oct at 9:00 am.</p>
        </DialogBody>
        <DialogFooter>
          <Button variant="quiet">Keep booking</Button>
          <Button variant="strong">Cancel booking</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function FiltersSheet() {
  return (
    <Sheet defaultOpen>
      <SheetContent side="bottom">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
          <SheetDescription>Narrow the list to what you need.</SheetDescription>
        </SheetHeader>
        <div className="px-5 pb-8 text-[var(--text-muted)]">Service, distance and rating.</div>
      </SheetContent>
    </Sheet>
  );
}

/** The close on a real dialog, desktop, light. */
export const CloseOnADialog: Story = {
  name: "Close: dialog, desktop, light",
  args: { icon: Doc, label: "x" },
  parameters: { layout: "fullscreen", viewport: { defaultViewport: "desktop" } },
  render: () => <CancelDialog />,
};

/** The same dialog, dark: Don's screenshot was a dark sheet with a faint ring. */
export const CloseOnADialogDark: Story = {
  name: "Close: dialog, desktop, dark",
  args: { icon: Doc, label: "x" },
  globals: { theme: "dark" },
  parameters: { layout: "fullscreen", viewport: { defaultViewport: "desktop" } },
  render: () => <CancelDialog />,
};

/** A bottom sheet on a phone, light. The disc is 48px to a finger. */
export const CloseOnASheetPhone: Story = {
  name: "Close: sheet, phone, light",
  args: { icon: Doc, label: "x" },
  parameters: { layout: "fullscreen", viewport: { defaultViewport: "phone" } },
  render: () => <FiltersSheet />,
};

/** The same sheet, dark. */
export const CloseOnASheetPhoneDark: Story = {
  name: "Close: sheet, phone, dark",
  args: { icon: Doc, label: "x" },
  globals: { theme: "dark" },
  parameters: { layout: "fullscreen", viewport: { defaultViewport: "phone" } },
  render: () => <FiltersSheet />,
};
