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
 * Fully-rounded, not the 8px `rounded-lg` this used to carry.
 *
 * Don, 2026-08-16: the buttons read square and the UI should look smoother.
 * A pill is the current convention for a primary action across the apps we
 * benchmark against (Linear, Vercel, Stripe, and iOS 26 system controls), and
 * it is the one radius that stays correct at every height — sm 36px, md 44px,
 * lg 48px and the 40px icon button all resolve to a true pill without a
 * per-size value to keep in sync.
 *
 * Deliberately on BASE rather than per-variant: an outline button next to a
 * filled one with different corners is the thing that actually reads as
 * unfinished. Consumers that genuinely need a squarer corner can still pass
 * `className` — `cn()` merges it and the later class wins.
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
const BASE =
  "inline-flex select-none items-center justify-center gap-2 text-center break-words rounded-full font-medium transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0";

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
  sm: "min-h-9 px-[min(1rem,5vw)] py-1.5 text-[0.8125rem]",
  md: "min-h-11 px-[min(1.25rem,6vw)] py-2 text-sm",
  lg: "min-h-12 px-[min(1.5rem,7vw)] py-2.5 text-[0.9375rem]",
  icon: "h-10 w-10 shrink-0 p-0",
};

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    "bg-[var(--accent-fill)] text-[var(--on-accent)] hover:-translate-y-0.5 hover:bg-[var(--accent-fill-hover)] active:translate-y-0 focus-visible:ring-[var(--accent)]/35",
  dark:
    "bg-[var(--cta-fill)] text-[var(--on-cta)] hover:-translate-y-0.5 hover:bg-[var(--cta-fill-hover)] active:translate-y-0 focus-visible:ring-[var(--cta-fill)]/35",
  outline:
    "border border-[var(--border-subtle)] bg-[var(--surface)] text-[var(--text-strong)] hover:-translate-y-0.5 hover:border-[var(--border-hover)] hover:bg-[var(--surface-elevated)] active:translate-y-0 focus-visible:ring-[var(--accent)]/30",
  secondary:
    "bg-[var(--surface-elevated)] text-[var(--text-strong)] hover:-translate-y-0.5 hover:bg-[var(--accent-tint)] active:translate-y-0 focus-visible:ring-[var(--accent)]/30",
  ghost:
    "bg-transparent text-[var(--text-muted)] hover:text-[var(--text-strong)] hover:bg-[var(--surface-elevated)] focus-visible:ring-[var(--accent)]/25",
  destructive:
    "bg-rose-600 text-white hover:-translate-y-0.5 hover:bg-rose-700 active:translate-y-0 focus-visible:ring-rose-500/35",
  link:
    "text-[var(--accent)] underline-offset-4 hover:underline bg-transparent focus-visible:ring-[var(--accent)]/30",

  // ─── Acid lime — high-pop CTA on cream surfaces ──────────────────────
  // Dark-surface companion deferred to a future PR.
  acid:
    "bg-[var(--color-autara-lime-bright)] text-[#0E0A1A] hover:-translate-y-0.5 hover:bg-[#c2ee3a] active:translate-y-0 focus-visible:ring-[var(--color-autara-lime-bright)]/55",

  // ─── v1.0.x backwards-compat aliases ─────────────────────────────────
  "light-primary":
    "bg-[var(--accent-fill)] text-[var(--on-accent)] hover:-translate-y-0.5 hover:bg-[var(--accent-fill-hover)] active:translate-y-0 focus-visible:ring-[var(--accent)]/35",
  "light-outline":
    "border border-[var(--border-subtle)] bg-[var(--surface)] text-[var(--text-strong)] hover:-translate-y-0.5 hover:border-[var(--border-hover)] hover:bg-[var(--surface-elevated)] active:translate-y-0 focus-visible:ring-[var(--accent)]/30",
  "light-ghost":
    "bg-transparent text-[var(--text-muted)] hover:text-[var(--text-strong)] hover:bg-[var(--surface-elevated)] focus-visible:ring-[var(--accent)]/25",
  "light-secondary":
    "bg-[var(--surface-elevated)] text-[var(--text-strong)] hover:-translate-y-0.5 hover:bg-[var(--accent-tint)] active:translate-y-0 focus-visible:ring-[var(--accent)]/30",
  "light-destructive":
    "bg-rose-600 text-white hover:-translate-y-0.5 hover:bg-rose-700 active:translate-y-0 focus-visible:ring-rose-500/35",
  "light-link":
    "text-[var(--accent)] underline-offset-4 hover:underline bg-transparent focus-visible:ring-[var(--accent)]/30",
  light:
    "border border-[var(--border-subtle)] bg-[var(--surface)] text-[var(--text-strong)] hover:-translate-y-0.5 hover:border-[var(--border-hover)] hover:bg-[var(--surface-elevated)] active:translate-y-0 focus-visible:ring-[var(--accent)]/30",
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
