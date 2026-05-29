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
type Tone = "neutral" | "success" | "brand" | "muted";

const TONES: Record<Tone, string> = {
  neutral:
    "bg-[var(--surface-elevated)] text-[var(--text-strong)] ring-1 ring-inset ring-[var(--border-subtle)]",
  success:
    "bg-[rgba(183,225,73,0.18)] text-[#2f5a10] ring-1 ring-inset ring-[rgba(183,225,73,0.6)]",
  brand:
    "bg-[rgba(78,27,189,0.08)] text-[var(--color-autara-purple)] ring-1 ring-inset ring-[rgba(78,27,189,0.28)]",
  muted:
    "bg-[var(--surface-elevated)] text-[var(--text-muted)] ring-1 ring-inset ring-[var(--border-subtle)]",
};

const DOT_COLORS: Record<Tone, string> = {
  neutral: "bg-[var(--text-subtle)]",
  success: "bg-[#5d9a1f]",
  brand: "bg-[var(--color-autara-purple)]",
  muted: "bg-[var(--text-subtle)]",
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
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-[5px] text-[11px] font-medium uppercase tracking-[0.12em] ${TONES[tone]} ${className}`}
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
