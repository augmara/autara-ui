'use client'

import {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
    type DetailsHTMLAttributes,
    type HTMLAttributes,
    type MouseEvent,
    type ReactNode,
} from 'react'
import { cn } from '../lib/cn'

/**
 * Disclosure — one question and its answer that open and close smoothly.
 *
 * AUTM-1679 (Don, 2026-10-04: "also FAQ make it animation duration and
 * better"). Built for the merchant landing's FAQ first and customer-web's
 * next. Use it for a FAQ or any "more detail" row on a marketing page.
 *
 * It is a native `<details>` / `<summary>`, so it keeps what the platform
 * gives for free: a button with its expanded state for assistive technology,
 * Enter and Space, find-in-page opening a closed answer, and an answer that
 * opens with no JavaScript at all. The answer is always in the HTML, open or
 * closed, so a crawler and the server render read it.
 *
 * With JavaScript the open and the close are animated rather than snapped:
 *   - The height runs on `grid-template-rows` from `0fr` to `1fr` and back,
 *     over `--motion-settle` on the house ease-out curve. No height is
 *     measured, and the rows below glide rather than jump.
 *   - The answer fades in over `--motion-settle` as it opens, and out over
 *     the shorter `--motion-crossfade` as it closes, so it has gone before
 *     the height has.
 *   - The icon turns: a chevron half a turn, a plus an eighth (to an ×).
 *   - Closing waits for the height to finish before the element is closed,
 *     so the answer leaves on screen rather than vanishing.
 *   - Under `prefers-reduced-motion: reduce` it opens and closes at once.
 *
 * The look is the Autara Web sheet's: a paper card with no outline and no
 * shadow (`variant="card"`, the default), or no surface at all
 * (`variant="plain"`) for a list already inside a card. Restyle with
 * `className`, `summaryClassName` and `contentClassName`.
 */

export interface DisclosureProps extends Omit<DetailsHTMLAttributes<HTMLDetailsElement>, 'onToggle' | 'children' | 'open'> {
    /** The question, the row's label. */
    summary: ReactNode
    /** The answer. */
    children: ReactNode
    /** Open on first paint, and in the server HTML. */
    defaultOpen?: boolean
    /** `card`: a paper card. `plain`: no surface. */
    variant?: 'card' | 'plain'
    /** `chevron` turns half a turn; `plus` turns to an ×. */
    icon?: 'chevron' | 'plus'
    summaryClassName?: string
    /** Extra attributes for the <summary>, a test id for example. */
    summaryProps?: HTMLAttributes<HTMLElement> & { [key: `data-${string}`]: string | undefined }
    contentClassName?: string
    /** Called once the open state changes. */
    onOpenChange?: (open: boolean) => void
}

const REDUCED = '(prefers-reduced-motion: reduce)'
/* The close waits for the height, then this much more as the fallback should
   no transitionend come. The height's own duration is read from the panel
   (--motion-settle, or whatever a consumer sets), so a longer one is not cut
   short. */
const CLOSE_GRACE_MS = 120

export const Disclosure = forwardRef<HTMLDetailsElement, DisclosureProps>(function Disclosure(
    {
        summary,
        children,
        defaultOpen = false,
        variant = 'card',
        icon = 'chevron',
        className,
        summaryClassName,
        summaryProps,
        contentClassName,
        onOpenChange,
        ...rest
    },
    ref
) {
    const detailsRef = useRef<HTMLDetailsElement>(null)
    const panelRef = useRef<HTMLDivElement>(null)
    useImperativeHandle(ref, () => detailsRef.current as HTMLDetailsElement)
    /* `open`: the element's attribute, which mounts the answer. `expanded`:
       what the panel animates to. Opening sets open first and expanded a
       frame later; closing sets expanded first and open once it has run. */
    const [open, setOpen] = useState(defaultOpen)
    const [expanded, setExpanded] = useState(defaultOpen)
    const [enhanced, setEnhanced] = useState(false)
    const closing = useRef<number | null>(null)
    const frame = useRef<number | null>(null)

    useEffect(() => {
        setEnhanced(true)
        return () => {
            if (closing.current !== null) window.clearTimeout(closing.current)
            if (frame.current !== null) cancelAnimationFrame(frame.current)
        }
    }, [])

    const finishClose = useCallback(() => {
        if (closing.current !== null) window.clearTimeout(closing.current)
        closing.current = null
        setOpen(false)
    }, [])

    function onSummaryClick(e: MouseEvent<HTMLElement>) {
        e.preventDefault()
        const reduced = window.matchMedia(REDUCED).matches
        if (!expanded) {
            if (closing.current !== null) {
                window.clearTimeout(closing.current)
                closing.current = null
            }
            setOpen(true)
            if (reduced) {
                setExpanded(true)
            } else {
                /* A frame at 0fr first, so the height has something to run from. */
                frame.current = requestAnimationFrame(() => {
                    frame.current = requestAnimationFrame(() => {
                        frame.current = null
                        setExpanded(true)
                    })
                })
            }
            onOpenChange?.(true)
        } else {
            setExpanded(false)
            if (reduced) finishClose()
            else {
                const panel = panelRef.current
                const seconds = panel ? parseFloat(getComputedStyle(panel).transitionDuration) || 0 : 0
                closing.current = window.setTimeout(finishClose, seconds * 1000 + CLOSE_GRACE_MS)
            }
            onOpenChange?.(false)
        }
    }

    /* The browser can open or close it on its own: find-in-page opening a
       closed answer, or another <details> of the same `name` opening. Its
       own changes (the attribute following `open`) are ignored. */
    function onToggle() {
        const el = detailsRef.current
        if (!el || el.open === open) return
        if (closing.current !== null) {
            window.clearTimeout(closing.current)
            closing.current = null
        }
        setOpen(el.open)
        setExpanded(el.open)
        onOpenChange?.(el.open)
    }

    return (
        <details
            ref={detailsRef}
            open={open}
            className={cn('disclosure', variant === 'card' && 'disclosure--card', className)}
            data-expanded={expanded ? 'true' : 'false'}
            data-enhanced={enhanced ? 'true' : undefined}
            data-icon={icon}
            onToggle={onToggle}
            {...rest}
        >
            <summary {...summaryProps} className={cn('disclosure-summary', summaryClassName)} onClick={onSummaryClick}>
                <span className="disclosure-label">{summary}</span>
                <span className="disclosure-icon" aria-hidden="true">
                    {icon === 'plus' ? (
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                            <path d="M5 12h14" />
                            <path d="M12 5v14" />
                        </svg>
                    ) : (
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 9l6 6 6-6" />
                        </svg>
                    )}
                </span>
            </summary>
            <div
                ref={panelRef}
                className="disclosure-panel"
                onTransitionEnd={(e) => {
                    if (e.target === e.currentTarget && e.propertyName === 'grid-template-rows' && !expanded) finishClose()
                }}
            >
                <div className="disclosure-clip">
                    <div className={cn('disclosure-content', contentClassName)}>{children}</div>
                </div>
            </div>
        </details>
    )
})

Disclosure.displayName = 'Disclosure'
