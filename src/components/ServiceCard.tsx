'use client'

import {
  Fragment,
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  type Ref,
} from "react";
import { cn } from "../lib/cn";

/**
 * ServiceCard: one bookable service, the same card on the merchant page's
 * service list and on the booking flow's "Pick a service" step, so the two
 * never disagree about what a service looks like.
 *
 * AUTM-1694 (Don, 2026-10-03, on the booking picker): "the service cards
 * aren't properly layout and feels empty, the thumbnails should be visible
 * not a small square, make a proper service card, more dynamic." So:
 *
 *   - The photo is the card's lead, at a fixed 4:3 with a cover crop, inset
 *     10px in a band card at 24px corners (canvas v50's menu tile, the shape
 *     merchant-mobile's Services board already draws).
 *   - A service with no photo gets a designed panel, not an empty slot and
 *     not a repeated placeholder glyph. AUTM-1211 removed the glyph because
 *     a column of identical glyphs reads as failed images; this panel shows
 *     the service's own duration or working days as a figure, so no two
 *     read alike and none reads as a broken picture. A photo that fails to
 *     load falls back to the same panel.
 *   - Two lines of description, with More to read the rest in place.
 *   - Duration, working days and anything else the consumer adds as chips.
 *   - The price block takes a headline and optional lines under it. The
 *     consumer decides what is true for its environment ("Service" and
 *     "Booking fee" when a fee is charged, a single price when it is not);
 *     the card never words a fee itself.
 *
 * Three modes, chosen by the props passed:
 *
 *   - link   (`href`, optionally `as={Link}`): the merchant page. The name is
 *            the link and its hit area stretches over the whole card.
 *   - select (`onSelect`): the booking picker. A real radio, visually hidden,
 *            labelled by the name, so cards sharing `groupName` are a radio
 *            group: arrow keys move, Space selects, a screen reader hears
 *            "radio, 2 of 6". The chosen card takes the selected colour, as
 *            ChoiceCard does.
 *   - static (neither): a card that is not bookable.
 *
 * In every mode the description's More toggle sits above the stretched hit
 * area, so reading more never books or selects anything.
 *
 * A press anywhere else on the card is the card's, by mouse, touch or pen,
 * even under a consumer's own press styles (AUTM-1786; see `HIT`).
 *
 * Layouts: `horizontal` (a list row, photo left), `vertical` (a grid tile,
 * photo on top), `adaptive` (a row on a phone, a tile from 640px). A
 * horizontal card that is narrower than 19rem stacks, which is what keeps a
 * row legible at 200% text: rem in a container query follows the user's text
 * size.
 *
 * The card is an inline-size container (`@container`), so it must get its
 * width from its parent (a list, a grid cell). Inside a shrink-to-fit parent
 * it collapses.
 */

export type ServiceCardLayout = "horizontal" | "vertical" | "adaptive";

/** A chip on the meta row. `icon` should be a Solar glyph, decorative. */
export interface ServiceCardChip {
  label: ReactNode;
  icon?: ReactNode;
  testId?: string;
}

/** One line under the price headline, e.g. `{ label: "Service", value: "$80.00" }`. */
export interface ServiceCardPriceLine {
  label: ReactNode;
  value: ReactNode;
}

/** `data-testid`s for the parts E2E locates. Treat each as public API. */
export interface ServiceCardTestIds {
  /** The link (link mode) or the radio input (select mode). */
  action?: string;
  /** The price headline. */
  price?: string;
  /** The list of price lines. */
  priceLines?: string;
  /** The duration chip. */
  duration?: string;
  /** The working-days chip. */
  workingDays?: string;
  /** The description's More / Less toggle. */
  descriptionToggle?: string;
}

