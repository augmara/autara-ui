/**
 * RatingStars — five-star display with half-star precision.
 *
 * Accepts any number 0..5; clamps out-of-range values. Half-star rendered
 * via inline SVG linearGradient (defs are scoped to the half-star
 * instance so multiple ratings can coexist on the same page).
 *
 * Stars are amber-500 when filled, border-subtle when empty — matches
 * the visual treatment on customer-web merchant profiles.
 */
type Size = "sm" | "md" | "lg";

const SIZES: Record<Size, string> = {
  sm: "h-3 w-3",
  md: "h-3.5 w-3.5",
  lg: "h-4 w-4",
};

const GAPS: Record<Size, string> = {
  sm: "gap-0.5",
  md: "gap-0.5",
  lg: "gap-1",
};

export interface RatingStarsProps {
  /** 0..5. Values outside this range are clamped. */
  rating: number;
  size?: Size;
  /** Render half-star when fractional part is in [0.4, 0.9). Default true. */
  showHalf?: boolean;
  className?: string;
  /** Override the auto-generated screen-reader label. */
  ariaLabel?: string;
}

export function RatingStars({
  rating,
  size = "md",
  showHalf = true,
  className = "",
  ariaLabel,
}: RatingStarsProps) {
  const safe = Math.max(0, Math.min(5, rating));
  const full = Math.floor(safe);
  const hasHalf = showHalf && safe - full >= 0.4 && safe - full < 0.9;
  return (
    <span
      className={`inline-flex items-center ${GAPS[size]} ${className}`}
      aria-label={ariaLabel ?? `Rated ${safe.toFixed(1)} of 5`}
      role="img"
    >
      {[0, 1, 2, 3, 4].map((i) => {
        const filled = i < full;
        const half = !filled && hasHalf && i === full;
        return (
          <Star
            key={i}
            className={SIZES[size]}
            state={filled ? "full" : half ? "half" : "empty"}
          />
        );
      })}
    </span>
  );
}

function Star({
  className,
  state,
}: {
  className: string;
  state: "full" | "half" | "empty";
}) {
  if (state === "half") {
    return (
      <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
        <defs>
          <linearGradient id="autara-star-half">
            <stop offset="50%" stopColor="currentColor" />
            <stop offset="50%" stopColor="transparent" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M12 2 14.85 8.27 21.5 9.21 16.75 13.83 17.87 20.46 12 17.33 6.13 20.46 7.25 13.83 2.5 9.21 9.15 8.27 12 2z"
          className="text-amber-500"
          fill="url(#autara-star-half)"
          stroke="currentColor"
          strokeWidth="1.25"
        />
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 24 24"
      className={`${className} ${state === "full" ? "text-amber-500" : "text-[var(--border-subtle)]"}`}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 2 14.85 8.27 21.5 9.21 16.75 13.83 17.87 20.46 12 17.33 6.13 20.46 7.25 13.83 2.5 9.21 9.15 8.27 12 2z" />
    </svg>
  );
}
