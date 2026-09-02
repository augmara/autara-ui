import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "../lib/cn";

/**
 * Button — the single canonical Autara CTA primitive.
 *
 * Merged from the v1.0.x `Button` and the v1.1.0-alpha `BrandButton`
 * (the latter was discovered to be doing the same job, so it's now
 * just a re-export of this component — see `BrandButton.tsx`).
 *
 * Aesthetic rules:
 *   - `primary`     brand purple solid — on dark/photo surfaces
 *   - `dark`        solid --text-strong — PRIMARY action on cream
 *   - `outline`     hairline border on white — secondary action
 *   - `secondary`   --surface-elevated fill — tertiary
 *   - `ghost`       transparent, hover bg — inline-like
 *   - `destructive` rose — cancel / delete
 *   - `link`        underline text only — text-like CTAs
 *   - `glass`       translucent — a secondary action sitting ON the
 *                   gradient ground or on a glass panel
 *
 * Sizes: `sm` (36) → `md`/`default` (44) → `lg` (48) → `icon` (40²).
 *
 * Polymorphic via Radix `Slot` (asChild). Compose with a framework Link
 * via `asChild`. autara-ui never imports next/link or react-router-dom.
 */

type Variant =
  | "primary"
  | "dark"
  | "outline"
  | "secondary"
  | "ghost"
  | "destructive"
  | "link"
  | "acid"
  | "glass"
  // v1.0.x legacy names — backwards-compat aliases.
  | "light"
  | "light-primary"
  | "light-outline"
  | "light-ghost"
  | "light-secondary"
  | "light-destructive"
  | "light-link";

type Size = "sm" | "md" | "lg" | "icon" | "default";

/**
 * The SHARED CONTROL RADIUS — `--radius-autara-md`, 14px. Not a pill.
 *
 * Don, 2026-09-01: a button and the input beside it are one control group —
 * type, then act. A pill next to a rounded rectangle reads as two unrelated
 * objects that happen to be adjacent. Matching the radius makes them read as
 * a pair. This reverses the 2026-08-16 call that made buttons fully round
 * ("the buttons read square"); the answer to square was never a pill, it was
 * the input's own radius.
 *
 * The shape language is now two families, which is what makes it enforceable:
 *
 *   - SHARED RADIUS — input, button, chip, card, panel. Means "a surface or
 *     a control". Cards may go one step larger (16px); chips one step
 *     smaller (8px), because 14px on a 26px-tall chip clamps to height/2 and
 *     renders as a pill anyway.
 *   - ROUNDED PARALLELOGRAM — status, and only status. That is Badge.
 *
 * What that buys, and what must not be spent: the only fully-round things
 * left are AVATARS and INDICATOR DOTS, so round now means "a person or a
 * state light" and never "an action". Do not reach for `rounded-full` on
 * anything else.
 *
 * Same-height elements take the same radius, which is why `lg` overrides to
 * 16px: `.field-input--lg` is 48px at `--radius-autara-lg`, and the 48px
 * button sitting next to it has to match. `sm`, `md` and `icon` all pair
 * with the 44px `.field-input` at 14px.
 *
 * Deliberately on BASE rather than per-variant: an outline button next to a
 * filled one with different corners is the thing that actually reads as
 * unfinished. Consumers that genuinely need a different corner can still
 * pass `className` — `cn()` merges it and the later class wins.
 */
/**
 * AUTM-915 — `whitespace-nowrap` was in BASE while every size pinned a
 * fixed `h-*`. The pairing means a label can neither wrap nor grow, so at
 * a large text scale it simply runs outside its container. Measured on
 * merchant-web /onboarding/complete at 375px with a 32px root (200% text
 * scale): "Go to your dashboard" rendered 372px wide inside a 183px
 * content box — roughly half the label was off screen.
 *
 * `min-h-*` + a vertical pad keeps the rendered height identical at normal
 * scale (a single line of text-sm is 20px, and 20 + py-2 = 36 < 44, so md
 * still lays out at exactly 44px) while letting the box grow once the
 * label needs two lines.
 *
 * `whitespace-nowrap` is not gone, it is opt-in: pass it via `className`
 * and tailwind-merge lets it win. Do that for single-word labels in a
 * fixed-width toolbar, not for sentence CTAs.
 */