export interface ServiceCardProps {
  name: string;
  /** Heading element for the name. Default `h3`; use `h2` under a page `h1`. */
  nameAs?: "h2" | "h3" | "h4" | "p";
  /** Clamped at two lines, with More to expand in place when it runs longer. */
  description?: string | null;
  /** The headline price, pre-formatted, e.g. "$83.92". */
  priceLabel: string;
  /** Optional prefix before the headline, e.g. "From". */
  pricePrefix?: string;
  /**
   * Lines under the headline, e.g. Service and Booking fee. The consumer owns
   * the wording; pass nothing to show the headline alone.
   */
  priceLines?: ReadonlyArray<ServiceCardPriceLine> | null;
  /** Pre-formatted duration, e.g. "45 min". Renders as a chip with a clock. */
  durationLabel?: string | null;
  /** Multi-day jobs, e.g. "3 working days". Renders as a chip with a calendar. */
  workingDaysLabel?: string | null;
  /** More chips after duration and working days, e.g. a drop-off tag. */
  chips?: ReadonlyArray<ServiceCardChip>;
  /** Optional hint like "+2 add-ons available", rendered as a chip. */
  addonsHint?: string | null;
  /** CDN URL for the photo, rendered in a plain <img>. Prefer `media` in Next. */
  coverImageUrl?: string | null;
  /**
   * The consumer's own image element (e.g. next/image with `fill`). Wins over
   * `coverImageUrl`. It is placed in a positioned 4:3 box.
   */
  media?: ReactNode;
  /** Replaces the designed no-photo panel. */
  fallback?: ReactNode;
  /** Decoration over the photo's top-left corner, e.g. a Badge. */
  badge?: ReactNode;
  /** Default `horizontal`. */
  layout?: ServiceCardLayout;

  /** Link mode: where the card goes. */
  href?: string;
  /** Link mode: the link component, e.g. Next's `Link`. Default `a`. */
  as?: ElementType;
  /** Link mode: a visual pill at the foot, e.g. "Book". The whole card is the link. */
  actionLabel?: string;
  /** @deprecated use `actionLabel`. */
  trailingLabel?: string;

  /** Select mode: called when the card is chosen. Passing it turns select mode on. */
  onSelect?: () => void;
  /** Whether this card is the chosen one. Paints the selected state in any mode. */
  selected?: boolean;
  /** Select mode: the radio group name. Cards sharing it form one group. */
  groupName?: string;
  /** Select mode: the radio value, e.g. the service id. */
  value?: string;

  /**
   * Staggered entrance: the card's position in its list. Fades and rises in
   * on the motion tokens, 40ms after the one before, capped at the eighth.
   * Nothing moves under reduced motion.
   */
  revealIndex?: number;

  /** `data-testid` on the card root. */
  testId?: string;
  testIds?: ServiceCardTestIds;
  className?: string;
}

type Mode = "link" | "select" | "static";

/* The grid, per layout. Four parts: the photo, the content (name and
 * description), the chips, and the foot (price, then the Book pill or the
 * radio).
 *
 *   vertical    a tile: photo over content over foot, the foot rowed to the
 *               bottom so tiles in one grid row line their prices up.
 *   horizontal  a row, shaped by the card's own width (container queries in
 *               rem, so they follow the reader's text size):
 *                 under 19rem   stacked like a tile. About 304px at default
 *                               text, so every phone keeps the row; 608px at
 *                               200% text, where a row would crush the name.
 *                 19 to 40rem   the photo beside the name and description;
 *                               chips and price run across the full width
 *                               under both, so there is no dead band under
 *                               the photo (a phone)
 *                 40rem up      photo, content, foot in three columns, the
 *                               price and the action on the right (a list on
 *                               a tablet or desktop)
 *   adaptive    the horizontal row on a phone, the vertical tile from 640px.
 *               Its classes are the horizontal ones behind `max-sm:`.
 *
 * In the 19 to 40rem band the content wrapper is `display: contents`, so the
 * name, the description and the chips are grid cells of their own. Every
 * class is written out in full, never built from a prefix, because the
 * consumer's Tailwind finds classes by scanning this file's output.
 *
 * Unprefixed classes are the stacked tile, which is what vertical, a narrow
 * horizontal card and adaptive from 640px all share.
 *
 * Only a tile fills its cell's height (`h-full`, the foot on the last row),
 * because tiles share grid rows and their prices should line up. A row takes
 * its own height: stretched beside a taller tile, its rows would spread apart
 * and open gaps between the name and the description. */
