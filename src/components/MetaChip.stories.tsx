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

// ─── AUTM-948 ──────────────────────────────────────────────────────
/**
 * The semantic trio, solid — rule 3 ("solid fills on status, never a tint,
 * even against glass") and rule 4 ("purple ACTS, aqua IN FLIGHT, lime DONE
 * and money-in").
 *
 * The older `success` and `brand` tones are TINTS and stay only because
 * consumers pin them. New status code should reach for `act` / `flight` /
 * `money`. The top row is the tinted vocabulary, the bottom row the solid
 * one — over a bloom, a tint picks up whatever is behind it and a solid does
 * not, which is the whole argument.
 *
 * `tone="glass"` is the translucent companion, for a chip sitting directly on
 * the ground rather than on a card. It does not blur: chips are small and
 * come several to a row.
 */
export const SolidSemanticTones: Story = {
  name: "Semantic — solid tones on the gradient ground",
  parameters: { layout: "fullscreen" },
  render: () => (
    <div className="grid sm:grid-cols-2">
      {(["light", "dark"] as const).map((theme) => (
        <div key={theme} data-theme={theme}>
          <GradientGround className="min-h-[20rem] p-8">
            <p className="mb-3 text-[0.6875rem] font-medium uppercase tracking-[0.22em] text-[var(--text-subtle)]">
              {theme} · tinted (legacy)
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <MetaChip tone="success">Open today · 9–17</MetaChip>
              <MetaChip tone="brand">Highly rated</MetaChip>
              <MetaChip tone="neutral">Comes to you · 10km</MetaChip>
            </div>

            <p className="mt-6 mb-3 text-[0.6875rem] font-medium uppercase tracking-[0.22em] text-[var(--text-subtle)]">
              solid (AUTM-948)
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <MetaChip tone="act">Awaiting you</MetaChip>
              <MetaChip tone="flight" dot>
                On the way
              </MetaChip>
              <MetaChip tone="money">Paid $612</MetaChip>
              <MetaChip tone="glass">Comes to you · 10km</MetaChip>
            </div>
          </GradientGround>
        </div>
      ))}
    </div>
  ),
};