/**
 * AUTM-977 — the focus ring lives on BASE, not per variant.
 *
 * Every variant used to carry its own `focus-visible:ring-<colour>/<alpha>` at
 * 25-55% — eight different rings for one job. At 35% over the surface behind
 * the control the ring measures roughly 1.9:1, under the 3:1 WCAG 2.4.11 asks
 * of a focus indicator, and the alpha meant the ring's contrast changed with
 * whatever the button happened to be sitting on.
 *
 * A focus indicator answers one question — "where am I" — so it is one
 * signature, the same on a rose destructive button and an acid lime one. That
 * is also how every platform draws it. Matching the ring to the control's own
 * colour is the instinct that produced purple-on-purple at 1.0:1 in the
 * merchant-mobile Today pass.
 *
 * Three parts, and all three are load-bearing:
 *
 *   ring-[var(--accent)]              full strength, the TEXT-grade purple —
 *                                     9.1:1 light / 5.7:1 dark on the canvas
 *   ring-offset-2                     a 2px band, which is what keeps the
 *                                     ring off a solid accent fill
 *   ring-offset-[var(--background)]   the band is painted in the colour
 *                                     actually behind the button
 *
 * The offset COLOUR is the part that looks optional and is not: Tailwind's
 * `--tw-ring-offset-color` falls back to `#fff`, so `ring-offset-2` on its own
 * draws a white band — a cream halo inside a dark surface.
 *
 * A variant may still override the ring via `cn()` if it genuinely sits on its
 * own ground (Tabs does this with `--surface-elevated`). Full strength and a
 * named offset are not optional; `solid-emphasis.test.ts` enforces both across
 * the library.
 */
const BASE =
  // AUTM-915 keeps `text-center break-words` and drops `whitespace-nowrap` —
  // that pair was the 200%-text-scale overflow. AUTM-948 sets the radius:
  // buttons are not pills, they take the rung `.field-input` uses.
  "inline-flex select-none items-center justify-center gap-2 text-center break-words min-w-fit rounded-autara-md font-medium transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0";

/*
 * `min-w-fit` is load-bearing, and subtle enough to be deleted by accident.
 *
 * AUTM-915 removed `whitespace-nowrap` so a label can wrap instead of
 * overflowing at 200% text scale. That also dropped the button's min-content
 * width from the whole phrase to its longest word, and a flex row is free to
 * shrink an item to its automatic minimum — so "New booking" beside a
 * flex-1 search input wrapped to two lines and grew taller than the input,
 * at ordinary text size, with room to spare (AUTM-955).
 *
 * `min-width: fit-content` resolves to max-content while the row has space
 * (the phrase holds one line) and collapses to the available space when it
 * genuinely does not (the label still wraps rather than overflowing). It
 * fixes the regression without giving back what AUTM-915 bought.
 *
 * `shrink-0` is the tempting one-word alternative. Don't: it would overflow
 * the row instead of wrapping, and a page that scrolls sideways is a
 * cross-stack rule violation, not a smaller bug.
 */
/*
 * Horizontal padding is clamped against the viewport as well as the root
 * font size. Padding in rem doubles along with the text at 200% scale, so
 * on a 375px screen an un-clamped px-5 eats 80px of a 183px box and the
 * label wraps into a column one word wide. `min()` picks the rem value at
 * every normal-scale viewport (at 375px, 6vw = 22.5px > px-5's 20px) and
 * only yields once the padding would otherwise crowd out the label.
 *
 * This is merchant-web's shipped WRAPPING_LABEL workaround, moved into the
 * primitive. Consumers having to remember an override is the usual sign
 * the default is wrong.
 */