const ROW: Record<ServiceCardLayout, string> = {
  vertical: "grid h-full grid-cols-1 grid-rows-[auto_1fr_auto] gap-3",
  horizontal:
    "grid grid-cols-1 gap-3 @min-[19rem]:grid-cols-[auto_minmax(0,1fr)] @min-[19rem]:gap-x-3 @min-[19rem]:gap-y-2 @min-[40rem]:grid-cols-[auto_minmax(0,1fr)_auto]",
  adaptive:
    "grid grid-cols-1 gap-3 sm:h-full sm:grid-rows-[auto_1fr_auto] max-sm:@min-[19rem]:grid-cols-[auto_minmax(0,1fr)] max-sm:@min-[19rem]:gap-x-3 max-sm:@min-[19rem]:gap-y-2",
};

const MEDIA_BOX: Record<ServiceCardLayout, string> = {
  vertical: "w-full",
  horizontal:
    "w-full @min-[19rem]:w-32 @min-[19rem]:self-start @min-[30rem]:w-40 @min-[44rem]:w-48 @min-[19rem]:@max-[40rem]:row-span-2",
  adaptive:
    "w-full max-sm:@min-[19rem]:w-32 max-sm:@min-[19rem]:self-start max-sm:@min-[19rem]:row-span-2",
};

const CONTENT: Record<ServiceCardLayout, string> = {
  vertical: "px-1.5",
  horizontal: "px-1.5 @min-[19rem]:@max-[40rem]:contents @min-[40rem]:py-1 @min-[40rem]:pl-0",
  adaptive: "px-1.5 max-sm:@min-[19rem]:contents",
};

const NAME: Record<ServiceCardLayout, string> = {
  vertical: "",
  horizontal:
    "@min-[19rem]:@max-[40rem]:col-start-2 @min-[19rem]:@max-[40rem]:pt-1 @min-[19rem]:@max-[40rem]:pr-1.5",
  adaptive: "max-sm:@min-[19rem]:col-start-2 max-sm:@min-[19rem]:pt-1 max-sm:@min-[19rem]:pr-1.5",
};

const DESC: Record<ServiceCardLayout, string> = {
  vertical: "",
  horizontal: "@min-[19rem]:@max-[40rem]:col-start-2 @min-[19rem]:@max-[40rem]:pr-1.5",
  adaptive: "max-sm:@min-[19rem]:col-start-2 max-sm:@min-[19rem]:pr-1.5",
};

const CHIPS: Record<ServiceCardLayout, string> = {
  vertical: "",
  horizontal: "@min-[19rem]:@max-[40rem]:col-span-2 @min-[19rem]:@max-[40rem]:px-1.5",
  adaptive: "max-sm:@min-[19rem]:col-span-2 max-sm:@min-[19rem]:px-1.5",
};

const FOOT: Record<ServiceCardLayout, string> = {
  vertical: "px-1.5 pb-1.5",
  horizontal:
    "px-1.5 pb-1.5 @min-[19rem]:@max-[40rem]:col-span-2 @min-[40rem]:flex-col @min-[40rem]:items-end @min-[40rem]:pl-0 @min-[40rem]:pt-1 @min-[40rem]:text-right",
  adaptive: "px-1.5 pb-1.5 max-sm:@min-[19rem]:col-span-2",
};

/* The name's type, on the element inside the heading (see the note there). */
const NAME_TEXT = "block text-base font-bold leading-snug tracking-normal [overflow-wrap:anywhere]";

