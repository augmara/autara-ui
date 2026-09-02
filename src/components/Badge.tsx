import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../lib/cn'

/**
 * Badge — the inline pill used for status, category, and credibility
 * markers on cards, headers, and hero surfaces.
 *
 * v1.2.0 (AUTAA-UI-006): the standalone `TrendingPill` was folded in.
 * Badge now exposes a `shape` variant:
 *
 *   - `parallelogram` (default) — the editorial tilted slab and the
 *     unique Autara silhouette. The wrapper is skewed `-12deg`; children
 *     get wrapped in a counter-skewed `<span>` so the label sits upright
 *     while the fill reads as a slanted ribbon.
 *   - `pill` — `rounded-full` capsule. Opt in with `shape="pill"` for
 *     dense rows / data tables where the tilt would crowd.
 *
 * AUTM-211 (Don 2026-06-21): parallelogram + solid colour is the house
 * style everywhere — the default flipped from `pill` to `parallelogram`.
 *
 * AUTM-948: the parallelogram is the ONLY place the skew is allowed — rule 1
 * of the Autara Glass direction. Buttons, nav, cards, chips and avatars keep
 * normal geometry. A revision that applied it to whole surfaces and to cut
 * corners was rejected by Don on 2026-09-01; do not reintroduce it.
 *
 * Variants come in four families, all unified into the single
 * `variant` prop:
 *
 *   - **Semantic status** — `act` / `flight` / `money`. Purple ACTS, aqua is
 *     IN FLIGHT, lime is DONE and money-in. Themed solid fills; reach for
 *     these for booking lifecycle state.
 *
 *   - **Marker tones** — `purple` / `aqua` / `lime`. One per Autara
 *     accent. Solid fills, white or ink text. Designed to sit over
 *     hero imagery (MerchantCard, ServiceCard). The label is a free
 *     string the consumer passes (FEATURED / NEW / TRENDING / etc.) —
 *     the tone carries no semantic meaning on its own. Per Don
 *     2026-05-30: collapsed from the previous semantic set
 *     (`featured` / `new` / `new-light` / `trending`) — the harsh
 *     lime-drive `trending` is gone; `lime` is the lime-bright one.
 *   - **Status tones** — `info` / `success` / `warning` /
 *     `destructive` / `neutral`. SOLID semantic fills (blue / green /
 *     amber / red / slate) with white-or-ink text — no soft tints, no
 *     rings (AUTM-211; Don wants solid, never the pastel Tailwind look).
 *     Used for booking + availability state. Reads in both shapes.
 *   - **Legacy palette** — the original Badge variants (`default`,
 *     `primary`, `dark-aqua`, `dark-lime`, `live`, `light-*`). Kept
 *     for backward compatibility; prefer the marker + status tones
 *     above. The dark-theme `aqua` / `lime` were renamed to
 *     `dark-aqua` / `dark-lime` to free the bare color names for the
 *     marker family.
 */

/* AUTM-948 — the size ladder moved from `text-[10px]` to `text-[0.625rem]`.
 * Identical at a 16px root, i.e. zero visual change; the difference is that a
 * badge now GROWS with OS Dynamic Type instead of staying frozen at 10px
 * while the copy beside it doubles. Same argument as AUTM-915 made for
 * Button's fixed heights. Never reintroduce a px font size here. */
