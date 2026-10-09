import * as React from 'react'
import type { ReactElement, ReactNode } from 'react'
import { cn } from '../lib/cn'

/**
 * ActionBar: the few things a person can do on a detail screen, always in
 * reach (AUTM-1781).
 *
 * Built for the customer's booking page, where Message sat 1,700px down a
 * phone and Change time and Cancel were page-size cards: one bar that holds
 * only the actions that are true right now, in the same place on every
 * status.
 *
 * One list, two presentations, switched at `lg` (64rem) by CSS so the
 * actions exist once in the DOM:
 *
 *   PHONE AND TABLET, below lg: a dock fixed to the bottom edge, paper with a
 *   hairline above, clear of the home indicator. Three to five actions are
 *   equal tiles (a 40px icon disc over a 12px label, at least 56px tall); the
 *   `primary` one's disc is the brand fill. One or two actions are pills side
 *   by side, the primary in the brand fill. Thumb reach is the point: this is
 *   where the eye and the thumb go on a phone (Uber, Lyft, Fresha's bar).
 *
 *     ┌──────────────────────────────────────────────┐
 *     │   (✉)       (➤)        (⟳)        (✕)        │
 *     │ Message  Directions Change time  Cancel       │
 *     └──────────────────────────────────────────────┘
 *
 *   DESKTOP, from lg: an in-flow list for a side panel. The primary is a
 *   full-width brand pill; the rest are rows, an icon disc, the label and a
 *   chevron (Fresha's action rows), with `description` as a second line.
 *
 * Rules the component keeps so callers cannot break them:
 *   - At most one primary: purple acts, so two purple controls is no signal.
 *   - `tone="danger"` colours the label and glyph, never a red fill (the
 *     sheet's rule: the consequence is said in danger text, and the caller's
 *     confirm asks first).
 *   - Every action has a visible label; there are no icon-only actions.
 *   - Five at most in the dock. A sixth would push every label under 70px.
 *
 * Under a fixed dock the page needs room: below lg give it a bottom padding
 * of `calc(7rem + env(safe-area-inset-bottom))` (rem, so it grows with the
 * text the way the dock does). At very large text on a narrow phone a fixed
 * bar covers too much of the screen; the caller can return it to the flow
 * with `position: static` in a container query, and should then render it
 * where it reads in order (customer-web puts it straight after the status).
 *
 * Links: autara-ui never imports a router. `element` takes an EMPTY
 * framework link and the action's content is cloned into it; `href` renders
 * a plain anchor (`external` opens a new tab and says so).
 */

export interface ActionBarAction {
    /** Stable key. Also seeds the default `data-testid`. */
    key: string
    label: string
    /** About 20px. Decorative: the label names the action. */
    icon: ReactNode
    /** The one action that leads. At most one per bar. */
    primary?: boolean
    /** Danger text and glyph, for Cancel. Never a fill. */
    tone?: 'default' | 'danger'
    /** A second line in the desktop list's rows (never on the primary pill). */
    description?: string
    onSelect?: () => void
    href?: string
    /** With `href`: a new tab, said to a screen reader. */
    external?: boolean
    /** An EMPTY framework link; the action's content is cloned into it. */
    element?: ReactElement
    /** Overrides the derived `data-testid`. A shipped one is public API. */
    testId?: string
}

export interface ActionBarProps {
    actions: ActionBarAction[]
    /** The group's accessible name, e.g. "Booking actions". */
    label: string
    className?: string
    /** Seeds each action's `data-testid` (`${testIdPrefix}-${key}`). @default 'action-bar' */
    testIdPrefix?: string
    testId?: string
}

const FOCUS =
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]'

/* Every class below is written out in full, the `lg:` ones included: Tailwind
   generates a class only when it finds it literally in the source. */

const CONTAINER =
    'fixed inset-x-0 bottom-0 z-40 border-t border-[var(--hairline)] bg-[var(--surface)] px-2 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] ' +
    'lg:static lg:z-auto lg:border-0 lg:bg-transparent lg:p-0'

const LIST_TILES = 'm-0 mx-auto flex w-full max-w-2xl list-none gap-1 p-0 lg:max-w-none lg:flex-col lg:gap-1'
const LIST_PILLS = 'm-0 mx-auto flex w-full max-w-2xl list-none gap-2 p-0 lg:max-w-none lg:flex-col lg:gap-1'

const ITEM = 'flex min-w-0 flex-1 lg:flex-none'

/** A tile in the dock, a row in the panel. */
const TILE =
    'min-h-14 w-full flex-col justify-center gap-1 rounded-2xl px-1 py-1.5 text-center text-[0.75rem] leading-tight font-medium not-disabled:hover:bg-[var(--band)] ' +
    'lg:flex-row lg:justify-start lg:gap-3 lg:px-2 lg:text-left lg:text-base lg:leading-snug'

/** The primary tile: a tile in the dock, the full-width brand pill in the panel. */
const TILE_PRIMARY =
    'min-h-14 w-full flex-col justify-center gap-1 rounded-2xl px-1 py-1.5 text-center text-[0.75rem] leading-tight font-medium text-[var(--text-strong)] not-disabled:hover:bg-[var(--band)] ' +
    'lg:mb-2 lg:min-h-12 lg:flex-row lg:gap-2 lg:rounded-full lg:bg-[var(--accent-fill)] lg:px-5 lg:text-base lg:leading-snug lg:text-[var(--on-accent)] lg:not-disabled:hover:bg-[var(--accent-fill-hover)]'

