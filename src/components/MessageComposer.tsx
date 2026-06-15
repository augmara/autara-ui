import { type KeyboardEvent } from "react";
import { Button } from "./Button";
import { Textarea } from "./Textarea";
import { cn } from "../lib/cn";

/**
 * MessageComposer — the docked input row beneath a conversation thread.
 *
 * Controlled + presentational: the parent owns `value` and the send
 * lifecycle (optimistic write, error handling). This component renders the
 * field + Send button + inline error and raises `onSend` on click or Enter
 * (Shift+Enter inserts a newline).
 *
 * Grammar:
 *   - Full-width dock — a hairline top border on the page surface, so it
 *     reads as one continuous edge across the screen while its content
 *     stays centered to the thread measure (`measureClassName`, shared with
 *     MessageThread).
 *   - Field uses the canonical `.field-textarea` focus signature (warm-cream
 *     tint + solid brand-purple border, no halo) via `Textarea`, forced to a
 *     compact single-row min height that grows to a cap.
 *   - Send is the house primary on a light surface: variant="dark" (Torph
 *     ink), matching the own-message bubble — NOT purple `primary`, which
 *     the aesthetic reserves for dark / photo surfaces.
 *   - Inline send errors use the brand error token, never raw `rose-*`.
 *   - Respects the iOS bottom safe-area inset.
 */
export interface MessageComposerProps {
  value: string;
  onChange: (value: string) => void;
  /** Raised on Send click or Enter (without Shift) when value is non-empty. */
  onSend: () => void;
  /** While true the field + button disable and the button shows `sendingLabel`. */
  sending?: boolean;
  /** Inline error rendered below the field with role="alert". */
  error?: string | null;
  placeholder?: string;
  sendLabel?: string;
  sendingLabel?: string;
  /** Centered-measure class shared with MessageThread. */
  measureClassName?: string;
  className?: string;
}

export function MessageComposer({
  value,
  onChange,
  onSend,
  sending = false,
  error,
  placeholder = "Type a message",
  sendLabel = "Send",
  sendingLabel = "Sending…",
  measureClassName = "max-w-[680px]",
  className,
}: MessageComposerProps) {
  const canSend = value.trim().length > 0 && !sending;

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (canSend) onSend();
    }
  }

  return (
    <div
      className={cn(
        "border-t border-[var(--border-subtle)] bg-[var(--surface)] px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+12px)]",
        className,
      )}
    >
      <div className={cn("mx-auto flex w-full items-end gap-2", measureClassName)}>
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          disabled={sending}
          aria-label="Message"
          className="max-h-32 min-h-[44px]! flex-1 resize-none!"
        />
        <Button
          variant="dark"
          size="md"
          disabled={!canSend}
          onClick={() => canSend && onSend()}
        >
          {sending ? sendingLabel : sendLabel}
        </Button>
      </div>
      {error ? (
        <p
          role="alert"
          className={cn(
            "mx-auto mt-2 w-full rounded-lg border border-[rgba(221,56,56,0.25)] bg-[rgba(221,56,56,0.06)] px-3 py-2 text-sm text-[var(--color-autara-error)]",
            measureClassName,
          )}
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
