import type { ReactNode } from "react";

/**
 * MetaChip — the inline pill primitive for credibility + status surfacing.
 * Used heavily on customer-web's merchant profile page (Open today,
 * X services, Comes to you · 10km, Highly rated, etc.).
 *
 * Tones:
 *   - neutral  — SOLID achromatic slate. The default (AUTM-974)
 *   - muted    — no chrome at all: muted ink, no fill. De-emphasis
 *   - success  — SOLID lime. Alias of `money`, kept for pinned consumers
 *   - brand    — SOLID purple. Alias of `act`, kept for pinned consumers
 *   - act      — SOLID purple. Something is waiting on the user (AUTM-948)
 *   - flight   — SOLID aqua. Confirmed, running, money on its way
 *   - money    — SOLID lime. Done, paid, money in
 *   - glass    — translucent, for a chip on the gradient ground
 *
 * ─── AUTM-974: every tone is now solid ──────────────────────────────────
 *
 * Four of the eight were outlined boxes. `neutral` and `muted` were
 * `--surface-elevated` with `ring-1 ring-inset` — a fill 1.05:1 from the card,
 * so the RING was the chip; `success` and `brand` were a pastel tint PLUS a
 * ring, which is the pattern Don has now rejected three times (AUTM-211 for
 * Badge, AUTM-969 for ModeChip, and on 2026-09-01 for the whole product:
 * "no outline buttons or sections, boxes as we discussed. everything should
 * be solid").
 *
 * What each became, and why:
 *
 *   `neutral` takes `--neutral-fill`, the achromatic member of the
 *   act/flight/money family added in AUTM-969. That token exists precisely
 *   because there was no non-semantic solid to reach for, which is why every
 *   neutral chip in the library reached for a ring instead. It is not a slip
 *   in eight components; it was one missing token.
 *
 *   `muted` gets NO fill. De-emphasis has to be less chrome, not a fainter
 *   box — a dimmer fill under dimmer ink is how you end up measuring 3:1.
 *   It keeps the chip's type and spacing, so it still reads as a chip.
 *
 *   `success` and `brand` were the tinted twins of `money` and `act`. A tint
 *   is not a variant, so they render as the solid they always meant. They
 *   stay in the union because consumers pin them by name.
 *
 *   `glass` is untouched. Its hairline is the MATERIAL of a translucent
 *   surface — required by rule 2 alongside the blur and the inset top
 *   highlight — and rule 4 exempts exactly that.
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
  // AUTM-974 — solid, and no ring on any of them. See the header.
  neutral: "bg-[var(--neutral-fill)] text-[var(--on-neutral)]",
  // Deliberately chrome-less: de-emphasis is less, not fainter.
  // Keeps the chip's padding so it still lines up with its solid siblings in
  // a row — the tone strings are concatenated into a template literal, not
  // merged through `cn()`, so a `px-0` here would fight `px-3` on stylesheet
  // order rather than class order and win or lose by accident.
  muted: "bg-transparent text-[var(--text-muted)]",
  // Aliases of `money` and `act` — the tinted versions of the same idea.
  success: "bg-[var(--money-fill)] text-[var(--on-money)]",
  brand: "bg-[var(--act-fill)] text-[var(--on-act)]",

  // ─── AUTM-948: purple ACTS · aqua IN FLIGHT · lime DONE / money-in ───
  // Rule 4 is "solid fills on status, never a tint, and never an outline".
  // `success` and `brand` above now resolve to `money` and `act`; these are
  // the names new status code should reach for. One accent per zone — aqua
  // and lime never compete inside the same block.
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
  // On a solid fill the dot reads against the FILL, so it takes that fill's
  // on-colour. `muted` has no fill, so it stays on the ink ladder.
  neutral: "bg-[var(--on-neutral)]",
  success: "bg-[var(--on-money)]",
  brand: "bg-[var(--on-act)]",
  muted: "bg-[var(--text-muted)]",
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
