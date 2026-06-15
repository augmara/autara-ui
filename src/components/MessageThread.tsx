import { useEffect, useRef, type ReactNode } from "react";
import { AsyncSkeleton } from "./AsyncSkeleton";
import { ErrorCard } from "./ErrorCard";
import { MessageBubble, type MessageSide } from "./MessageBubble";
import { cn } from "../lib/cn";

/**
 * A single normalized message. The thread is data-agnostic — consumers map
 * their own shape (GraphQL rows, etc.) onto this; autara-ui never imports an
 * app's data layer.
 */
export interface MessageItem {
  id: string;
  side: MessageSide;
  text: string;
  /** ISO string, epoch ms, or Date — used for ordering + timestamp separators. */
  createdAt?: string | number | Date;
}

export interface MessageThreadProps {
  items: MessageItem[];
  loading?: boolean;
  error?: boolean;
  errorTitle?: string;
  errorMessage?: string;
  onRetry?: () => void;
  /** Rendered (centered) when there are no items and not loading/error. */
  emptyState?: ReactNode;
  /** Minimum gap between two messages before a timestamp separator shows. */
  timestampGapMs?: number;
  /** Override the separator copy. Default: "15 May · 9:17 AM" (locale-aware). */
  formatTimestamp?: (date: Date) => string;
  /** Centered-measure class shared with MessageComposer. */
  measureClassName?: string;
  className?: string;
}

const DEFAULT_GAP_MS = 5 * 60 * 1000;

function toDate(value: MessageItem["createdAt"]): Date | null {
  if (value == null) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function defaultFormatTimestamp(date: Date): string {
  const day = new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
  }).format(date);
  const time = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
  return `${day} · ${time}`;
}

/**
 * MessageThread — the scrolling conversation surface.
 *
 * Owns the single centered measure (`measureClassName`), timestamp grouping,
 * and auto-scroll-if-near-bottom. The three non-success states render
 * *centered* in the available space rather than pinned to the top — that is
 * the fix for the stranded empty/error tile floating above a large void on
 * wide (iPad) viewports. Designed to sit as a `flex-1` child of a
 * `flex flex-col h-full` screen, with MessageComposer docked beneath.
 */
export function MessageThread({
  items,
  loading = false,
  error = false,
  errorTitle = "Couldn't load messages",
  errorMessage = "Check your connection and tap retry.",
  onRetry,
  emptyState,
  timestampGapMs = DEFAULT_GAP_MS,
  formatTimestamp = defaultFormatTimestamp,
  measureClassName = "max-w-[680px]",
  className,
}: MessageThreadProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevCount = useRef(items.length);

  // Auto-scroll to the bottom on new messages — but only if the user was
  // already near the bottom (within 80px), so we don't yank them away from
  // older history they're reading.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (items.length > prevCount.current) {
      const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
      if (nearBottom || prevCount.current === 0) {
        el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
      }
    }
    prevCount.current = items.length;
  }, [items.length]);

  if (loading) {
    return (
      <div className={cn("flex-1 overflow-y-auto px-4 pt-4", className)}>
        <div className={cn("mx-auto w-full", measureClassName)}>
          <AsyncSkeleton variant="list" count={5} rowHeight="h-12" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={cn(
          "flex flex-1 items-center justify-center overflow-y-auto px-4 py-6",
          className,
        )}
      >
        <div className={cn("w-full", measureClassName)}>
          <ErrorCard
            title={errorTitle}
            message={errorMessage}
            onRetry={onRetry}
          />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div
        className={cn(
          "flex flex-1 items-center justify-center overflow-y-auto px-4 py-6",
          className,
        )}
      >
        <div className={cn("w-full", measureClassName)}>{emptyState}</div>
      </div>
    );
  }

  // Sort oldest-first — the source order isn't guaranteed; sort on createdAt
  // so the visual order is deterministic (items without a date keep input order).
  const sorted = [...items].sort(
    (a, b) =>
      (toDate(a.createdAt)?.getTime() ?? 0) -
      (toDate(b.createdAt)?.getTime() ?? 0),
  );

  return (
    <div
      ref={scrollRef}
      className={cn("flex-1 overflow-y-auto px-4 pb-4 pt-4", className)}
    >
      <ul className={cn("mx-auto flex w-full flex-col gap-2", measureClassName)}>
        {sorted.map((m, i) => {
          const prev = sorted[i - 1];
          const date = toDate(m.createdAt);
          const prevDate = toDate(prev?.createdAt);
          const showStamp =
            !!date &&
            (!prev ||
              prevDate == null ||
              date.getTime() - prevDate.getTime() > timestampGapMs);
          return (
            <li key={m.id} className="flex flex-col gap-1">
              {showStamp && date ? (
                <p className="mt-3 text-center text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--text-subtle)]">
                  {formatTimestamp(date)}
                </p>
              ) : null}
              <MessageBubble side={m.side}>{m.text}</MessageBubble>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
