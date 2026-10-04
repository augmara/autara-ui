import * as React from 'react'
import { cn } from '../lib/cn'

/**
 * AutaraLoader: the Autara mark, turning, for "this is loading" (AUTM-1706).
 *
 * ─── When to use it ─────────────────────────────────────────────────────
 *
 *   48 to 96   app boot, a full page or a route that has nothing to show yet
 *   16 to 24   inline: a button's busy state (Button does this for you), a
 *              row being saved
 *
 * NOT for content whose shape is known: a shape-matched `Skeleton` makes a
 * page feel faster than any loader, so content areas keep skeletons.
 * `Spinner` keeps its own job and API (work on something already on screen,
 * a photo uploading into its frame) and draws this mark too since AUTM-1708,
 * as do Button, ConfirmDialog, SocialButton, ImageCropDialog, MessageComposer
 * and a loading Toast, so the library has one loading picture.
 *
 * ─── The mark ───────────────────────────────────────────────────────────
 *
 * The real geometry from `logo-mark.svg` (customer-web, merchant-web, admin
 * and merchant-mobile ship the same file): a ring, and eight rays pointing
 * at it. The ring is drawn as a stroked circle, which is the same shape in a
 * third of the bytes. The view box is shifted by the mark's own off-centre
 * (250.2, 250.3) so it turns about its true centre without a wobble.
 *
 * Moving, the rays are graded from the head (top, full strength) back round
 * the ring to 22%, and the whole mark turns once per `--motion-skeleton`
 * (1400ms, the motion system's one loop, so a loader and a skeleton on the
 * same page breathe together). One transform on one element: the browser
 * can run it on the compositor, and nothing inside the SVG repaints.
 *
 * ─── Colour ─────────────────────────────────────────────────────────────
 *
 * Solid, never the logo's gradient (house rule: no gradients).
 *   tone="accent"    (default) `--accent`, the text-grade purple that stays
 *                    readable in both themes. Never the brand hex, which
 *                    measures about 1:1 on dark surfaces.
 *   tone="current"   `currentColor`: inside a button, or under a `text-*`.
 *   tone="on-photo"  white, over a dark scrim on a photo.
 *
 * ─── Accessibility ──────────────────────────────────────────────────────
 *
 * `role="status"`, named by visually hidden text ("Loading" unless you say
 * something more specific), so a screen reader hears it. `decorative` when
 * visible text beside it already says so, or inside a control that is
 * already named and `aria-busy` (that is how Button uses it).
 *
 * ─── Reduced motion ─────────────────────────────────────────────────────
 *
 * No turning. The rays go to full strength, so it is the true logo standing
 * still, and the mark breathes between 100% and 55% opacity on the same
 * 1400ms. Opacity only. A frozen graded mark would look like a stuck loader;
 * a breathing logo still says "working".
 */

/**
 * px, rendered in rem so it follows system text size. 16 to 24 inline, 48 to
 * 96 for a page; 40 is `Spinner size="lg"`, over a photo being uploaded.
 */
export type AutaraLoaderSize = 16 | 20 | 24 | 40 | 48 | 64 | 80 | 96
export type AutaraLoaderTone = 'accent' | 'current' | 'on-photo'

const TONE: Record<AutaraLoaderTone, string> = {
    accent: 'text-[var(--accent)]',
    current: '',
    'on-photo': 'text-white',
}

/**
 * The eight rays of `logo-mark.svg`, clockwise from the top. Each is the
 * original subpath, closed with `z` where the export repeated the start.
 */
const RAYS = [
    'M176.3 15h147.8l-73.9 76.4z',
    'M364.3 31.7l104.5 104.5-106.3 1.8z',
    'M485.4 176.3v147.8l-76.4-73.9z',
    'M468.8 364.3l-104.5 104.5-1.8-106.3z',
    'M324.2 485.5H176.4l73.9-76.4z',
    'M136.2 468.8L31.7 364.3l106.3-1.8z',
    'M15 324.2V176.4l76.4 73.9z',
    'M31.6 136.2L136.2 31.7l1.8 106.3z',
]

/** Head first, then back round the ring: the trail behind a clockwise turn. */
const TRAIL = [1, 0.22, 0.3, 0.4, 0.52, 0.64, 0.76, 0.88]

export interface AutaraLoaderProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'role' | 'children'> {
    /** 16, 20 or 24 inline; 48, 64, 80 or 96 for a page. Default 24. */
    size?: AutaraLoaderSize
    /** `accent` (default), `current` to take the text colour, `on-photo` for white over a scrim. */
    tone?: AutaraLoaderTone
    /** Announced to screen readers. Default "Loading"; "Loading your bookings" is better. */
    label?: string
    /** Visible text or an `aria-busy` control already says so: hide it from assistive tech. */
    decorative?: boolean
}

export const AutaraLoader = React.forwardRef<HTMLSpanElement, AutaraLoaderProps>(function AutaraLoader(
    { size = 24, tone = 'accent', label = 'Loading', decorative = false, className, style, ...props },
    ref
) {
    const labelId = React.useId()
    const rem = `${size / 16}rem`
    return (
        <span
            ref={ref}
            data-size={size}
            className={cn('inline-flex shrink-0 items-center justify-center', TONE[tone], className)}
            style={{ width: rem, height: rem, ...style }}
            {...(decorative ? { 'aria-hidden': true } : { role: 'status', 'aria-labelledby': labelId })}
            {...props}
        >
            <svg
                aria-hidden
                focusable="false"
                viewBox="0.2 0.3 500 500"
                className="autara-loader block size-full"
                fill="currentColor"
            >
                <circle cx="250.2" cy="250.3" r="100.6" fill="none" stroke="currentColor" strokeWidth="67.1" />
                {RAYS.map((d, i) => (
                    <path key={i} d={d} className="autara-loader-ray" opacity={TRAIL[i]} />
                ))}
            </svg>
            {decorative ? null : (
                <span id={labelId} className="sr-only">
                    {label}
                </span>
            )}
        </span>
    )
})

AutaraLoader.displayName = 'AutaraLoader'
