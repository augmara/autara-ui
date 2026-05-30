import { cn } from '../lib/cn'

/**
 * ModeChip — Mobile vs In-shop booking-mode indicator.
 *
 * Shown on booking list rows + booking detail hero so the merchant
 * can tell at a glance whether they're driving to a customer or
 * expecting them at the shop. Cross-product — admin sees the same
 * indicator on booking timelines.
 *
 * Aesthetic: hairline-ringed soft pill, muted-ink label, Solar
 * Linear-style glyph inlined (autara-ui must not depend on
 * @solar-icons/react). Lowercase "Mobile" / "In-shop" copy reads in
 * uppercase via `tracking-[0.1em]`.
 */

export type BookingMode = 'MOBILE' | 'IN_SHOP' | 'FIXED_LOCATION'

export interface ModeChipProps {
    mode: BookingMode | string | null | undefined
    size?: 'sm' | 'md'
    /** Show only the glyph (no label). Use in dense rows where the
     *  row's other content already implies the context. */
    iconOnly?: boolean
    className?: string
}

const RoutingGlyph = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
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

const ShopGlyph = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
            d="M4 9.5V20a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9.5M3 9.5l1.5-5A1 1 0 0 1 5.5 4h13a1 1 0 0 1 1 .5L21 9.5M3 9.5h18M8 14h8M8 18h5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
)

export function ModeChip({ mode, size = 'md', iconOnly = false, className }: ModeChipProps) {
    const isMobile = mode === 'MOBILE'
    const label = isMobile ? 'Mobile' : 'In-shop'
    const Glyph = isMobile ? RoutingGlyph : ShopGlyph
    const dim = size === 'sm' ? 12 : 14
    const padX = size === 'sm' ? 'px-1.5' : 'px-2'
    const padY = size === 'sm' ? 'py-0.5' : 'py-1'
    const text = size === 'sm' ? 'text-[9px]' : 'text-[10px]'

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1 rounded-md bg-[var(--surface-elevated)] ring-1 ring-inset ring-[var(--border-subtle)] font-medium uppercase tracking-[0.1em] text-[var(--text-muted)]',
                padX,
                padY,
                text,
                className,
            )}
            aria-label={`${label} booking`}
        >
            <Glyph size={dim} />
            {!iconOnly ? label : null}
        </span>
    )
}
