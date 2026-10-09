import { cn } from "../lib/cn";
import { Button } from "./Button";

/**
 * QuickReplies — one-tap messages for the moments that repeat (AUTM-1806, U4).
 *
 * "I'm running late", "I'm here", "15 minutes away": a row of 44px band
 * chips above the composer. A chip FILLS the composer, it never sends: the
 * consumer puts `reply.value ?? reply.label` in the field and focuses it, so
 * the person can add a word or change their mind (Uber's driver chips, steal;
 * a bot answering for them, avoid).
 *
 * The chips WRAP onto a second line rather than scrolling sideways or
 * clipping, so every one is visible and reachable at 200% text. That is why
 * this is not FilterChipRow, whose chips are about 32px and scroll (AUTM-622).
 * Each chip is the library's quiet Button at `sm`: 44px tall, pill by its own
 * half-height radius, a label that wraps inside the box when it must.
 *
 * `role="group"` with a label, so a screen reader hears "Quick replies,
 * group" before the chips; keyboard order is the reading order.
 */
export interface QuickReply {
  id: string;
  /** The chip's words. */
  label: string;
  /** What goes in the composer, when it differs from the label. */
  value?: string;
}

export interface QuickRepliesProps {
  replies: QuickReply[];
  onSelect: (reply: QuickReply) => void;
  /** The group's accessible name. Default "Quick replies". */
  label?: string;
  /** `data-testid` on every chip; each also carries `data-reply-id`. */
  chipTestId?: string;
  disabled?: boolean;
  className?: string;
}

export function QuickReplies({
  replies,
  onSelect,
  label = "Quick replies",
  chipTestId,
  disabled,
  className,
}: QuickRepliesProps) {
  if (replies.length === 0) return null;
  return (
    <div role="group" aria-label={label} className={cn("flex flex-wrap gap-2", className)}>
      {replies.map((reply) => (
        <Button
          key={reply.id}
          variant="quiet"
          size="sm"
          disabled={disabled}
          onClick={() => onSelect(reply)}
          data-testid={chipTestId}
          data-reply-id={reply.id}
          className="max-w-full"
        >
          {reply.label}
        </Button>
      ))}
    </div>
  );
}
