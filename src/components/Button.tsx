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
  // v1.0.x legacy names — backwards-compat aliases.
  | "light"
  | "light-primary"
  | "light-outline"
  | "light-ghost"
  | "light-secondary"
  | "light-destructive"
  | "light-link";

type Size = "sm" | "md" | "lg" | "icon" | "default";

const BASE =
  "inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0";

const SIZES: Record<Exclude<Size, "default">, string> = {
  sm: "h-9 px-4 text-[13px]",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-[15px]",
  icon: "h-10 w-10 p-0",
};

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    "bg-[var(--color-autara-purple)] text-white hover:-translate-y-0.5 hover:bg-[#3D1595] active:translate-y-0 focus-visible:ring-[var(--color-autara-purple)]/35",
  dark:
    "bg-[var(--text-strong)] text-white hover:-translate-y-0.5 hover:bg-[#2a2238] active:translate-y-0 focus-visible:ring-[var(--text-strong)]/35",
  outline:
    "border border-[var(--border-subtle)] bg-[var(--surface)] text-[var(--text-strong)] hover:-translate-y-0.5 hover:border-[rgba(78,27,189,0.35)] hover:bg-[var(--surface-elevated)] active:translate-y-0 focus-visible:ring-[var(--color-autara-purple)]/30",
  secondary:
    "bg-[var(--surface-elevated)] text-[var(--text-strong)] hover:-translate-y-0.5 hover:bg-[rgba(78,27,189,0.06)] active:translate-y-0 focus-visible:ring-[var(--color-autara-purple)]/30",
  ghost:
    "bg-transparent text-[var(--text-muted)] hover:text-[var(--text-strong)] hover:bg-[var(--surface-elevated)] focus-visible:ring-[var(--color-autara-purple)]/25",
  destructive:
    "bg-rose-600 text-white hover:-translate-y-0.5 hover:bg-rose-700 active:translate-y-0 focus-visible:ring-rose-500/35",
  link:
    "text-[var(--color-autara-purple)] underline-offset-4 hover:underline bg-transparent focus-visible:ring-[var(--color-autara-purple)]/30",

  // ─── v1.0.x backwards-compat aliases ─────────────────────────────────
  "light-primary":
    "bg-[var(--color-autara-purple)] text-white hover:-translate-y-0.5 hover:bg-[#3D1595] active:translate-y-0 focus-visible:ring-[var(--color-autara-purple)]/35",
  "light-outline":
    "border border-[var(--border-subtle)] bg-[var(--surface)] text-[var(--text-strong)] hover:-translate-y-0.5 hover:border-[rgba(78,27,189,0.35)] hover:bg-[var(--surface-elevated)] active:translate-y-0 focus-visible:ring-[var(--color-autara-purple)]/30",
  "light-ghost":
    "bg-transparent text-[var(--text-muted)] hover:text-[var(--text-strong)] hover:bg-[var(--surface-elevated)] focus-visible:ring-[var(--color-autara-purple)]/25",
  "light-secondary":
    "bg-[var(--surface-elevated)] text-[var(--text-strong)] hover:-translate-y-0.5 hover:bg-[rgba(78,27,189,0.06)] active:translate-y-0 focus-visible:ring-[var(--color-autara-purple)]/30",
  "light-destructive":
    "bg-rose-600 text-white hover:-translate-y-0.5 hover:bg-rose-700 active:translate-y-0 focus-visible:ring-rose-500/35",
  "light-link":
    "text-[var(--color-autara-purple)] underline-offset-4 hover:underline bg-transparent focus-visible:ring-[var(--color-autara-purple)]/30",
  light:
    "border border-[var(--border-subtle)] bg-[var(--surface)] text-[var(--text-strong)] hover:-translate-y-0.5 hover:border-[rgba(78,27,189,0.35)] hover:bg-[var(--surface-elevated)] active:translate-y-0 focus-visible:ring-[var(--color-autara-purple)]/30",
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
