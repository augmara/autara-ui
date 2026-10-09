import { useId, type KeyboardEvent, type ReactNode } from "react";
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
 *   - Send is the house primary: `variant="primary"`. AUTM-1221 changed
 *     this from `variant="dark"` (Torph ink, matching the own-message
 *     bubble). Glass rule 5 is that purple acts, and send is the one
 *     action on the composer; the ink treatment left the only control on
 *     the surface reading as secondary.
 *   - Inline send errors use the brand error token, never raw `rose-*`.
 *   - Respects the iOS bottom safe-area inset.
 */
export interface MessageComposerProps {
  value: string;
  onChange: (value: string) => void;
  /** Raised on Send click or Enter (without Shift) when value is non-empty. */
  onSend: () => void;
  /**
   * While true the field disables and Send shows the library busy state: the
   * turning Autara mark over the label, which stays the button's name and
   * holds its width (AUTM-1708).
   */
  sending?: boolean;
  /** Inline error rendered below the field with role="alert". */
  error?: string | null;
  placeholder?: string;
  sendLabel?: string;
  /**
   * @deprecated AUTM-1708: ignored. Send keeps `sendLabel` while sending and
   * shows the turning mark instead; a "Sending…" relabel changed the width.
   * Kept so existing callers still compile.
   */
  sendingLabel?: string;
  /**
   * Optional control rendered to the LEFT of the field — e.g. an attach
   * / plus button. Aligned to the field's bottom edge (items-end); the
   * consumer owns its styling + handler.
   */
  leading?: ReactNode;
  /**
   * AUTM-1806: the longest message the API accepts (both APIs cap at 2,000
   * since AUTM-1807). The field stops there, and from 200 characters out a
   * line under it says how many are left, so nobody types past the cap and
   * learns about it from a failed send.
   */
  maxLength?: number;
  /** Centered-measure class shared with MessageThread. */
  measureClassName?: string;
  className?: string;
}

/** How close to the cap the "characters left" line appears. */
const NEAR_CAP = 200;

export function MessageComposer({
  value,
  onChange,
  onSend,
  sending = false,
  error,
  placeholder = "Type a message",
  sendLabel = "Send",
  leading,
  maxLength,
  measureClassName = "max-w-[680px]",
  className,
}: MessageComposerProps) {
  const canSend = value.trim().length > 0 && !sending;
  const countId = useId();
  const left = maxLength != null ? maxLength - value.length : null;
  const showCount = left != null && left <= NEAR_CAP;

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
        {leading}
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          disabled={sending}
          maxLength={maxLength}
          aria-describedby={showCount ? countId : undefined}
          aria-label="Message"
          className="max-h-32 min-h-[44px]! flex-1 resize-none!"
        />
        <Button
          /* AUTM-1221: the house primary. Rule 5: purple acts. */
          variant="primary"
          size="md"
          busy={sending}
          disabled={!canSend}
          onClick={() => canSend && onSend()}
        >
          {sendLabel}
        </Button>
      </div>
      {showCount ? (
        <p
          id={countId}
          className={cn(
            "mx-auto mt-1.5 w-full text-right text-[0.8125rem] tabular-nums",
            left <= 0 ? "font-medium text-[var(--danger)]" : "text-[var(--text-subtle)]",
            measureClassName,
          )}
        >
          {left <= 0 ? "That's the limit for one message" : `${left} ${left === 1 ? "character" : "characters"} left`}
        </p>
      ) : null}
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
