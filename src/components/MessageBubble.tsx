import type { ReactNode } from "react";
import { cn } from "../lib/cn";

/**
 * MessageBubble — a single message in an Autara conversation thread.
 *
 * Three sides, three grammars:
 *   - own       the current user's message. Torph ink (#0E0A1A, via
 *               --text-strong) + white text — the same ink as the house
 *               primary Button variant="dark", so a thread and its Send
 *               button read as one vocabulary. Brand purple is NOT used as
 *               a fill: the aesthetic reserves purple for accents / dark
 *               surfaces, never a default bubble colour.
 *   - incoming  the other party's message. Hairline cream-surface card.
 *   - system    a centered, muted status line ("Booking confirmed") — no
 *               bubble, no side.
 *
 * No drop shadow (house rule) — depth is the hairline border on incoming
 * and the ink fill on own. A single softened inner corner (rounded-br/bl-lg)
 * gives a subtle conversational "tail" while staying inside the 8/16 radius
 * ladder. Newlines in `children` are preserved; long unbroken tokens wrap.
 */
export type MessageSide = "own" | "incoming" | "system";

export interface MessageBubbleProps {
  side: MessageSide;
  children: ReactNode;
  className?: string;
}

export function MessageBubble({ side, children, className }: MessageBubbleProps) {
  if (side === "system") {
    return (
      <p
        className={cn(
          "self-center text-balance px-4 text-center text-[12px] leading-snug text-[var(--text-muted)]",
          className,
        )}
      >
        {children}
      </p>
    );
  }

  const isOwn = side === "own";
  return (
    <div
      className={cn(
        "max-w-[80%] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-[14px] leading-snug",
        isOwn
          ? "self-end rounded-br-lg bg-[var(--text-strong)] text-white"
          : "self-start rounded-bl-lg border border-[var(--border-subtle)] bg-[var(--surface)] text-[var(--text-strong)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
