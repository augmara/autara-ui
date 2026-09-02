import type { Meta, StoryObj } from "@storybook/react-vite";
import { MetaChip } from "./MetaChip";
import { GradientGround } from "./GlassSurface";

const meta = {
  title: "Molecules/MetaChip",
  component: MetaChip,
  parameters: { layout: "centered" },
  argTypes: {
    tone: {
      control: { type: "select" },
      options: [
        "neutral",
        "success",
        "brand",
        "muted",
        // AUTM-948 — solid semantic tones + the glass companion.
        "act",
        "flight",
        "money",
        "glass",
      ],
    },
    dot: { control: "boolean" },
  },
  args: { children: "Verified", tone: "neutral" },
} satisfies Meta<typeof MetaChip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Neutral: Story = {};
export const Success: Story = {
  args: { tone: "success", children: "Open today · 9–17" },
};
export const Brand: Story = {
  args: { tone: "brand", children: "Highly rated" },
};
export const Muted: Story = { args: { tone: "muted", children: "Closed" } };

export const WithDot: Story = {
  args: { tone: "success", dot: true, children: "Open now" },
};

/** All tones rendered together — the canonical chip vocabulary in the
 *  refreshed editorial weight (uppercase + tracked, brand-aligned ink). */
export const Vocabulary: Story = {
  parameters: { layout: "padded" },
  render: () => (
    <div className="flex max-w-md flex-wrap gap-1.5">
      <MetaChip tone="success" dot>
        Open today · 9–17
      </MetaChip>
      <MetaChip>4 services</MetaChip>
      <MetaChip tone="brand">Comes to you · 10 km</MetaChip>
      <MetaChip tone="brand">Highly rated</MetaChip>
      <MetaChip tone="muted" dot>
        Closed today
      </MetaChip>
      <MetaChip tone="success">Verified</MetaChip>
      <MetaChip tone="muted">15+ years</MetaChip>
    </div>
  ),
};

// ─── AUTM-948 + AUTM-974 ───────────────────────────────────────────
/**
 * Every tone, solid — rule 4 of the Autara Glass direction ("solid fills:
 * never a tint, and never an outline") and rule 5 ("purple ACTS, aqua IN
 * FLIGHT, lime DONE and money-in").
 *
 * AUTM-948 added `act` / `flight` / `money` as the solid vocabulary but left
 * `neutral`, `muted`, `success` and `brand` as they were: two outlined boxes
 * on a 1.05:1 fill, and two pastel tints WITH a ring on top. AUTM-974 finished
 * it. `success` and `brand` were the tinted twins of `money` and `act`, so
 * they now render as the solid they always meant; `neutral` takes the
 * achromatic `--neutral-fill`; `muted` gives up its chrome entirely, because
 * de-emphasis has to be less, not fainter.
 *
 * `tone="glass"` is the translucent companion, for a chip sitting directly on
 * the ground rather than on a card. Its hairline is the MATERIAL of a
 * translucent surface — the one thing rule 4 exempts — so it keeps it. It
 * does not blur: chips are small and come several to a row.
 */
export const SolidSemanticTones: Story = {
  name: "Semantic — solid tones on the gradient ground",
  parameters: { layout: "fullscreen" },
  render: () => (
    <div className="grid sm:grid-cols-2">
      {(["light", "dark"] as const).map((theme) => (
        <div key={theme} data-theme={theme}>
          <GradientGround className="min-h-[22rem] p-8">
            <p className="mb-3 text-[0.6875rem] font-medium uppercase tracking-[0.22em] text-[var(--text-subtle)]">
              {theme} · metadata
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <MetaChip tone="neutral">Comes to you · 10km</MetaChip>
              <MetaChip tone="muted">15+ years</MetaChip>
              <MetaChip tone="glass">4 services</MetaChip>
            </div>

            <p className="mt-6 mb-3 text-[0.6875rem] font-medium uppercase tracking-[0.22em] text-[var(--text-subtle)]">
              status
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <MetaChip tone="act">Awaiting you</MetaChip>
              <MetaChip tone="flight" dot>
                On the way
              </MetaChip>
              <MetaChip tone="money">Paid $612</MetaChip>
            </div>

            <p className="mt-6 mb-3 text-[0.6875rem] font-medium uppercase tracking-[0.22em] text-[var(--text-subtle)]">
              pinned aliases · success = money, brand = act
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <MetaChip tone="success" dot>
                Open today · 9–17
              </MetaChip>
              <MetaChip tone="brand">Highly rated</MetaChip>
            </div>
          </GradientGround>
        </div>
      ))}
    </div>
  ),
};

/**
 * The tones on an ordinary card, which is where most of them actually live —
 * `GradientGround` flatters a chip and a merchant profile does not.
 *
 * Worth knowing while reading this one: `money` is brand lime, and lime on
 * cream is a 1.35:1 LUMINANCE step. It is unmistakable anyway because what
 * separates it is hue (ΔE 73), but it is the one fill in the set whose shape
 * is carried by chroma rather than by tone. `solid-emphasis.test.ts` measures
 * both and accepts either.
 */
export const BothThemesOnACard: Story = {
  name: "In context — light and dark card",
  parameters: { layout: "padded" },
  render: () => (
    <div className="grid gap-6 lg:grid-cols-2">
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
          <div className="rounded-autara-lg bg-[var(--surface)] p-5">
            <h3 className="mb-1 text-base font-medium text-[var(--text-strong)]">
              Autobahn Auto Spa
            </h3>
            <p className="mb-3 text-sm text-[var(--text-muted)]">
              Surry Hills · mobile detailing
            </p>
            {/* Rule 5 — one accent per zone. Lime for "open", purple for
                the thing the customer is meant to act on, and nothing else
                competing. `flight` belongs to a booking block, not to a
                merchant card, so it is not in this row. */}
            <div className="flex flex-wrap gap-1.5">
              <MetaChip tone="success" dot>
                Open today · 9–17
              </MetaChip>
              <MetaChip>4 services</MetaChip>
              <MetaChip tone="brand">Highly rated</MetaChip>
              <MetaChip tone="muted">15+ years</MetaChip>
            </div>
          </div>
        </div>
      ))}
    </div>
  ),
};
