import { forwardRef, type ReactNode } from "react";
import { Button, type ButtonProps } from "./Button";
import { cn } from "../lib/cn";

/**
 * IconButton — the icon disc (AUTM-1594, canvas v44 "Icon disc"; AUTM-1756).
 *
 * A round action holding an icon and nothing else. `label` is required and
 * becomes the accessible name, because every icon-only control needs one and
 * an optional prop is one that gets forgotten.
 *
 * AUTM-1756 (Don, 2026-10-05): "make it large and highlight it like a rounded
 * one, not only a cross", then, of a bare sidebar chevron, "every button
 * should have that vibe, don't show only the icon". So the disc is always
 * FILLED, never a bare glyph and never a faint ring:
 *
 *   - `tone="neutral"` (default) — the Wise pattern. On light grounds a soft
 *     lavender grey disc (`--icon-disc`) with an ink glyph; on dark grounds a
 *     disc a step lighter than the surface with a white glyph. (Don rejected
 *     a mid grey disc with a white glyph: "too much dark on white screen".)
 *     A dark island in a light app, such as an ink sidebar or the inverse
 *     toast, gets the dark disc by carrying `data-theme="dark"`.
 *   - `tone="onbrand"` — a white disc with a brand-deep glyph, for purple
 *     grounds (brand, brand-deep, the hero).
 *   - `tone="strong"` — the ink disc (white in dark), for the one icon action
 *     that must lead.
 *
 * The glyph is what identifies the control, so it is held to 4.5:1 on its
 * disc; the disc is held to a visibility floor on its ground rather than to
 * 3:1 (IconButton.colour.test.ts says why).
 *
 * Sizes: `md` (default) is 44px, and 48px under a coarse pointer (a finger);
 * `lg` is 48px everywhere. The glyph is 20px in `md` and 24px in `lg`,
 * whatever size the caller drew it at, so a 14px cross cannot creep back.
 *
 * Hover and press step the fill one token each (darker in light, lighter in
 * dark); the press also scales to 97% (Button's `motion-press`). Focus is
 * Button's one ring.
 * Disabled and busy keep the real colour (AUTM-1719).
 *
 * `variant` is the pre-1756 name and still works: `quiet` and `ghost` (both
 * read as bare on many grounds) now draw the neutral disc, `ondeep` the
 * on-brand one, `strong` the strong one.
 *
 * `badge` sits on the disc's top-right edge, for a count on the bell. Say the
 * count in `label` too ("Notifications, 12 unread"): the badge is drawn, the
 * label is what is heard.
 */
export type IconButtonTone = "neutral" | "onbrand" | "strong";
export type IconButtonSize = "md" | "lg";

export interface IconButtonProps
  extends Omit<ButtonProps, "children" | "size" | "leadingIcon" | "trailingIcon" | "fullWidth" | "variant"> {
  /** The icon. Drawn at 20px (`md`) or 24px (`lg`) whatever its own size. */
  icon: ReactNode;
  /** Accessible name. Required: the disc has no visible text. */
  label: string;
  /** The disc's fill. Default `neutral`. */
  tone?: IconButtonTone;
  /** `md` 44px (48px to a finger), `lg` 48px. Default `md`. */
  size?: IconButtonSize;
  /** @deprecated use `tone`. `quiet` and `ghost` draw `neutral`, `ondeep` draws `onbrand`. */
  variant?: "quiet" | "strong" | "ondeep" | "ghost";
  /** A count or dot drawn on the disc's top-right edge. */
  badge?: ReactNode;
}

const TONE: Record<IconButtonTone, string> = {
  neutral:
    "bg-[var(--icon-disc)] text-[var(--on-icon-disc)] not-disabled:hover:bg-[var(--icon-disc-hover)] not-disabled:active:bg-[var(--icon-disc-press)]",
  onbrand:
    "bg-[var(--icon-disc-onbrand)] text-[var(--on-icon-disc-onbrand)] not-disabled:hover:bg-[var(--icon-disc-onbrand-hover)] not-disabled:active:bg-[var(--icon-disc-onbrand-press)]",
  strong:
    "bg-[var(--strong)] text-[var(--on-strong)] not-disabled:hover:bg-[var(--strong-hover)] not-disabled:active:bg-[var(--strong-hover)]",
};

/* The disc and the glyph inside it. `pointer-coarse:` is Tailwind 4.1's
   `@media (pointer: coarse)`: a finger gets 48px where a mouse gets 44. */
const SIZE: Record<IconButtonSize, string> = {
  md: "size-11 pointer-coarse:size-12 [&_svg]:size-5",
  lg: "size-12 [&_svg]:size-6",
};

/** The tone a pre-1756 `variant` now draws. */
export function resolveIconButtonTone(tone: IconButtonTone | undefined, variant: IconButtonProps["variant"]): IconButtonTone {
  if (tone) return tone;
  if (variant === "strong") return "strong";
  if (variant === "ondeep") return "onbrand";
  return "neutral";
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    { icon, label, tone, size = "md", variant, badge, className, title, ...rest },
    ref,
  ) {
    const resolved = resolveIconButtonTone(tone, variant);
    return (
      <Button
        ref={ref}
        // The ghost variant is the transparent base; the tone paints it.
        variant="ghost"
        size="icon"
        aria-label={label}
        title={title ?? label}
        data-tone={resolved}
        className={cn(TONE[resolved], SIZE[size], badge != null && "relative", className)}
        {...rest}
      >
        {icon}
        {badge != null && (
          <span aria-hidden="true" className="pointer-events-none absolute -right-1 -top-0.5">
            {badge}
          </span>
        )}
      </Button>
    );
  },
);

IconButton.displayName = "IconButton";

/** The cross: drawn on a 24 grid, scaled to the disc's glyph size. */
export function CloseGlyph() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.3} strokeLinecap="round">
      <path d="M5.5 5.5l13 13M18.5 5.5l-13 13" />
    </svg>
  );
}

export interface CloseButtonProps extends Omit<IconButtonProps, "icon" | "label"> {
  /** Accessible name. Default "Close"; overlays pass their own. */
  label?: string;
}

/**
 * CloseButton — the one close control (AUTM-1756). An IconButton with the
 * cross, used by Dialog, Sheet, Toast and PWAInstallBanner, and by any
 * consumer overlay. Compose with Radix's Close through `asChild`:
 *
 *     <DialogPrimitive.Close asChild>
 *         <CloseButton label="Close dialog" className="absolute right-3 top-3" />
 *     </DialogPrimitive.Close>
 */
export const CloseButton = forwardRef<HTMLButtonElement, CloseButtonProps>(
  function CloseButton({ label = "Close", ...rest }, ref) {
    return <IconButton ref={ref} icon={<CloseGlyph />} label={label} {...rest} />;
  },
);

CloseButton.displayName = "CloseButton";
