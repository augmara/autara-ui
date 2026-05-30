import { forwardRef, type ElementType, type ReactNode } from "react";
import { cn } from "../lib/cn";
import { Badge } from "./Badge";

/**
 * MerchantCard — the photo-led marketplace card used in the homepage
 * carousels ("Top-rated pros near you", "Just joined"). Promoted from
 * autara-customer-web/src/components/marketplace/MerchantCard.tsx.
 *
 * Visual anatomy (top → bottom):
 *   1. Hero image (aspect 5:4), full-bleed inside the rounded card
 *      • Optional badge top-left (FEATURED / TRENDING / NEW)
 *      • Optional heart button top-right (consumer controls click)
 *   2. Content row (p-4):
 *      • Name (left) + rating (right) — rating uses brand-purple star
 *      • Category · location — single line, muted, truncate
 *      • "FROM $X" — small-caps "FROM" + bold price
 *
 * Polymorphic via `as` prop: defaults to `div`, but `as={Link}` lets
 * consumers pass their framework's link component (Next, React Router).
 */

export type MerchantBadge = "featured" | "trending" | "new" | "new-light";

export interface MerchantCardProps {
  name: string;
  /** Category description, e.g. "Exterior detailing". */
  primaryService: string;
  /** Suburb + state, e.g. "Surry Hills, NSW". */
  location: string;
  /** Average rating, 0..5. */
  rating: number;
  reviewCount: number;
  /** Pre-formatted price string, e.g. "$180". */
  priceFromLabel: string;
  /** Hero image URL. Required — the card is photo-led. */
  heroImageUrl: string;
  /** Optional badge top-left of the photo. */
  badge?: MerchantBadge | null;
  /**
   * Heart-button click handler. If omitted, the button is hidden.
   * Consumer is responsible for state (filled vs outline) and any
   * sign-in gating.
   */
  onFavoriteClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /** Render heart as filled (already favorited). */
  isFavorite?: boolean;
  /** Replace the default <div> root with a framework Link component. */
  as?: ElementType;
  /** Forwarded to the root when using `as`. */
  href?: string;
  className?: string;
  /** Optional content rendered before the heart (e.g. a verified tick). */
  topRightDecor?: ReactNode;
}

const BADGE_LABEL: Record<MerchantBadge, string> = {
  featured: "Featured",
  trending: "Trending",
  new: "New",
  // `new-light` ships the brighter lime fill (vs trending's solid
  // lime-drive). Consumers that want the editorial Trending label but
  // with the brighter pill (e.g. on dark hero photos) pass `new-light`.
  "new-light": "Trending",
};

export const MerchantCard = forwardRef<HTMLDivElement, MerchantCardProps>(
  function MerchantCard(
    {
      name,
      primaryService,
      location,
      rating,
      reviewCount,
      priceFromLabel,
      heroImageUrl,
      badge,
      onFavoriteClick,
      isFavorite,
      as,
      href,
      className,
      topRightDecor,
    },
    ref,
  ) {
    const Comp = (as ?? "div") as ElementType;
    return (
      <Comp
        ref={ref}
        href={href}
        className={cn(
          "group relative block overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] transition-colors hover:border-[rgba(78,27,189,0.3)]",
          className,
        )}
      >
        {/* Hero image */}
        <div className="relative aspect-[5/4] overflow-hidden bg-[var(--surface-warm)]">
          <img
            src={heroImageUrl}
            alt={`${name} — ${primaryService}`}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            loading="lazy"
          />

          {badge ? (
            <Badge
              variant={badge}
              shape="parallelogram"
              className="absolute left-3 top-3"
            >
              {BADGE_LABEL[badge]}
            </Badge>
          ) : null}

          {topRightDecor ? (
            <div className="absolute right-3 top-3">{topRightDecor}</div>
          ) : null}

          {onFavoriteClick && !topRightDecor ? (
            <button
              type="button"
              aria-label={`Save ${name}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onFavoriteClick(e);
              }}
              className={cn(
                "absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white/90 backdrop-blur-sm transition-colors hover:bg-white",
                isFavorite
                  ? "text-rose-500"
                  : "text-[#0a0a0a]/70 hover:text-[var(--color-autara-purple)]",
              )}
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill={isFavorite ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
          ) : null}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <h3 className="truncate text-[15px] font-semibold tracking-[-0.005em] text-[var(--text-strong)]">
              {name}
            </h3>
            <span className="inline-flex shrink-0 items-center gap-1 text-[13px] font-semibold text-[var(--text-strong)]">
              <svg
                viewBox="0 0 24 24"
                className="h-3.5 w-3.5 text-[var(--color-autara-purple)]"
                fill="currentColor"
                aria-hidden
              >
                <path d="m12 17.27 6.18 3.73-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
              {rating.toFixed(1)}
              <span className="text-[12px] font-normal text-[var(--text-subtle)]">
                ({reviewCount})
              </span>
            </span>
          </div>

          <p className="mt-1 truncate text-[12.5px] text-[var(--text-muted)]">
            {primaryService} · {location}
          </p>

          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--text-subtle)]">
              From
            </span>
            <span className="text-[15px] font-bold tracking-[-0.01em] text-[var(--text-strong)]">
              {priceFromLabel}
            </span>
          </div>
        </div>
      </Comp>
    );
  },
);