/* The stretched hit area: the link or label's ::after covers the card. It
 * covers the card only while the card root is its containing block, so every
 * element between the two stays unpositioned and untransformed.
 *
 * AUTM-1786: a press on the photo opened nothing on qa.autara.au, because
 * customer-web scales every `a[href]` to 98.5% while it is pressed, and a
 * scaled element is the containing block of its own ::after: mid-press the hit
 * area shrank from the card to the name, the release landed on the photo, and
 * the browser sent the click to a plain element. So:
 *
 *   - The link or label itself is pinned with `!` (an important declaration
 *     in a layer beats a consumer's unlayered rule): static, and no
 *     transform, scale, translate or rotate. The card presses as a whole;
 *     its name does not press on its own.
 *   - The card's own press shrinks it to 98.5%, the ::after with it, so a
 *     press held at the very edge would end just outside. While pressed, the
 *     ::after reaches out by exactly what the press takes in, (1 - 1/0.985)/2
 *     of each side (about 0.76%), so even fully pressed it covers every point
 *     of the card at rest. Only while pressed, so a card flush with a
 *     viewport edge never scrolls sideways by a few invisible pixels. Change
 *     the two numbers together.
 *
 * `forwardStrayClick` below is the backstop for anything else that confines
 * the ::after. ServiceCard.browser.test.tsx holds all three in a real browser;
 * jsdom cannot hit-test. */
const HIT =
  "cursor-pointer outline-none static! transform-none! scale-none! translate-none! rotate-none! after:absolute after:inset-0 motion-safe:active:after:inset-[calc((1_-_1/0.985)*50%)] after:z-[1] after:rounded-[1.5rem] after:content-['']";

/* Controls in the card that own their clicks: the link, the label and the
 * radio, More, and anything interactive a consumer puts in a slot. */
const OWNS_CLICK = 'a[href], button, input, label, select, textarea, summary, [role="button"], [role="link"]';

/**
 * AUTM-1786, the backstop: a click that lands anywhere on the card but on
 * none of its controls is the card's, so it goes to the link or the label.
 *
 * The browser sends a click to the element the press both began and ended on,
 * or to their nearest common ancestor. When the stretched ::after is confined
 * by CSS this component cannot see (a consumer that positions or transforms
 * the heading, say), a press on the photo begins or ends on the photo, the
 * click lands on a plain element of the card, and nothing opens. Here it
 * still does. A link gets a click carrying the same modifier keys, so the
 * consumer's link component (Next's Link reads them) sees the press it was
 * given; a label is clicked, which selects its radio.
 *
 * Never for a click a control already took (no second navigation), nor after
 * a text selection inside the card.
 */
function forwardStrayClick(event: ReactMouseEvent<HTMLDivElement>) {
  const card = event.currentTarget;
  const hit = card.querySelector<HTMLElement>("[data-hit]");
  if (!hit || event.defaultPrevented) return;
  // By node type, not `instanceof Element`, which fails across documents.
  const target = event.target as Node;
  const el = target.nodeType === 1 ? (target as Element) : target.parentElement;
  const owner = el ? el.closest(OWNS_CLICK) : null;
  if (owner && card.contains(owner)) return;
  const selection = card.ownerDocument.getSelection();
  if (selection && !selection.isCollapsed && card.contains(selection.anchorNode)) return;
  if (hit.tagName === "LABEL") {
    hit.click();
    return;
  }
  // The card's own window, not the global one, so this holds in an iframe.
  const view = card.ownerDocument.defaultView;
  if (!view) return;
  hit.dispatchEvent(
    new view.MouseEvent("click", {
      bubbles: true,
      cancelable: true,
      detail: event.detail,
      screenX: event.screenX,
      screenY: event.screenY,
      clientX: event.clientX,
      clientY: event.clientY,
      ctrlKey: event.ctrlKey,
      shiftKey: event.shiftKey,
      altKey: event.altKey,
      metaKey: event.metaKey,
      button: event.button,
      buttons: event.buttons,
    }),
  );
}