/** One or two actions: pills in the dock; the primary stays a pill in the panel, the rest become rows. */
const PILL =
    'min-h-12 w-full flex-row justify-center gap-2 rounded-full bg-[var(--band)] px-4 py-2 text-base leading-snug font-medium not-disabled:hover:bg-[var(--band-press)] ' +
    'lg:min-h-14 lg:justify-start lg:gap-3 lg:rounded-2xl lg:bg-transparent lg:px-2 lg:text-left lg:not-disabled:hover:bg-[var(--band)]'

const PILL_PRIMARY =
    'min-h-12 w-full flex-row justify-center gap-2 rounded-full bg-[var(--accent-fill)] px-4 py-2 text-base leading-snug font-medium text-[var(--on-accent)] not-disabled:hover:bg-[var(--accent-fill-hover)] ' +
    'lg:mb-2 lg:px-5'

/** The glyph's disc on a tile or row. Brand-filled on the primary tile in the dock; gone on the panel's pill. */
const DISC = 'grid size-10 shrink-0 place-items-center rounded-full bg-[var(--band)] [&>svg]:size-5'
const DISC_PRIMARY =
    'grid size-10 shrink-0 place-items-center rounded-full bg-[var(--accent-fill)] text-[var(--on-accent)] [&>svg]:size-5 ' +
    'lg:size-auto lg:bg-transparent'
/** A pill's glyph sits inline in the dock; a non-primary pill's gains the disc as a panel row. */
const BARE = 'grid shrink-0 place-items-center [&>svg]:size-5'
const BARE_TO_DISC = 'grid shrink-0 place-items-center [&>svg]:size-5 lg:size-10 lg:rounded-full lg:bg-[var(--band)]'

const CHEVRON = 'ml-auto hidden shrink-0 text-[var(--text-subtle)] lg:block'

function Chevron({ show }: { show: boolean }) {
    if (!show) return null
    return (
        // Solar AltArrowRight Linear, inlined (autara-ui does not depend on @solar-icons/react).
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden className={CHEVRON}>
            <path d="m9 6 6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}

export function ActionBar({ actions, label, className, testIdPrefix = 'action-bar', testId }: ActionBarProps) {
    if (actions.length === 0) return null
    const pills = actions.length <= 2

    return (
        <div
            role="group"
            aria-label={label}
            data-testid={testId}
            data-count={actions.length}
            className={cn(CONTAINER, className)}
        >
            <ul className={pills ? LIST_PILLS : LIST_TILES}>
                {actions.map((a) => {
                    const danger = a.tone === 'danger'
                    const shape = pills ? (a.primary ? PILL_PRIMARY : PILL) : a.primary ? TILE_PRIMARY : TILE
                    const disc = pills
                        ? a.primary
                            ? BARE
                            : BARE_TO_DISC
                        : a.primary
                          ? DISC_PRIMARY
                          : DISC
                    const controlClass = cn(
                        'group flex min-w-0 items-center transition-colors motion-press',
                        FOCUS,
                        shape,
                        !a.primary && (danger ? 'text-[var(--danger)]' : 'text-[var(--text-strong)]'),
                    )
                    const content = (
                        <>
                            <span aria-hidden className={disc}>
                                {a.icon}
                            </span>
                            {/* break-word, never anywhere: a label breaks between
                                words, and inside one only if it cannot fit at all. */}
                            <span className="flex min-w-0 flex-col [overflow-wrap:break-word]">
                                <span>{a.label}</span>
                                {/* The second line is for the panel's rows; the primary
                                    pill says one thing. */}
                                {a.description && !a.primary ? (
                                    <span className="hidden text-sm font-normal text-[var(--text-muted)] lg:block">
                                        {a.description}
                                    </span>
                                ) : null}
                            </span>
                            {a.href && a.external ? <span className="sr-only">(opens in a new tab)</span> : null}
                            <Chevron show={!a.primary} />
                        </>
                    )
                    const shared = {
                        className: controlClass,
                        'data-testid': a.testId ?? `${testIdPrefix}-${a.key}`,
                        'data-primary': a.primary ? '' : undefined,
                    }
                    let control: ReactNode
                    if (a.element) {
                        control = React.cloneElement(
                            a.element as ReactElement<Record<string, unknown>>,
                            {
                                ...shared,
                                className: cn((a.element.props as { className?: string }).className, controlClass),
                                onClick: a.onSelect,
                            },
                            content,
                        )
                    } else if (a.href) {
                        control = (
                            <a
                                href={a.href}
                                {...shared}
                                onClick={a.onSelect}
                                {...(a.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                            >
                                {content}
                            </a>
                        )
                    } else {
                        control = (
                            <button type="button" {...shared} onClick={a.onSelect}>
                                {content}
                            </button>
                        )
                    }
                    return (
                        <li key={a.key} className={ITEM}>
                            {control}
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}
