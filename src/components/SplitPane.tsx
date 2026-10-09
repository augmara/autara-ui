"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { cn } from "../lib/cn";

/**
 * SplitPane: a list beside its record, with a splitter the user can drag
 * (AUTM-1755, for the merchant portal's Inbox and Customers).
 *
 * Don, on the portal at about 2000px: the list column was a fixed 400px with
 * one card in it while the record took everything else, "this can be
 * adjusted, the width. Make it better UX." Front, Linear and every desktop
 * mail client let the list be as wide as the person reading it wants, and
 * remember it.
 *
 *   default   the start pane scales with the split: `defaultFraction` of it,
 *             held between `defaultMinRem` and `defaultMaxRem`, so a laptop
 *             keeps the 400px it had and a wide window gives the list room
 *   drag      between `minRem` and `maxRem`, and never so wide that the end
 *             pane drops under `secondaryMinRem` (the record stays readable)
 *   keyboard  the splitter is a focusable `role="separator"` (the WAI-ARIA
 *             window splitter): Left and Right move it by `step` px (Shift for
 *             four steps), Home and End go to the bounds
 *   reset     double-click returns to the default, and forgets the width
 *   memory    a moved width is kept per device under `storageKey`
 *             (localStorage, every read and write in try/catch; private
 *             mode just forgets)
 *
 * Every size is in rem, so 200% text widens the list with its text. Before
 * it is measured (and on the server) the width is plain CSS, a `clamp()` of
 * the same numbers, so nothing jumps on the first paint.
 *
 * The hit area is 44px wide and sits mostly over the END pane (16px over the
 * list, 28px over the record), because the list's own scrollbar is at its
 * right edge and the record pane starts with a gutter. Give the list at least
 * 1rem of padding on its end side so a row is never under the handle.
 */
export interface SplitPaneProps {
  /** The start pane: the list. */
  primary: ReactNode;
  /** The end pane: the record the list selects. */
  secondary: ReactNode;
  /** The splitter's accessible name: "Resize the list". */
  label: string;
  /** Keeps a moved width on this device. Omit to forget it on reload. */
  storageKey?: string;
  /** Default start width as a fraction of the split. */
  defaultFraction?: number;
  /** The default never goes under this, rem. */
  defaultMinRem?: number;
  /** The default never goes over this, rem. */
  defaultMaxRem?: number;
  /** The narrowest a drag can make the start pane, rem. */
  minRem?: number;
  /** The widest a drag can make the start pane, rem. */
  maxRem?: number;
  /** The end pane never gets narrower than this, rem. */
  secondaryMinRem?: number;
  /** Arrow key step in px; Shift moves four steps. */
  step?: number;
  className?: string;
  primaryClassName?: string;
  secondaryClassName?: string;
  /** Test id root: the panes get `-list` and `-detail`, the splitter `-resize`. */
  testId?: string;
  /** Called with the start pane's width in px whenever the user moves it. */
  onResize?: (px: number) => void;
}

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function rootFontPx(): number {
  if (typeof window === "undefined") return 16;
  const size = parseFloat(window.getComputedStyle(document.documentElement).fontSize);
  return Number.isFinite(size) && size > 0 ? size : 16;
}

/** The stored width, in rem, or null. Never throws. */
function readStored(key: string | undefined): number | null {
  if (!key || typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw == null) return null;
    const value = Number(raw);
    return Number.isFinite(value) && value > 0 ? value : null;
  } catch {
    return null;
  }
}

function writeStored(key: string | undefined, rem: number | null) {
  if (!key || typeof window === "undefined") return;
  try {
    if (rem == null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, String(Math.round(rem * 100) / 100));
  } catch {
    // Private mode or a full quota: the width still holds for this visit.
  }
}

function releaseDocument() {
  if (typeof document === "undefined") return;
  document.documentElement.style.removeProperty("cursor");
  document.documentElement.style.removeProperty("user-select");
}

