import type { ReactNode } from "react";

/**
 * MetaChip — the inline pill primitive for credibility + status surfacing.
 * Used heavily on customer-web's merchant profile page (Open today,
 * X services, Comes to you · 10km, Highly rated, etc.).
 *
 * Tones:
 *   - neutral  — plain surface
 *   - success  — emerald, e.g. "Open today"
 *   - brand    — autara purple, e.g. "Highly rated", "Verified"
 *   - muted    — same surface as neutral, dimmer text
 *
 * The optional `dot` renders a colored pulse-dot before the label —
 * use it for status indicators ("Open now") not for static labels.
 */
type Tone = "neutral" | "success" | "brand" | "muted";

const TONES: Record<Tone, string> = {
  neutral:
    "bg-[var(--surface-elevated)] text-[var(--text-muted)] ring-1 ring-inset ring-[var(--border-subtle)]",
  success:
    "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
  brand:
    "bg-[rgba(78,27,189,0.08)] text-[var(--color-autara-purple)] ring-1 ring-inset ring-[rgba(78,27,189,0.18)]",
  muted:
    "bg-[var(--surface-elevated)] text-[var(--text-subtle)] ring-1 ring-inset ring-[var(--border-subtle)]",
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
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${TONES[tone]} ${className}`}
    >
      {dot ? (
        <span
          aria-hidden="true"
          className={`h-1.5 w-1.5 rounded-full ${
            tone === "success"
              ? "bg-emerald-500"
              : tone === "brand"
                ? "bg-[var(--color-autara-purple)]"
                : "bg-[var(--text-subtle)]"
          }`}
        />
      ) : null}
      {icon}
      {children}
    </span>
  );
}
