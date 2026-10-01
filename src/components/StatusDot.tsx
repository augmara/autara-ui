import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../lib/cn";

/**
 * StatusDot — a state light with its words (AUTM-1594, canvas v44 "Dots").
 *
 * An 8px dot 8px before a 15px label. The label is required: "a status said
 * in words always sits beside the dot", so colour is never the only signal
 * and the dot itself is hidden from assistive tech.
 *
 *   open      the positive green: open now
 *   closing   caution amber: closes soon
 *   away      subtle ink: away, closed, off
 *   starting  aqua: in flight, starts soon
 */
export type StatusDotTone = "open" | "closing" | "away" | "starting";

const DOT: Record<StatusDotTone, string> = {
  open: "bg-[var(--positive)]",
  closing: "bg-[var(--caution)]",
  away: "bg-[var(--text-subtle)]",
  starting: "bg-[var(--aqua)]",
};

export interface StatusDotProps extends HTMLAttributes<HTMLSpanElement> {
  tone: StatusDotTone;
  /** The status in words. Required: the dot is never the only signal. */
  children: ReactNode;
}

export function StatusDot({ tone, children, className, ...rest }: StatusDotProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 text-[0.9375rem] text-[var(--text-strong)]",
        className,
      )}
      {...rest}
    >
      <span aria-hidden="true" className={cn("size-2 shrink-0 rounded-full", DOT[tone])} />
      {children}
    </span>
  );
}