export const ServiceCard = forwardRef<HTMLElement, ServiceCardProps>(
  function ServiceCard(
    {
      name,
      nameAs = "h3",
      description,
      priceLabel,
      pricePrefix,
      priceLines,
      durationLabel,
      workingDaysLabel,
      chips,
      addonsHint,
      coverImageUrl,
      media,
      fallback,
      badge,
      layout = "horizontal",
      href,
      as,
      actionLabel,
      trailingLabel,
      onSelect,
      selected = false,
      groupName,
      value,
      revealIndex,
      testId,
      testIds,
      className,
    },
    ref,
  ) {
    const mode: Mode = onSelect ? "select" : href ? "link" : "static";
    const interactive = mode !== "static";
    const uid = useId();
    const nameId = `${uid}-name`;
    const metaId = `${uid}-meta`;
    const priceId = `${uid}-price`;
    const descId = `${uid}-desc`;
    const inputId = `${uid}-input`;

    // Which URL failed, rather than a flag: a new URL gets its own chance to
    // load without an effect to reset anything.
    const [failedUrl, setFailedUrl] = useState<string | null>(null);
    const imageFailed = Boolean(coverImageUrl) && failedUrl === coverImageUrl;

    const allChips: ServiceCardChip[] = [];
    if (workingDaysLabel) {
      allChips.push({ label: workingDaysLabel, icon: <CalendarIcon />, testId: testIds?.workingDays });
    }
    if (durationLabel) {
      allChips.push({ label: durationLabel, icon: <ClockIcon />, testId: testIds?.duration });
    }
    if (chips) allChips.push(...chips);
    if (addonsHint) allChips.push({ label: addonsHint, icon: <PlusIcon /> });

    const describedBy = [allChips.length > 0 ? metaId : null, priceId].filter(Boolean).join(" ");

    const Heading = nameAs as ElementType;
    const LinkComp = (as ?? "a") as ElementType;
    const action = actionLabel ?? trailingLabel;
    const nameInk = selected ? "text-[var(--on-selected)]" : "text-[var(--text-strong)]";

    let mediaContent: ReactNode;
    if (media) {
      mediaContent = media;
    } else if (coverImageUrl && !imageFailed) {
      mediaContent = (
        <img
          src={coverImageUrl}
          alt=""
          loading="lazy"
          decoding="async"
          onError={() => setFailedUrl(coverImageUrl)}
          className="h-full w-full object-cover"
        />
      );
    } else {
      mediaContent = fallback ?? (
        <NoPhotoPanel figure={workingDaysLabel ?? durationLabel} multiDay={Boolean(workingDaysLabel)} />
      );
    }

    const style =
      revealIndex != null
        ? ({ "--service-card-index": Math.max(0, Math.floor(revealIndex)) } as CSSProperties)
        : undefined;

    return (
      <div
        ref={ref as Ref<HTMLDivElement>}
        data-slot="service-card"
        data-layout={layout}
        data-mode={mode}
        data-selected={selected || undefined}
        data-testid={testId}
        style={style}
        onClick={interactive ? forwardStrayClick : undefined}
        className={cn(
          "group/service relative flex h-full flex-col rounded-[1.5rem] p-2.5 text-left @container",
          "transition-[background-color,scale] duration-[var(--motion-panel-in)] ease-[var(--motion-ease-out)]",
          // The focus ring is the card's, drawn when its own control (the
          // link or the radio) is keyboard-focused, never for the More toggle,
          // which draws its own.
          "has-[[data-slot=action]:focus-visible]:outline-2 has-[[data-slot=action]:focus-visible]:outline-offset-2 has-[[data-slot=action]:focus-visible]:outline-[var(--accent)]",
          selected
            ? "bg-[var(--selected)] text-[var(--on-selected)]"
            : "bg-[var(--band)] text-[var(--text-strong)]",
          interactive && !selected && "hover:bg-[var(--band-press)]",
          interactive && "cursor-pointer motion-safe:has-[[data-hit]:active]:scale-[0.985]",
          revealIndex != null && 'service-card-reveal',
          className,
        )}
      >
        {mode === "select" ? (
          <input
            id={inputId}
            type="radio"
            name={groupName ?? uid}
            value={value ?? name}
            checked={selected}
            onChange={() => onSelect?.()}
            aria-describedby={describedBy}
            data-slot="action"
            data-testid={testIds?.action}
            className="sr-only"
          />
        ) : null}

        <div className={ROW[layout]}>
          <div
            data-slot="media"
            className={cn(
              "relative aspect-[4/3] overflow-hidden rounded-2xl bg-[var(--paper)] @container/media",
              MEDIA_BOX[layout],
            )}
          >
            <div
              className={cn(
                "absolute inset-0",
                interactive &&
                  "transition-[scale] duration-[var(--motion-sheet-in)] ease-[var(--motion-ease-out)] motion-safe:group-hover/service:scale-[1.04]",
              )}
            >
              {mediaContent}
            </div>
            {badge ? <div className="absolute left-2 top-2 flex">{badge}</div> : null}
          </div>

          <div className={cn("flex min-w-0 flex-col gap-2", CONTENT[layout])}>
            {/* The heading carries placement only. Its type and colour sit on
                the element inside it, because merchant-mobile and customer-web
                both style h1 to h6 with an UNLAYERED rule (colour
                --text-strong, line-height 1.1, -0.02em), and unlayered CSS
                beats every Tailwind utility on the same element. A class on
                the heading would lose, and the name on a selected card would
                be ink on deep purple. */}
            <Heading id={nameId} className={NAME[layout]}>
              {mode === "link" ? (
                <LinkComp
                  href={href}
                  aria-describedby={describedBy}
                  data-slot="action"
                  data-hit=""
                  data-testid={testIds?.action}
                  className={cn(HIT, NAME_TEXT, nameInk)}
                >
                  {name}
                </LinkComp>
              ) : mode === "select" ? (
                <label htmlFor={inputId} data-hit="" className={cn(HIT, NAME_TEXT, nameInk)}>
                  {name}
                </label>
              ) : (
                <span className={cn(NAME_TEXT, nameInk)}>{name}</span>
              )}
            </Heading>

            {description ? (
              <Description
                id={descId}
                className={DESC[layout]}
                text={description}
                name={name}
                selected={selected}
                toggleTestId={testIds?.descriptionToggle}
              />
            ) : null}

            {allChips.length > 0 ? (
              <div id={metaId} className={cn("flex flex-wrap content-start gap-1.5", CHIPS[layout])}>
                {allChips.map((chip, i) => (
                  <Fragment key={i}>
                    {/* The separator is text, hidden from sight: a screen
                        reader pauses between chips, and the row's text reads
                        "3 working days · Drop off at the workshop", the way
                        the product writes it in prose. It sits between the
                        chips, never inside one, so each chip's own text is
                        exactly its label. */}
                    {i > 0 ? <span className="sr-only"> · </span> : null}
                    <span
                      data-testid={chip.testId}
                      className="inline-flex min-h-7 max-w-full items-center gap-1.5 rounded-full bg-[var(--raised)] px-2.5 py-0.5 text-[0.8125rem] font-medium leading-tight text-[var(--text-strong)] [overflow-wrap:anywhere]"
                    >
                      {chip.icon ? (
                        <span aria-hidden="true" className="flex shrink-0 text-[var(--text-muted)]">
                          {chip.icon}
                        </span>
                      ) : null}
                      {chip.label}
                    </span>
                  </Fragment>
                ))}
              </div>
            ) : null}
          </div>

          <div className={cn("flex flex-wrap items-end justify-between gap-x-3 gap-y-2", FOOT[layout])}>
            <div id={priceId} className="min-w-0">
              <p className="text-lg font-bold leading-tight tabular-nums">
                {pricePrefix ? (
                  <span
                    className={cn(
                      "mr-1 text-sm font-medium",
                      selected ? "text-[var(--on-selected)]" : "text-[var(--text-muted)]",
                    )}
                  >
                    {pricePrefix}
                  </span>
                ) : null}
                <span data-testid={testIds?.price}>{priceLabel}</span>
                {priceLines && priceLines.length > 0 ? <span className="sr-only">, </span> : null}
              </p>
              {priceLines && priceLines.length > 0 ? (
                /* One line per part, stacked under the total. The spaces
                   are real text, so the block reads as one sentence to a
                   screen reader and to a test: "Service $80 + booking fee
                   $3.92" when the consumer words its lines that way. */
                <p
                  data-testid={testIds?.priceLines}
                  className={cn(
                    "mt-1 text-[0.8125rem] leading-snug tabular-nums",
                    selected ? "text-[var(--on-selected)]" : "text-[var(--text-muted)]",
                  )}
                >
                  {priceLines.map((line, i) => (
                    <Fragment key={i}>
                      {i > 0 ? " " : null}
                      <span className="block">
                        {line.label} {line.value}
                      </span>
                    </Fragment>
                  ))}
                </p>
              ) : null}
            </div>

            {mode === "select" ? (
              <span
                aria-hidden="true"
                className={cn(
                  "grid size-6 shrink-0 place-items-center rounded-full transition-colors duration-[var(--motion-panel-in)]",
                  selected
                    ? "bg-[var(--on-selected)] text-[var(--selected)]"
                    : "border-2 border-[var(--field-edge)] bg-[var(--paper)]",
                )}
              >
                {selected ? <CheckIcon /> : null}
              </span>
            ) : mode === "link" && action ? (
              <span
                aria-hidden="true"
                className="inline-flex min-h-9 shrink-0 items-center rounded-[1.125rem] bg-[var(--strong)] px-4 text-[0.9375rem] font-medium leading-tight text-[var(--on-strong)] transition-colors duration-[var(--motion-panel-in)] group-hover/service:bg-[var(--strong-hover)]"
              >
                {action}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    );
  },
);

/**
 * Two lines, then More. The toggle only appears when the text is actually cut,
 * measured rather than guessed from its length, and it sits above the card's
 * stretched hit area so it never books or selects. The full text is always in
 * the DOM, so a screen reader reads all of it either way.
 */
function Description({
  id,
  className,
  text,
  name,
  selected,
  toggleTestId,
}: {
  id: string;
  className?: string;
  text: string;
  name: string;
  selected: boolean;
  toggleTestId?: string;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [clamped, setClamped] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || expanded) return;
    const measure = () => setClamped(el.scrollHeight > el.clientHeight + 1);
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [text, expanded]);

  return (
    <div className={cn("flex flex-col items-start gap-1", className)}>
      <p
        ref={ref}
        id={id}
        className={cn(
          "text-sm leading-normal [overflow-wrap:anywhere]",
          !expanded && "line-clamp-2",
          selected ? "text-[var(--on-selected)]" : "text-[var(--text-muted)]",
        )}
      >
        {text}
      </p>
      {clamped || expanded ? (
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={id}
          data-testid={toggleTestId}
          onClick={() => setExpanded((v) => !v)}
          className={cn(
            "relative z-[2] cursor-pointer rounded-md text-sm font-medium underline underline-offset-4",
            // A 44px hit area around a one-line label, without adding the
            // height to the card.
            "before:absolute before:left-1/2 before:top-1/2 before:h-11 before:w-full before:min-w-11 before:-translate-x-1/2 before:-translate-y-1/2 before:content-['']",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]",
            selected ? "text-[var(--on-selected)]" : "text-[var(--accent)]",
          )}
        >
          {expanded ? "Less" : "More"}
          <span className="sr-only"> about {name}</span>
        </button>
      ) : null}
    </div>
  );
}

