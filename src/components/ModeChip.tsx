import { cn } from '../lib/cn'

/**
 * ModeChip — Mobile vs In-shop booking-mode indicator.
 *
 * Shown on booking list rows + booking detail hero so the merchant can tell
 * at a glance whether they're driving to a customer or expecting them at the
 * shop. Cross-product — admin sees the same indicator on booking timelines.
 *
 * ─── AUTM-969: why this looks different ─────────────────────────────────
 *
 * It used to be a `ring-1 ring-inset` box on `--surface-elevated` with a
 * 9px muted label. Four things were wrong with that and they compounded:
 *
 *   1. The ring was doing the work a fill should do — `--surface-elevated`
 *      is 1.05:1 from the card, so the chip WAS its outline. Rule 4 of the
 *      Autara Glass direction (`knowledge/project_ui_direction_2026_09_01.md`),
 *      as Don extended it on 2026-09-01: "no outline buttons or sections …
 *      everything should be solid."
 *   2. `text-[9px]` / `text-[10px]` and pixel-sized SVGs froze the chip
 *      against OS Dynamic Type entirely. Everything here is rem or em now,
 *      so the glyph grows with the label and the label grows with the root.
 *   3. 9px uppercase muted is below any legibility floor.
 *   4. It read as chrome. Whether the merchant has to LEAVE is one of the
 *      most operationally significant facts on the row, and it was the
 *      faintest thing on it.
 *
 * ─── The three choices worth defending ──────────────────────────────────
 *
 * SHAPE — `rounded-autara-sm`, not the skewed parallelogram. Rule 1 reserves
 * the skew for pills and STATUS; a delivery mode is metadata, and unlike
 * CONFIRMED → COMPLETED it does not change over the life of the booking.
 * Rule 3's chip rung (8px) applies because the chip is under 36px tall, where
 * the shared 14px control radius would clamp to height/2 and render as a pill.
 *
 * COLOUR — `--neutral-fill`, deliberately achromatic. Rule 5 assigns purple
 * to ACTS, aqua to IN FLIGHT and lime to DONE; a delivery mode is none of
 * those, and spending an accent on it would dilute the meaning that rule is
 * establishing. MOBILE and IN-SHOP are also not coloured differently FROM
 * EACH OTHER on purpose: the glyph and the word already carry it, and a
 * second colour language is a thing the merchant would have to learn for
 * information they can already read.
 *
 * TYPE — uppercase and tracked is kept. That is the house chip grammar
 * (`MetaChip`, the editorial eyebrow), and letterspacing helps rather than
 * hurts uppercase, which has no ascender/descender profile to read by. The
 * legibility fix is the part that was actually broken: size off the pixel
 * floor, weight 500, and a fill measuring ~11:1 under its label.
 *
 * Glyphs are inlined Solar Linear-style paths — autara-ui must not depend on
 * `@solar-icons/react`.
 */

/**
 * The API's own values. `WORKSHOP` is what merchant-api actually sends
 * (`autara-merchant-mobile/src/graphql/types.ts`) and was missing here — it
 * only rendered correctly because every non-MOBILE string fell through to
 * "In-shop", which is the same fall-through that made a NULL mode claim the
 * customer was coming to the shop. Widening the union is additive; consumers
 * pass `BookingMode | string | null` and none switches exhaustively on it.
 */
export type BookingMode = 'MOBILE' | 'IN_SHOP' | 'FIXED_LOCATION' | 'WORKSHOP'

export interface ModeChipProps {
    mode: BookingMode | string | null | undefined
    size?: 'sm' | 'md'
    /** Show only the glyph (no label). Use in dense rows where the
     *  row's other content already implies the context. */
    iconOnly?: boolean
    className?: string
}

/**
 * `h-[1.15em]`, not a pixel size: the glyph is sized off the chip's own
 * label, so one rem-based type scale moves both. A pixel `width`/`height`
 * attribute is what pinned the old icon at 12px while the text around it
 * doubled.
 */
const GLYPH = 'h-[1.15em] w-[1.15em] shrink-0'

const RoutingGlyph = () => (
    <svg viewBox="0 0 24 24" fill="none" className={GLYPH} aria-hidden="true">
        <path
            d="M11 4h7.5L21 6.5V11M21 11l-2.5 2.5L21 16v3l-2.5 2.5h-5L11 19h-1.5L7 21H4l-1-1V3l1-1h3l2.5 2L11 4l1 1.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <circle cx="7" cy="6.5" r="1.2" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="17" cy="17.5" r="1.2" stroke="currentColor" strokeWidth="1.8" />
    </svg>
)

const ShopGlyph = () => (
    <svg viewBox="0 0 24 24" fill="none" className={GLYPH} aria-hidden="true">
        <path
            d="M4 9.5V20a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9.5M3 9.5l1.5-5A1 1 0 0 1 5.5 4h13a1 1 0 0 1 1 .5L21 9.5M3 9.5h18M8 14h8M8 18h5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
)

/** Every spelling of "the customer comes to us" the platform has shipped. */
const SHOP_MODES = new Set(['IN_SHOP', 'FIXED_LOCATION', 'WORKSHOP', 'SHOP'])

const SIZES = {
    sm: 'gap-1 px-2 py-[0.1875rem] text-[0.6875rem]',
    md: 'gap-1.5 px-2.5 py-1 text-[0.75rem]',
} as const

export function ModeChip({ mode, size = 'md', iconOnly = false, className }: ModeChipProps) {
    const normalized = typeof mode === 'string' ? mode.trim().toUpperCase() : ''
    const isMobile = normalized === 'MOBILE'
    const isShop = SHOP_MODES.has(normalized)

    /**
     * An unknown or missing mode renders NOTHING. It used to render
     * "In-shop", because the old branch was `mode === 'MOBILE' ? … : …` — so
     * a booking whose mode the API had not returned told the merchant the
     * customer was coming to them. A missing chip is a gap; a wrong chip is a
     * wrong answer to "do I need to leave?".
     */
    if (!isMobile && !isShop) return null

    const label = isMobile ? 'Mobile' : 'In-shop'
    const Glyph = isMobile ? RoutingGlyph : ShopGlyph

    return (
        <span
            data-mode={isMobile ? 'MOBILE' : 'IN_SHOP'}
            /**
             * Solid fill, no ring, no border, no tint — rule 4. The fill is
             * achromatic by design (see the docblock) and measures ~11:1 in
             * light / ~8:1 in dark under `--on-neutral`, asserted in
             * `src/tokens/neutral-contrast.test.ts`.
             */
            className={cn(
                'inline-flex items-center rounded-autara-sm bg-[var(--neutral-fill)] font-medium uppercase tracking-[0.08em] text-[var(--on-neutral)]',
                SIZES[size],
                className,
            )}
            {...(iconOnly ? { role: 'img' as const, 'aria-label': `${label} booking` } : {})}
        >
            <Glyph />
            {!iconOnly ? (
                <>
                    {label}
                    {/* "Mobile" alone is ambiguous read aloud out of context. */}
                    <span className="sr-only"> booking</span>
                </>
            ) : null}
        </span>
    )
}
