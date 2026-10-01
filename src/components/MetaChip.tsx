import type { ReactNode } from "react";

/**
 * MetaChip — the inline pill primitive for credibility + status surfacing.
 * Used heavily on customer-web's merchant profile page (Open today,
 * X services, Comes to you · 10km, Highly rated, etc.).
 *
 * AUTM-1594 — canvas v44 "Default and meta": a 28px pill, 13px Medium, in
 * the consumer's case. Tones (the sheet's palette):
 *   - neutral  — band with ink. The default
 *   - muted    — no chrome at all: muted ink, no fill. De-emphasis
 *   - success  — lime. Alias of `money`, kept for pinned consumers
 *   - brand    — brand purple. Alias of `act`, kept for pinned consumers
 *   - act      — brand purple. Something is waiting on the user
 *   - flight   — aqua. Confirmed, running, money on its way
 *   - money    — lime. Done, paid, money in, Default
 *   - glass    — band; the sheet has no glass, so a glass chip is band
 *
 * The history below explains how the tones became solid; the sheet keeps
 * that, and moves the shape to a pill and the label out of uppercase.
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
 *   - (Retired by AUTM-1594 and AUTM-1483: the 11px letterspaced uppercase
 *     this line used to describe. Labels now render in the case passed.)
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

// AUTM-1594 — canvas v44 "Default and meta": the sheet's band and lime
// pills. Neutral is band with ink, not the slate fill it was; the status
// trio takes the palette (brand, aqua, lime) as Badge does.
const TONES: Record<Tone, string> = {
  // AUTM-974 — solid, and no ring on any of them. See the header.
  neutral: "bg-[var(--band)] text-[var(--text-strong)]",
  // Deliberately chrome-less: de-emphasis is less, not fainter.
  // Keeps the chip's padding so it still lines up with its solid siblings in
  // a row — the tone strings are concatenated into a template literal, not
  // merged through `cn()`, so a `px-0` here would fight `px-3` on stylesheet
  // order rather than class order and win or lose by accident.
  muted: "bg-transparent text-[var(--text-muted)]",
  // Aliases of `money` and `act` — the tinted versions of the same idea.
  success: "bg-[var(--lime)] text-[var(--on-lime)]",
  brand: "bg-[var(--brand)] text-[var(--on-brand)]",

  // ─── AUTM-948: purple ACTS · aqua IN FLIGHT · lime DONE / money-in ───
  // Rule 4 is "solid fills on status, never a tint, and never an outline".
  // `success` and `brand` above now resolve to `money` and `act`; these are
  // the names new status code should reach for. One accent per zone — aqua
  // and lime never compete inside the same block.
  act: "bg-[var(--brand)] text-[var(--on-brand)]",
  flight: "bg-[var(--aqua)] text-[var(--on-aqua)]",
  money: "bg-[var(--lime)] text-[var(--on-lime)]",

  // For a chip sitting directly on the gradient ground rather than on a
  // card. No backdrop-filter: a chip is small and there are usually several
  // per row, and each blurring element is its own GPU surface.
  // The sheet has no glass; on paper a glass chip renders as band.
  glass: "bg-[var(--band)] text-[var(--text-strong)]",
};

const DOT_COLORS: Record<Tone, string> = {
  // On a solid fill the dot reads against the FILL, so it takes that fill's
  // on-colour. `muted` has no fill, so it stays on the ink ladder.
  neutral: "bg-[var(--text-strong)]",
  success: "bg-[var(--on-lime)]",
  brand: "bg-[var(--on-brand)]",
  muted: "bg-[var(--text-muted)]",
  // On a solid fill the dot has to read against the FILL, so it takes the
  // on-colour rather than the accent it is already sitting on.
  act: "bg-[var(--on-brand)]",
  flight: "bg-[var(--on-aqua)]",
  money: "bg-[var(--on-lime)]",
  glass: "bg-[var(--text-strong)]",
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
      /* AUTM-1594 — canvas v44: a 28px pill, 13px Medium, in the case the
         consumer passes. This closes AUTM-1483 for MetaChip: no letterspaced
         uppercase. rem throughout, and `min-h`, so it grows with text. The
         pill supersedes the 2026-09-01 8px chip rung. */
      className={`inline-flex min-h-7 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-0.5 text-[0.8125rem] font-medium leading-tight ${TONES[tone]} ${className}`}
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