/**
 * The no-photo panel: paper, one tonal step from the band card in both
 * themes and under hover, with the service's own duration or working days set
 * as a figure. Decorative; the same facts are in the chips.
 */
function NoPhotoPanel({ figure, multiDay }: { figure?: string | null; multiDay: boolean }) {
  return (
    <div
      aria-hidden="true"
      data-slot="media-fallback"
      className="flex h-full w-full flex-col justify-between bg-[var(--paper)] p-3 text-[var(--text-strong)]"
    >
      <span className="flex text-[var(--text-muted)]">
        {figure ? multiDay ? <CalendarIcon large /> : <ClockIcon large /> : <SparkleIcon />}
      </span>
      {figure ? (
        <span className="line-clamp-2 text-sm font-bold leading-tight @min-[11rem]/media:text-2xl @min-[11rem]/media:font-black @min-[16rem]/media:text-4xl">
          {figure}
        </span>
      ) : null}
    </div>
  );
}

/* Solar-style glyphs: 24 grid, round caps and joins. */

function ClockIcon({ large }: { large?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={large ? "size-6" : "size-3.5"}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  );
}

function CalendarIcon({ large }: { large?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={large ? "size-6" : "size-3.5"}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3.5" y="5" width="17" height="15.5" rx="3.5" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M11 4c.7 3.6 2.4 5.3 6 6-3.6.7-5.3 2.4-6 6-.7-3.6-2.4-5.3-6-6 3.6-.7 5.3-2.4 6-6Z" />
      <path d="M18.5 15.5c.3 1.4.9 2 2.3 2.3-1.4.3-2 .9-2.3 2.3-.3-1.4-.9-2-2.3-2.3 1.4-.3 2-.9 2.3-2.3Z" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6.5 12.5l3.5 3.5 7.5-8" />
    </svg>
  );
}

