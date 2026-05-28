import { forwardRef, type ElementType, type ReactNode } from "react";
import { cn } from "../lib/cn";

/**
 * ServiceCard — the horizontal thumbnail + details card used on merchant
 * profile pages and the booking service picker. Promoted from
 * autara-customer-web/src/components/ui/ServiceCard.tsx.
 *
 * Distinct from `MerchantCard` (the photo-led marketplace card): this one
 * is a row layout — square thumbnail on the left, name + price + meta
 * stacked on the right.
 *
 * Polymorphic via `as` prop. When the consumer passes `as={Link}` or
 * an anchor, the whole card becomes interactive (hover lifts the border
 * to brand-purple, the thumbnail scales by 5%).
 */
export interface ServiceCardProps {
  name: string;
  /** Optional one- or two-line description. Truncated at line 2. */
  description?: string | null;
  /** Pre-formatted price string, e.g. "$120". */
  priceLabel: string;
  /** Optional "From " prefix for tiered services. */
  pricePrefix?: string;
  /** Pre-formatted duration, e.g. "45 min". */
  durationLabel?: string | null;
  /** CDN URL for the cover thumbnail. Falls back to a brand-tinted placeholder. */
  coverImageUrl?: string | null;
  /** Right-aligned label rendered on the meta row when interactive (e.g. "Book this"). */
  trailingLabel?: string;
  /** Optional hint like "+2 add-ons available". */
  addonsHint?: string | null;
  /** Decoration slot rendered top-right (e.g. a chip or status badge). */
  badge?: ReactNode;
  /** Make the whole card interactive — pass `as={Link}` + `href`. */
  as?: ElementType;
  href?: string;
  className?: string;
}

export const ServiceCard = forwardRef<HTMLElement, ServiceCardProps>(
  function ServiceCard(
    {
      name,
      description,
      priceLabel,
      pricePrefix,
      durationLabel,
      coverImageUrl,
      trailingLabel,
      addonsHint,
      badge,
      as,
      href,
      className,
    },
    ref,
  ) {
    const interactive = Boolean(as && href);
    const Comp = (as ?? "div") as ElementType;

    const body = (
      <div className="flex items-stretch gap-4">
        {coverImageUrl ? (
          <div className="relative aspect-square h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[var(--surface-elevated)] ring-1 ring-[var(--border-subtle)] sm:h-24 sm:w-24">
            <img
              src={coverImageUrl}
              alt=""
              aria-hidden="true"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
              loading="lazy"
            />
          </div>
        ) : (
          <div
            aria-hidden="true"
            className="grid h-20 w-20 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[rgba(78,27,189,0.08)] via-[rgba(78,27,189,0.03)] to-transparent text-[var(--color-autara-purple)] ring-1 ring-inset ring-[rgba(78,27,189,0.12)] sm:h-24 sm:w-24"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-7 w-7"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 13l2-5h12l2 5" />
              <path d="M2 17h20v-4H2z" />
              <circle cx="7" cy="17" r="2" fill="currentColor" stroke="none" opacity="0.25" />
              <circle cx="17" cy="17" r="2" fill="currentColor" stroke="none" opacity="0.25" />
            </svg>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-[15px] font-semibold leading-snug text-[var(--text-strong)] sm:text-base">
                {name}
              </h3>
              {description ? (
                <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-[var(--text-muted)]">
                  {description}
                </p>
              ) : null}
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1.5">
              {badge}
              <p className="text-[15px] font-semibold tabular-nums text-[var(--text-strong)] sm:text-base">
                {pricePrefix ? (
                  <span className="mr-1 text-[11px] font-medium uppercase tracking-wider text-[var(--text-subtle)]">
                    {pricePrefix}
                  </span>
                ) : null}
                {priceLabel}
              </p>
            </div>
          </div>

          <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-2 text-[11px] font-medium uppercase tracking-wider text-[var(--text-subtle)]">
            {durationLabel ? (
              <span className="inline-flex items-center gap-1">
                <ClockIcon />
                {durationLabel}
              </span>
            ) : null}
            {addonsHint ? (
              <span className="inline-flex items-center gap-1 text-[var(--color-autara-purple)]">
                <PlusIcon />
                {addonsHint}
              </span>
            ) : null}
            {interactive && trailingLabel ? (
              <span className="ml-auto inline-flex items-center gap-1 text-[var(--color-autara-purple)] transition-all group-hover:gap-1.5">
                {trailingLabel}
                <ArrowRightIcon />
              </span>
            ) : null}
          </div>
        </div>
      </div>
    );

    const sharedClass = cn(
      "group block rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] p-4 transition-all duration-300 sm:p-5",
      interactive &&
        "cursor-pointer hover:-translate-y-0.5 hover:border-[rgba(78,27,189,0.25)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-autara-purple)]",
      className,
    );

    return (
      <Comp
        ref={ref}
        href={href}
        aria-label={interactive ? `${name} — ${priceLabel}` : undefined}
        className={sharedClass}
      >
        {body}
      </Comp>
    );
  },
);

function ClockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-3 w-3"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-3 w-3"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-3 w-3 transition-transform group-hover:translate-x-0.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}