const badgeVariants = cva(
    'inline-flex items-center font-medium transition-colors',
    {
        variants: {
            variant: {
                // ─── Marker tones — three Autara accents ─────────────────
                // Markers sit over hero photos and need to read against
                // arbitrary imagery — solid fill, no ring on any of the
                // three (AUTM-974), no tonal softness.
                // Color names only — the label comes from the consumer:
                //   purple → autara purple   (brand stamp)
                //   aqua   → sky aqua        (cool / fresh)
                //   lime   → lime bright     (warm / "hot" — replaces
                //                             the old trending + new-light
                //                             pair; lime-drive was dropped)
                purple:
                    'bg-autara-purple text-white px-3 py-1 text-[0.625rem] uppercase tracking-[0.16em]',
                aqua:
                    'bg-autara-sky-aqua text-[#062436] px-3 py-1 text-[0.625rem] uppercase tracking-[0.16em]',
                // AUTM-974 dropped the `ring-1 ring-inset ring-[#0E0A1A]/15`
                // this carried "for a hairline against light heros". Acid
                // lime at 12.9:1 under its own ink does not need an edge to
                // be found on a photograph, and rule 4 of the Autara Glass
                // direction only exempts a hairline that is the material of a
                // TRANSLUCENT surface. This fill is opaque.
                lime:
                    'bg-[var(--color-autara-lime-bright)] text-[#0E0A1A] px-3 py-1 text-[0.625rem] uppercase tracking-[0.16em]',

                // ─── Semantic status — AUTM-948, rule 4 ─────────────────
                // Purple ACTS · aqua IN FLIGHT · lime DONE and money-in.
                // One accent per zone; aqua and lime never compete inside
                // the same block. Before this the two of them existed only
                // as 3px dashes above KPI labels, which is why the product
                // read as "a purple app" rather than as Autara.
                //
                // Solid fills, per rule 3 — never a tint, even against
                // glass. Each pairs with the `--on-*` colour its fill
                // guarantees >=4.5:1 for: act 9.48 (light) / 6.43 (dark),
                // flight 5.56 / 11.06, money 12.89 in both.
                //
                // These theme; the older `info`/`success` tones below are
                // deliberately static. Use these for booking lifecycle
                // state, those for generic intent.
                act:
                    'bg-[var(--act-fill)] text-[var(--on-act)] px-3 py-1 text-[0.625rem] uppercase tracking-[0.16em]',
                flight:
                    'bg-[var(--flight-fill)] text-[var(--on-flight)] px-3 py-1 text-[0.625rem] uppercase tracking-[0.16em]',
                money:
                    'bg-[var(--money-fill)] text-[var(--on-money)] px-3 py-1 text-[0.625rem] uppercase tracking-[0.16em]',

                // ─── Status tones — SOLID (AUTM-211) ─────────────────────
                // Don 2026-06-21: Autara reads as SOLID color, never the
                // pastel "light tint + colored text + ring" look (that's
                // generic Tailwind). Each status tone is a solid fill in a
                // semantic colour with white/dark text for AA contrast — no
                // rgba soft fills, no inset rings. Works in both pill and
                // parallelogram shapes. See memory `feedback-solid-badges`.
                //   info → solid blue · success → solid green ·
                //   warning → solid amber (dark ink) · destructive → solid red ·
                //   neutral → solid slate
                info:
                    'bg-[var(--color-autara-info)] text-white px-3 py-1 text-[0.625rem] uppercase tracking-[0.16em]',
                success:
                    'bg-[var(--color-autara-success)] text-white px-3 py-1 text-[0.625rem] uppercase tracking-[0.16em]',
                warning:
                    'bg-[var(--color-autara-warning)] text-[#3a2a06] px-3 py-1 text-[0.625rem] uppercase tracking-[0.16em]',
                destructive:
                    'bg-[var(--color-autara-error)] text-white px-3 py-1 text-[0.625rem] uppercase tracking-[0.16em]',
                neutral:
                    'bg-[#46414f] text-white px-3 py-1 text-[0.625rem] uppercase tracking-[0.16em]',

                // ─── Default — themed neutral ───────────────────────────
                // AUTM-934: `default` used to be the legacy DARK treatment
                // (`text-white/60` on `bg-white/[0.04]`), which measures
                // 1.03:1 against the warm-cream canvas — a bare `<Badge>`
                // rendered an invisible label. It survived because every
                // call site passes an explicit tone, so nobody ever saw the
                // default twice. It now tracks the token ladder and reads in
                // both themes. The old classes live on as `dark-default`
                // for anyone genuinely on an ink surface — same rename
                // pattern as `aqua` -> `dark-aqua` in v1.2.0.
                //
                // AUTM-974 took the second half of that fix. AUTM-934 made
                // the default READ; it left it as `--surface-elevated` with a
                // hairline border, which is a fill 1.05:1 from the card with
                // the border doing the work — the outlined box rule 4 bans,
                // and the same defect AUTM-969 found on ModeChip. It now
                // takes `--neutral-fill`, the achromatic solid added for
                // exactly this, so the default is a solid object in both
                // themes rather than an outline.
                default:
                    'bg-[var(--neutral-fill)] text-[var(--on-neutral)] px-3 py-1 text-xs',

                // ─── Legacy dark-theme palette (pre-v1.2.0) ─────────────
                // Kept for backward compatibility — prefer the marker
                // and status tones above for new code.
                'dark-default':
                    'border border-white/[0.08] bg-white/[0.04] text-white/60 px-3 py-1 text-xs',
                primary:
                    'border border-autara-purple/30 bg-autara-purple/10 text-autara-purple-lighter px-3 py-1 text-xs',
                // Renamed from `aqua` / `lime` (2026-05-30) so the bare
                // color names belong to the marker family above.
                'dark-aqua':
                    'border border-autara-sky-aqua/30 bg-autara-sky-aqua/10 text-autara-sky-aqua px-3 py-1 text-xs',
                'dark-lime':
                    'border border-autara-lime-drive/30 bg-autara-lime-drive/10 text-autara-lime-drive px-3 py-1 text-xs',
                live:
                    'border border-autara-lime-drive/20 bg-autara-lime-drive/10 text-autara-lime-drive px-4 py-1.5 text-xs tracking-wide gap-2',

                // ─── Legacy light-theme palette (pre-v1.2.0) ────────────
                'light-default':
                    'border border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-[var(--text-muted)] px-3 py-1 text-xs',
                'light-primary':
                    'border border-[var(--accent-border-soft)] bg-[var(--accent-tint)] text-[var(--accent)] px-3 py-1 text-xs',
                'light-success':
                    'border border-[rgba(183,225,73,0.55)] bg-[rgba(183,225,73,0.18)] text-[var(--intent-success-text)] px-3 py-1 text-xs',
                'light-warning':
                    'border border-[rgba(245,166,35,0.35)] bg-[rgba(245,166,35,0.12)] text-[var(--intent-warning-text)] px-3 py-1 text-xs',
                'light-destructive':
                    'border border-[rgba(221,56,56,0.28)] bg-[rgba(221,56,56,0.1)] text-[var(--intent-error-text)] px-3 py-1 text-xs',
            },
            shape: {
                // Rounded capsule — still available, opt in with
                // `shape="pill"`. Use for dense rows where the tilt would
                // crowd (data tables, tight chips).
                pill: 'rounded-full',
                // Editorial tilted slab — the unique Autara silhouette and
                // now the DEFAULT (AUTM-211; Don wants parallelogram +
                // solid as the house style, not generic pills). `!rounded-md`
                // overrides legacy variants' rounded-full so the slanted edge
                // reads straight; the inner counter-skew is applied in the
                // component render below so the label sits upright.
                parallelogram:
                    '[transform:skewX(-12deg)] !rounded-md select-none whitespace-nowrap',
            },
        },
        defaultVariants: {
            variant: 'default',
            // AUTM-211: parallelogram is the Autara default silhouette. Pass
            // `shape="pill"` to opt back into the rounded capsule.
            shape: 'parallelogram',
        },
    }
)

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
        VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
    ({ className, variant, shape, children, ...props }, ref) => {
        /* AUTM-948 — resolve the shape ONCE.
         *
         * This branch used to read `shape === 'parallelogram'` off the raw
         * prop while cva applied its own `defaultVariants.shape`. When a
         * consumer passed no `shape` — which is the documented, intended way
         * to get the house silhouette — cva applied `skewX(-12deg)` and this
         * branch, seeing `undefined`, skipped the counter-skew. The result
         * was a SLANTED LABEL on every default Badge in the library.
         *
         * Rule 1 of the Autara Glass direction is explicit that the label is
         * counter-skewed; the geometry was right and the render was not.
         * Deriving both from one value is what stops it recurring. */
        const resolvedShape = shape ?? 'parallelogram'
        return (
            <div
                ref={ref}
                className={cn(
                    badgeVariants({ variant, shape: resolvedShape }),
                    className
                )}
                {...props}
            >
                {resolvedShape === 'parallelogram' ? (
                    /* Counter-skew so the label sits upright while the slab
                       reads as a tilted ribbon. Inline-flex preserves icon
                       alignment if a consumer passes an icon + label. */
                    <span className="inline-flex items-center gap-1 [transform:skewX(12deg)]">
                        {children}
                    </span>
                ) : (
                    children
                )}
            </div>
        )
    }
)
Badge.displayName = 'Badge'

export { Badge, badgeVariants }
