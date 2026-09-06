import { forwardRef, type ElementType, type ReactNode } from "react";
import { cn } from "../lib/cn";
import { Badge } from "./Badge";

/**
 * MerchantCard: the one merchant card, everywhere a merchant is listed.
 *
 * AUTM-1107. Don, on the marketplace home: "redesign this section and the
 * merchant cards. properly. with proper parallelogram tags for new on autara
 * please make universal merchant cards in everywhere." Before this, customer
 * web rendered merchants four ways (this card in the home rail, a local
 * wrapper, an interim search card, a map popup); every consumer now renders
 * this component and passes what it knows.
 *
 * Anatomy, top to bottom:
 *   1. Photograph, 4:3, full-bleed inside the card (the same ratio as the
 *      home's category tiles, so a rail under them reads as one system).
 *      • Marker top-left: the `badge` you pass, or the lime parallelogram
 *        "New on Autara" when `isNew` is set and no badge is passed. A
 *        merchant is either new or rated; the card never says both.
 *      • Save control top-right, 44px, a 12px-radius glass button (the
 *        ladder; nothing on Autara is a circle). Consumer owns
 *        the state and any sign-in gate.
 *   2. Body: name and, when there are reviews, the rating with its count.
 *      Then one meta line: location, and the way the merchant works
 *      (`mode`: Mobile, Workshop, or both) when the consumer knows it.
 *      Then the optional "From $X".
 *
 * Material: `glass-surface glass-surface--flat glass-surface--interactive`,
 * the library's own surface without the blur, because a rail of twelve
 * blurred cards is twelve backdrop filters for no visible gain. Hover is a
 * border shift, never a lift (rule 7).
 *
 * What is NOT here, on purpose: a rating placeholder for a merchant with no
 * reviews, an uppercase eyebrow in the body, a verified tick (every listed
 * merchant is verified before activation, so a per-card tick would be
 * noise), and any invented number.
 *
 * Polymorphic via `as`: defaults to `div`; pass `as={Link}` and `href` to
 * make the whole card the link.
 */

/** One of Autara's three accent colors — see Badge marker tones. */
export type MerchantBadgeTone = "purple" | "aqua" | "lime";

export interface MerchantBadge {
  tone: MerchantBadgeTone;
  /** The literal label rendered in the marker, e.g. "Featured". */
  label: string;
}

/** How the merchant works. Drives the meta line; omit when unknown. */
export type MerchantMode = "mobile" | "workshop" | "both";

const MODE_LABEL: Record<MerchantMode, string> = {
  mobile: "Mobile",
  workshop: "Workshop",
  both: "Mobile & workshop",
};

export interface MerchantCardProps {
  name: string;
  /**
   * Category description, e.g. "Exterior detailing". Optional; when omitted
   * the meta line carries just the location and mode.
   */
  primaryService?: string;
  /** Suburb + state, e.g. "Brunswick, VIC". */
  location: string;
  /** Mobile, workshop, or both. Omit when the data does not say. */
  mode?: MerchantMode | null;
  /**
   * Average rating, 0..5. Omit or pass 0 for a merchant with no reviews:
   * the rating row is hidden and nothing stands in for it.
   */
  rating?: number;
  reviewCount?: number;
  /** Pre-formatted price string, e.g. "$180". Omitted: no "From" row. */
  priceFromLabel?: string;
  /** Photograph URL. Omitted: a framed monogram on the warm surface. */
  heroImageUrl?: string | null;
  /**
   * Set when the merchant is new on the platform. Renders the lime
   * parallelogram "New on Autara" unless `badge` is passed. Consumers key
   * this on an activation date where the API exposes one.
   */
  isNew?: boolean;
  /** Explicit marker top-left of the photograph; wins over `isNew`. */
  badge?: MerchantBadge | null;
  /**
   * Save-button click handler. Omitted: no button. Consumer owns the
   * saved state and any sign-in gating.
   */
  onFavoriteClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /** Render the save control as saved. */
  isFavorite?: boolean;
  /** Replace the default <div> root with a framework Link component. */
  as?: ElementType;
  /** Forwarded to the root when using `as`. */
  href?: string;
  className?: string;
  /** Optional content rendered top-right instead of the save control. */
  topRightDecor?: ReactNode;
}

