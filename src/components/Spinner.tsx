import * as React from 'react'
import { AutaraLoader, type AutaraLoaderSize, type AutaraLoaderTone } from './AutaraLoader'

/**
 * Spinner — an indeterminate "this is still working" indicator (AUTM-1046).
 *
 * ─── When to use it, and when not to ────────────────────────────────────
 *
 * For work in progress on something that is ALREADY on screen: a photo
 * uploading into its frame, a save running on a form the merchant is looking
 * at. The thing exists; the spinner says it is being worked on.
 *
 * NOT for content that has not arrived yet. When the eventual shape is known,
 * a shape-matched `Skeleton` / `AsyncSkeleton` is the rule ("Skeletons >
 * spinners"). And when a real percentage is available, `Progress` is better
 * than either, because it says how long is left.
 *
 * ─── Why it exists ──────────────────────────────────────────────────────
 *
 * merchant-mobile's photo uploaders laid a static "Uploading…" caption over
 * the picture. Nothing moved, so on a slow workshop connection a running
 * upload looked the same as a stuck one, which is when people tap again or
 * back out. autara-ui had no indeterminate indicator (`Progress` is
 * percentage only), and the only spinner in the package was private to
 * `Toast`. It first borrowed that one's quarter arc over a faint track; it
 * draws the Autara mark now (below).
 *
 * ─── Colour ─────────────────────────────────────────────────────────────
 *
 *   tone="accent"    (default) `--accent`, the text/border-grade purple that
 *                    stays readable in both themes. Never the literal brand
 *                    hex, which measures ~1:1 on dark surfaces.
 *   tone="current"   inherits `currentColor` — inside a button, or anywhere
 *                    the caller sets the colour with a `text-*` class.
 *   tone="on-photo"  white, for use over an image. It needs a dark scrim
 *                    under it: white over `bg-black/60` on a white photo is
 *                    ~5.7:1, while white over the bare photo can be 1:1.
 *
 * ─── Accessibility ──────────────────────────────────────────────────────
 *
 * `role="status"` with the label as visually hidden text, so a screen reader
 * hears "Uploading photo" rather than a bare "Loading". Be specific with
 * `label`. Pass `decorative` when visible text beside the spinner already
 * says the same thing; the spinner is then `aria-hidden` and announces
 * nothing, so the word is not read twice.
 *
 * ─── The mark (AUTM-1708) ──────────────────────────────────────────────
 *
 * Since AUTM-1708 it draws the Autara mark, turning (`AutaraLoader`), not a
 * quarter arc. Don asked for one loading picture everywhere (AUTM-1706), and
 * a generic ring here would have kept one in every consumer that uploads a
 * photo. The API, the sizes (1, 1.5 and 2.5rem), the tones and the labels
 * are unchanged, so a consumer bump changes the picture and nothing else.
 *
 * ─── Reduced motion ─────────────────────────────────────────────────────
 *
 * AutaraLoader's: it does not turn; the rays go to full strength, so it is
 * the logo standing still, and it breathes in opacity. A frozen loader would
 * look like the stuck upload this component exists to rule out, so the still
 * state is a different picture (the whole logo), not the moving one stopped.
 * The label is unchanged, so assistive tech hears the same thing either way.
 */

/** sm 1rem, md 1.5rem, lg 2.5rem, as before AUTM-1708. */
const SIZE = {
    sm: 16,
    md: 24,
    lg: 40,
} as const satisfies Record<string, AutaraLoaderSize>

export type SpinnerSize = keyof typeof SIZE
export type SpinnerTone = AutaraLoaderTone

export interface SpinnerProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'role' | 'children'> {
    /** `sm` 1rem, `md` 1.5rem, `lg` 2.5rem. Rem, so it scales with system text size. */
    size?: SpinnerSize
    /** `accent` (default), `current` to inherit the text colour, `on-photo` for white over a scrim. */
    tone?: SpinnerTone
    /**
     * What is being worked on, announced to screen readers. "Uploading photo"
     * beats "Loading". Ignored when `decorative`.
     */
    label?: string
    /**
     * Visible text next to the spinner already says what is happening. The
     * spinner becomes `aria-hidden` and is not announced.
     */
    decorative?: boolean
}

const Spinner = React.forwardRef<HTMLSpanElement, SpinnerProps>(
    ({ size = 'md', tone = 'accent', label = 'Loading', decorative = false, ...props }, ref) => (
        <AutaraLoader
            ref={ref}
            size={SIZE[size]}
            tone={tone}
            label={label}
            decorative={decorative}
            data-spinner=""
            {...props}
        />
    )
)
Spinner.displayName = 'Spinner'

export { Spinner }