export function SplitPane({
  primary,
  secondary,
  label,
  storageKey,
  defaultFraction = 0.3,
  defaultMinRem = 25,
  defaultMaxRem = 36,
  minRem = 20,
  maxRem = 48,
  secondaryMinRem = 36,
  step = 16,
  className,
  primaryClassName,
  secondaryClassName,
  testId,
  onResize,
}: SplitPaneProps) {
  const primaryId = useId();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const handleRef = useRef<HTMLDivElement | null>(null);
  // The user's width in rem, or null for the default.
  const [sizeRem, setSizeRem] = useState<number | null>(() => readStored(storageKey));
  const [measure, setMeasure] = useState({ width: 0, rem: 16 });
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ startX: number; startPx: number; px: number; moved: boolean; frame: number } | null>(null);

  useIsoLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const read = () => setMeasure({ width: el.clientWidth, rem: rootFontPx() });
    read();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(read);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const { width: splitPx, rem } = measure;
  const minPx = minRem * rem;
  const maxPx = Math.max(minPx, Math.min(maxRem * rem, splitPx - secondaryMinRem * rem));
  const defaultPx = clamp(clamp(defaultFraction * splitPx, defaultMinRem * rem, defaultMaxRem * rem), minPx, maxPx);
  const currentPx = sizeRem == null ? defaultPx : clamp(sizeRem * rem, minPx, maxPx);

  // CSS holds the bounds too, so the first paint and every window resize
  // are right before the observer has said anything.
  const upper = `max(${minRem}rem, min(${maxRem}rem, 100% - ${secondaryMinRem}rem))`;
  const preferred =
    sizeRem == null
      ? `clamp(${defaultMinRem}rem, ${defaultFraction * 100}%, ${defaultMaxRem}rem)`
      : `${sizeRem}rem`;
  const width = `clamp(${minRem}rem, ${preferred}, ${upper})`;

  const commit = useCallback(
    (px: number, persist: boolean) => {
      const next = px / rem;
      setSizeRem(next);
      if (persist) writeStored(storageKey, next);
      onResize?.(px);
    },
    [rem, storageKey, onResize],
  );

  const reset = useCallback(() => {
    setSizeRem(null);
    writeStored(storageKey, null);
  }, [storageKey]);

  const endDrag = useCallback(
    (cancel: boolean) => {
      const state = drag.current;
      if (!state) return;
      cancelAnimationFrame(state.frame);
      drag.current = null;
      setDragging(false);
      releaseDocument();
      if (cancel) {
        // Back to where the drag began, and the stored width untouched.
        setSizeRem(readStored(storageKey));
        return;
      }
      if (state.moved) commit(state.px, true);
    },
    [commit, storageKey],
  );

  // Never leave the page stuck in a resize cursor if the split unmounts mid-drag.
  useEffect(
    () => () => {
      if (drag.current) cancelAnimationFrame(drag.current.frame);
      drag.current = null;
      releaseDocument();
    },
    [],
  );

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();
    handleRef.current?.focus({ preventScroll: true });
    event.currentTarget.setPointerCapture?.(event.pointerId);
    drag.current = { startX: event.clientX, startPx: currentPx, px: currentPx, moved: false, frame: 0 };
    setDragging(true);
    document.documentElement.style.setProperty("cursor", "col-resize");
    document.documentElement.style.setProperty("user-select", "none");
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const state = drag.current;
    if (!state) return;
    const dx = event.clientX - state.startX;
    if (!state.moved && Math.abs(dx) < 2) return;
    state.moved = true;
    const next = clamp(state.startPx + dx, minPx, maxPx);
    state.px = next;
    cancelAnimationFrame(state.frame);
    state.frame = requestAnimationFrame(() => setSizeRem(next / rem));
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape" && drag.current) {
      event.preventDefault();
      endDrag(true);
      return;
    }
    const by = event.shiftKey ? step * 4 : step;
    let next: number;
    switch (event.key) {
      case "ArrowLeft":
        next = currentPx - by;
        break;
      case "ArrowRight":
        next = currentPx + by;
        break;
      case "Home":
        next = minPx;
        break;
      case "End":
        next = maxPx;
        break;
      default:
        return;
    }
    event.preventDefault();
    commit(clamp(next, minPx, maxPx), true);
  };

  const pct = splitPx > 0 ? Math.round((currentPx / splitPx) * 100) : null;

  return (
    <div
      ref={rootRef}
      data-testid={testId}
      data-dragging={dragging ? "" : undefined}
      className={cn("relative flex h-full min-h-0", className)}
    >
      <div
        id={primaryId}
        data-testid={testId ? `${testId}-list` : undefined}
        className={cn("min-w-0 shrink-0", primaryClassName)}
        style={{ width }}
      >
        {primary}
      </div>
      <div
        ref={handleRef}
        role="separator"
        tabIndex={0}
        aria-orientation="vertical"
        aria-label={label}
        aria-controls={primaryId}
        aria-valuenow={Math.round(currentPx)}
        aria-valuemin={Math.round(minPx)}
        aria-valuemax={Math.round(maxPx)}
        aria-valuetext={pct == null ? `${Math.round(currentPx)} pixels` : `${pct}% of the width`}
        title="Drag to resize. Double-click to reset."
        data-testid={testId ? `${testId}-resize` : undefined}
        data-dragging={dragging ? "" : undefined}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={() => endDrag(false)}
        onPointerCancel={() => endDrag(true)}
        onLostPointerCapture={() => endDrag(false)}
        onDoubleClick={reset}
        onKeyDown={onKeyDown}
        className={cn(
          // The visible line is this 1px flex item; the hit area is its
          // ::before, 44px (2.75rem) wide and mostly over the end pane.
          "group/split relative z-10 w-px shrink-0 cursor-col-resize touch-none select-none bg-[var(--hairline)] outline-none",
          "before:absolute before:inset-y-0 before:left-[-1rem] before:w-[2.75rem] before:content-['']",
          // Hover, focus and drag: the line takes the accent, 2px wide,
          // drawn with ::after so the layout never moves.
          "after:pointer-events-none after:absolute after:inset-y-0 after:left-[-0.5px] after:w-[2px] after:bg-[var(--accent)] after:opacity-0 after:transition-opacity after:duration-150 after:content-[''] motion-reduce:after:transition-none",
          "hover:after:opacity-100 focus-visible:after:opacity-100 data-[dragging]:after:opacity-100",
        )}
      >
        {/* The grip: says "this moves" on hover, and carries the focus ring. */}
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute left-1/2 top-1/2 h-10 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--accent)] opacity-0 transition-opacity duration-150 motion-reduce:transition-none",
            "group-hover/split:opacity-100 group-focus-visible/split:opacity-100 group-focus-visible/split:ring-2 group-focus-visible/split:ring-[var(--accent)] group-focus-visible/split:ring-offset-2 group-focus-visible/split:ring-offset-[var(--background)] group-data-[dragging]/split:opacity-100",
          )}
        />
      </div>
      <div
        data-testid={testId ? `${testId}-detail` : undefined}
        className={cn("min-w-0 flex-1", secondaryClassName)}
      >
        {secondary}
      </div>
    </div>
  );
}