const SIZES: Record<Exclude<Size, "default">, string> = {
  // min-h + py + clamped px is AUTM-915: the label must WRAP and the box grow,
  // never overflow, at 200% text scale. A fixed `h-*` reintroduces that bug.
  sm: "min-h-9 px-[min(1rem,5vw)] py-1.5 text-[0.8125rem]",
  md: "min-h-11 px-[min(1.25rem,6vw)] py-2 text-sm",
  // AUTM-948: at 48px this pairs with `.field-input--lg` (48px / 16px) rather
  // than with the 44px field. Same-height elements, same radius.
  lg: "min-h-12 rounded-autara-lg px-[min(1.5rem,7vw)] py-2.5 text-[0.9375rem]",
  icon: "h-10 w-10 shrink-0 p-0",
};

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    "bg-[var(--accent-fill)] text-[var(--on-accent)] hover:-translate-y-0.5 hover:bg-[var(--accent-fill-hover)] active:translate-y-0",
  dark:
    "bg-[var(--cta-fill)] text-[var(--on-cta)] hover:-translate-y-0.5 hover:bg-[var(--cta-fill-hover)] active:translate-y-0",
  outline:
    "border border-[var(--border-subtle)] bg-[var(--surface)] text-[var(--text-strong)] hover:-translate-y-0.5 hover:border-[var(--border-hover)] hover:bg-[var(--surface-elevated)] active:translate-y-0",
  secondary:
    "bg-[var(--surface-elevated)] text-[var(--text-strong)] hover:-translate-y-0.5 hover:bg-[var(--accent-tint)] active:translate-y-0",
  ghost:
    "bg-transparent text-[var(--text-muted)] hover:text-[var(--text-strong)] hover:bg-[var(--surface-elevated)]",
  destructive:
    "bg-rose-600 text-white hover:-translate-y-0.5 hover:bg-rose-700 active:translate-y-0",
  link:
    "text-[var(--accent)] underline-offset-4 hover:underline bg-transparent",

  // ─── Glass — a secondary action on the gradient ground ───────────────
  // AUTM-948. `outline` paints an OPAQUE `--surface` fill, so on a glass
  // panel or over the gradient ground it punches a white slab through the
  // material — the same failure mode ErrorCard's white retry button had in
  // dark mode (AUTM-936). This is the outline button's translucent twin.
  //
  // Buttons keep NORMAL GEOMETRY. Rule 1 puts the skew on pills and status
  // only; a skewed button was rejected. The pill radius from BASE stands.
  //
  // No `backdrop-filter` here on purpose: a button is small, there can be
  // many per screen, and each blurring element is its own GPU surface. The
  // fill and the inset highlight carry the material; the panel underneath
  // supplies the blur.
  glass:
    "border border-[var(--glass-edge)] bg-[var(--glass-fill)] text-[var(--text-strong)] shadow-[inset_0_1px_0_var(--glass-hi)] hover:-translate-y-0.5 hover:border-[var(--glass-edge-hi)] hover:bg-[var(--glass-fill-strong)] active:translate-y-0",

  // ─── Acid lime — high-pop CTA on cream surfaces ──────────────────────
  // Dark-surface companion deferred to a future PR.
  acid:
    "bg-[var(--color-autara-lime-bright)] text-[#0E0A1A] hover:-translate-y-0.5 hover:bg-[#c2ee3a] active:translate-y-0",

  // ─── v1.0.x backwards-compat aliases ─────────────────────────────────
  "light-primary":
    "bg-[var(--accent-fill)] text-[var(--on-accent)] hover:-translate-y-0.5 hover:bg-[var(--accent-fill-hover)] active:translate-y-0",
  "light-outline":
    "border border-[var(--border-subtle)] bg-[var(--surface)] text-[var(--text-strong)] hover:-translate-y-0.5 hover:border-[var(--border-hover)] hover:bg-[var(--surface-elevated)] active:translate-y-0",
  "light-ghost":
    "bg-transparent text-[var(--text-muted)] hover:text-[var(--text-strong)] hover:bg-[var(--surface-elevated)]",
  "light-secondary":
    "bg-[var(--surface-elevated)] text-[var(--text-strong)] hover:-translate-y-0.5 hover:bg-[var(--accent-tint)] active:translate-y-0",
  "light-destructive":
    "bg-rose-600 text-white hover:-translate-y-0.5 hover:bg-rose-700 active:translate-y-0",
  "light-link":
    "text-[var(--accent)] underline-offset-4 hover:underline bg-transparent",
  light:
    "border border-[var(--border-subtle)] bg-[var(--surface)] text-[var(--text-strong)] hover:-translate-y-0.5 hover:border-[var(--border-hover)] hover:bg-[var(--surface-elevated)] active:translate-y-0",
};

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  variant?: Variant;
  size?: Size;
  /** Stretch to fill the container's width. */
  fullWidth?: boolean;
  /** Icon rendered before the label. */
  leadingIcon?: ReactNode;
  /** Icon rendered after the label. */
  trailingIcon?: ReactNode;
  children: ReactNode;
  /** Compose with another component (e.g. framework Link) via Radix Slot. */
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "primary",
      size = "md",
      fullWidth,
      leadingIcon,
      trailingIcon,
      asChild,
      children,
      className,
      type,
      ...rest
    },
    ref,
  ) {
    const Comp = asChild ? Slot : "button";
    const resolvedSize = size === "default" ? "md" : size;
    return (
      <Comp
        ref={ref}
        className={cn(
          BASE,
          SIZES[resolvedSize],
          VARIANT_CLASSES[variant],
          fullWidth && "w-full",
          className,
        )}
        {...(asChild ? rest : { type: type ?? "button", ...rest })}
      >
        {asChild ? (
          children
        ) : (
          <>
            {leadingIcon}
            {children}
            {trailingIcon}
          </>
        )}
      </Comp>
    );
  },
);

Button.displayName = "Button";

/**
 * Legacy CVA-style `buttonVariants` helper — preserved for v1.0.x
 * consumers. Returns the className for a variant + size combination.
 */
export function buttonVariants(opts?: {
  variant?: Variant;
  size?: Size;
  className?: string;
}): string {
  const { variant = "primary", size = "md", className } = opts ?? {};
  const resolvedSize = size === "default" ? "md" : size;
  return cn(BASE, SIZES[resolvedSize], VARIANT_CLASSES[variant], className);
}
