import type { ReactNode } from "react";

/**
 * MetaChip — the inline pill primitive for credibility + status surfacing.
 * Used heavily on customer-web's merchant profile page (Open today,
 * X services, Comes to you · 10km, Highly rated, etc.).
 *
 * Tones:
 *   - neutral  — plain surface, ink text
 *   - success  — brand-lime ink, e.g. "Open today"
 *   - brand    — autara purple, e.g. "Highly rated", "Verified"
 *   - muted    — same surface as neutral, dimmer text
 *   - act      — SOLID purple. Something is waiting on the user (AUTM-948)
 *   - flight   — SOLID aqua. Confirmed, running, money on its way
 *   - money    — SOLID lime. Done, paid, money in
 *   - glass    — translucent, for a chip on the gradient ground
 *
 * Aesthetic refresh:
 *   - Dropped raw tailwind `emerald-50/700/200` in favour of brand-
 *     `lime-drive` ink, so every tone now sits on the same colour
 *     vocabulary as the rest of the design system.
 *   - Editorial weight: 11-px uppercase with 0.12em tracking. The
 *     chips read as section markers rather than soft tailwind tags.
 *     Pair with sentence-style copy ("Open today · 9–17") — uppercase
 *     is applied via CSS, so consumers keep authoring in natural case.
 *
 * The optional `dot` renders a colored pulse-dot before the label —
 * use it for status indicators ("Open now") not for static labels.
 */
type Tone =
  | "neutral"
  | "success"
  | "brand"
  | "muted"
  // AUTM-948 — the semantic trio. Solid, not tinted.
  | "act"
  | "flight"
  | "money"
  // Glass companion for a chip sitting on the gradient ground.
  | "glass";

const TONES: Record<Tone, string> = {
  neutral:
    "bg-[var(--surface-elevated)] text-[var(--text-strong)] ring-1 ring-inset ring-[var(--border-subtle)]",
  success:
    "bg-[rgba(183,225,73,0.18)] text-[var(--intent-success-text)] ring-1 ring-inset ring-[rgba(183,225,73,0.6)]",
  brand:
    "bg-[var(--accent-tint)] text-[var(--accent)] ring-1 ring-inset ring-[var(--accent-border-soft)]",
  muted:
    "bg-[var(--surface-elevated)] text-[var(--text-muted)] ring-1 ring-inset ring-[var(--border-subtle)]",

  // ─── AUTM-948: purple ACTS · aqua IN FLIGHT · lime DONE / money-in ───
  // Rule 3 is "solid fills on status, never a tint, even against glass".
  // `success` and `brand` above are tints and stay only because consumers
  // pin them; these are what new status code should reach for. One accent
  // per zone — aqua and lime never compete inside the same block.
  act: "bg-[var(--act-fill)] text-[var(--on-act)]",
  flight: "bg-[var(--flight-fill)] text-[var(--on-flight)]",
  money: "bg-[var(--money-fill)] text-[var(--on-money)]",

  // For a chip sitting directly on the gradient ground rather than on a
  // card. No backdrop-filter: a chip is small and there are usually several
  // per row, and each blurring element is its own GPU surface.
  glass:
    "bg-[var(--glass-fill)] text-[var(--text-strong)] ring-1 ring-inset ring-[var(--glass-edge)] shadow-[inset_0_1px_0_var(--glass-hi)]",
};

const DOT_COLORS: Record<Tone, string> = {
  neutral: "bg-[var(--text-subtle)]",
  success: "bg-[#5d9a1f]",
  brand: "bg-[var(--color-autara-purple)]",
  muted: "bg-[var(--text-subtle)]",
  // On a solid fill the dot has to read against the FILL, so it takes the
  // on-colour rather than the accent it is already sitting on.
  act: "bg-[var(--on-act)]",
  flight: "bg-[var(--on-flight)]",
  money: "bg-[var(--on-money)]",
  glass: "bg-[var(--text-subtle)]",
};

export interface MetaChipProps {
  children: ReactNode;
  tone?: Tone;
  /** Status dot rendered before the label. Use sparingly. */
  dot?: boolean;
  /** Inline icon rendered before the label (after the dot, if any). */
  icon?: ReactNode;
  className?: string;
}

export function MetaChip({
  children,
  tone = "neutral",
  dot,
  icon,
  className = "",
}: MetaChipProps) {
  return (
    <span
      /* AUTM-948 — `text-[0.6875rem]` is the old `text-[11px]`, unfrozen so
         the chip scales with OS Dynamic Type. Identical at a 16px root.

         `rounded-autara-sm` (8px), not `rounded-full`: round is reserved for
         avatars and indicator dots (Don, 2026-09-01). One step tighter than
         the 14px shared control radius because this chip is ~26px tall — at
         that height a 14px radius clamps to height/2 and renders as a pill
         regardless, so the shared token cannot express the rule here. A
         smaller control inside a larger container is the documented
         exception. */
      className={`inline-flex items-center gap-1.5 rounded-autara-sm px-3 py-[5px] text-[0.6875rem] font-medium uppercase tracking-[0.12em] ${TONES[tone]} ${className}`}
    >
      {dot ? (
        <span
          aria-hidden="true"
          className={`h-1.5 w-1.5 rounded-full ${DOT_COLORS[tone]}`}
        />
      ) : null}
      {icon}
      {children}
    </span>
  );
}
