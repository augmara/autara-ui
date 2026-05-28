import { cn } from "../lib/cn";

/**
 * AsyncSkeleton — the universal "we're loading; shape-match the
 * eventual content" placeholder.
 *
 * Use a skeleton, never a spinner, on any async surface where the
 * eventual shape is known. This is the workspace cross-stack rule:
 * "Skeletons > spinners. Wizard steps with async data show shape-matched
 * skeletons while loading."
 *
 * Variants:
 *   - `list`  — N rounded rectangles stacked, typical for booking/service rows
 *   - `card`  — single tall rectangle, for hero/detail surfaces
 *   - `row`   — N rounded rectangles inline, e.g. for chip rows
 *   - `kpi`   — single small bar (use `<KpiCard value={null} />` instead
 *                when in a card; this is for standalone use)
 *   - `text`  — N short bars, like loading paragraph copy
 */
type Variant = "list" | "card" | "row" | "kpi" | "text";

export interface AsyncSkeletonProps {
  variant?: Variant;
  /** How many items to render for `list` / `row` / `text` variants. */
  count?: number;
  /** Tailwind height class for list/card rows (e.g. "h-20", "h-32"). */
  rowHeight?: string;
  className?: string;
}

export function AsyncSkeleton({
  variant = "list",
  count = 3,
  rowHeight,
  className,
}: AsyncSkeletonProps) {
  const baseRow =
    "animate-pulse rounded-2xl bg-[var(--surface-elevated)]";

  if (variant === "card") {
    return (
      <div
        aria-hidden
        className={cn(baseRow, rowHeight ?? "h-32", className)}
      />
    );
  }

  if (variant === "kpi") {
    return (
      <span
        aria-hidden
        className={cn(
          "block h-7 w-12 animate-pulse rounded-md bg-[var(--surface-elevated)]",
          className,
        )}
      />
    );
  }

  if (variant === "row") {
    return (
      <div
        aria-hidden
        className={cn("flex flex-wrap gap-2", className)}
      >
        {Array.from({ length: count }).map((_, i) => (
          <span
            key={i}
            className="h-6 w-20 animate-pulse rounded-full bg-[var(--surface-elevated)]"
          />
        ))}
      </div>
    );
  }

  if (variant === "text") {
    return (
      <div aria-hidden className={cn("space-y-2", className)}>
        {Array.from({ length: count }).map((_, i) => (
          <span
            key={i}
            className={cn(
              "block h-3 animate-pulse rounded bg-[var(--surface-elevated)]",
              i === count - 1 ? "w-3/4" : "w-full",
            )}
          />
        ))}
      </div>
    );
  }

  // list (default)
  return (
    <ul aria-hidden className={cn("space-y-2", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <li
          key={i}
          className={cn(baseRow, rowHeight ?? "h-[78px]")}
        />
      ))}
    </ul>
  );
}