export const MerchantCard = forwardRef<HTMLDivElement, MerchantCardProps>(
  function MerchantCard(
    {
      name,
      primaryService,
      location,
      mode,
      rating,
      reviewCount,
      priceFromLabel,
      heroImageUrl,
      isNew,
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
    const hasRating = typeof rating === "number" && rating > 0;
    const marker: MerchantBadge | null =
      badge ?? (isNew && !hasRating ? { tone: "lime", label: "New on Autara" } : null);
    const meta = [primaryService, location, mode ? MODE_LABEL[mode] : null]
      .filter(Boolean)
      .join(" · ");

    return (
      <Comp
        ref={ref}
        href={href}
        className={cn(
          "group relative block overflow-hidden rounded-2xl glass-surface glass-surface--flat glass-surface--interactive",
          className,
        )}
      >
        {/* Photograph */}
        <div className="relative aspect-[4/3] overflow-hidden bg-[var(--surface-warm)]">
          {heroImageUrl ? (
            <img
              src={heroImageUrl}
              alt=""
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              loading="lazy"
            />
          ) : (
            /* No-photo state (Don 2026-08-26): a framed monogram on the warm
               surface reads as a deliberate system; a bare grey slab read as a
               wall of broken image loads at grid density. */
            <div aria-hidden className="flex h-full w-full items-center justify-center">
              <span className="grid h-14 w-14 place-items-center rounded-xl border border-[var(--glass-edge)] bg-[var(--surface)] text-xl font-bold tracking-[-0.03em] text-[var(--accent)]">
                {name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}

          {marker ? (
            <Badge variant={marker.tone} shape="parallelogram" className="absolute left-3 top-3">
              {marker.label}
            </Badge>
          ) : null}

          {topRightDecor ? (
            <div className="absolute right-2 top-2">{topRightDecor}</div>
          ) : null}

          {onFavoriteClick && !topRightDecor ? (
            <button
              type="button"
              aria-label={isFavorite ? `Remove ${name} from saved` : `Save ${name}`}
              aria-pressed={!!isFavorite}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onFavoriteClick(e);
              }}
              /* 44px: the a11y floor (AUTM-1039 measured the old one at 32). */
              className={cn(
                "absolute right-2 top-2 grid h-11 w-11 place-items-center rounded-xl bg-[var(--glass-fill-strong)] backdrop-blur-sm transition-colors hover:bg-[var(--surface)]",
                isFavorite ? "text-[var(--accent)]" : "text-[var(--text-muted)] hover:text-[var(--accent)]",
              )}
            >
              <svg
                viewBox="0 0 24 24"
                className="h-[18px] w-[18px]"
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

        {/* Body */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <h3 className="min-w-0 truncate text-base font-bold tracking-[-0.01em] text-[var(--text-strong)]">
              {name}
            </h3>
            {hasRating ? (
              <span className="inline-flex shrink-0 items-center gap-1 text-sm font-bold text-[var(--text-strong)]">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-[var(--accent)]" fill="currentColor" aria-hidden>
                  <path d="m12 17.27 6.18 3.73-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
                <span>
                  <span className="sr-only">Rated </span>
                  {rating.toFixed(1)}
                </span>
                {typeof reviewCount === "number" ? (
                  <span className="text-xs font-normal text-[var(--text-subtle)]">
                    ({reviewCount}
                    <span className="sr-only"> reviews</span>)
                  </span>
                ) : null}
              </span>
            ) : null}
          </div>

          <p className="mt-1 truncate text-sm text-[var(--text-muted)]">{meta}</p>

          {priceFromLabel ? (
            <p className="mt-3 text-sm text-[var(--text-muted)]">
              From{" "}
              <span className="text-base font-bold tracking-[-0.01em] text-[var(--text-strong)]">
                {priceFromLabel}
              </span>
            </p>
          ) : null}
        </div>
      </Comp>
    );
  },
);