/**
 * The card's loading shape, for the same layout. Silent by default, because a
 * list renders several; pass `label` on one of them (or announce from the
 * list) so a screen reader hears that services are loading.
 */
export interface ServiceCardSkeletonProps {
  layout?: ServiceCardLayout;
  /** Announced via role="status" when set, e.g. "Loading services". */
  label?: string | null;
  testId?: string;
  className?: string;
}

const BLOCK = "motion-skeleton bg-[var(--band-press)]";

export function ServiceCardSkeleton({
  layout = "horizontal",
  label = null,
  testId,
  className,
}: ServiceCardSkeletonProps) {
  return (
    <div
      data-slot="service-card-skeleton"
      data-testid={testId}
      {...(label ? { role: "status", "aria-live": "polite" as const } : { "aria-hidden": true })}
      className={cn("flex h-full flex-col rounded-[1.5rem] bg-[var(--band)] p-2.5 @container", className)}
    >
      <div className={ROW[layout]}>
        <div className={cn("aspect-[4/3] rounded-2xl", BLOCK, MEDIA_BOX[layout])} />
        <div className={cn("flex min-w-0 flex-col gap-2", CONTENT[layout])}>
          <div className={cn("h-5 w-3/4 rounded-lg", BLOCK, NAME[layout])} />
          <div className={cn("flex flex-col gap-2", DESC[layout])}>
            <div className={cn("h-4 w-full rounded-lg", BLOCK)} />
            <div className={cn("h-4 w-2/3 rounded-lg", BLOCK)} />
          </div>
          <div className={cn("flex gap-1.5", CHIPS[layout])}>
            <div className={cn("h-7 w-16 rounded-full", BLOCK)} />
            <div className={cn("h-7 w-24 rounded-full", BLOCK)} />
          </div>
        </div>
        <div className={cn("flex flex-wrap items-end justify-between gap-x-3 gap-y-2", FOOT[layout])}>
          <div className={cn("h-6 w-20 rounded-lg", BLOCK)} />
        </div>
      </div>
      {label ? <span className="sr-only">{label}</span> : null}
    </div>
  );
}
