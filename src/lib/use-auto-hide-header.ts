import { useEffect, useRef, useState, type RefObject } from 'react'

/**
 * useAutoHideHeader — a fixed header that steps out of the way on the way
 * down and comes back on the way up.
 *
 * AUTM-1679 (Don, 2026-10-04: "you can hide the header when scroll down.
 * when scroll up it should be appear"). Built for merchant-web's public
 * header first and customer-web's next.
 *
 * Returns `hidden`. Put `.autohide-header` and `data-hidden={hidden}` on the
 * header (utilities/autohide.css): it slides up on transform alone, so
 * nothing under it moves, and back on --motion-settle.
 *
 * The rules, in order:
 *   - Shown while `disabled` (a menu open over the page, say).
 *   - Shown while focus is inside `ref`: a keyboard user tabbing into the
 *     header always sees where they are. Focus arriving in it brings it back.
 *   - Shown at or above `after` px (default 0, the very top). Pass the bottom
 *     of a hero to keep it until the visitor is past the hero.
 *   - Hidden once the page has moved DOWN by more than `tolerance` px since
 *     the last time it moved up, so a jittery trackpad does not flicker it.
 *   - Shown on any upward scroll of more than a pixel or two.
 *
 * One passive scroll listener, read through requestAnimationFrame, so at
 * most one read per frame and never a forced layout during the scroll.
 */
export interface AutoHideHeaderOptions {
    /** The header element: while focus is inside it, it stays shown. */
    ref?: RefObject<HTMLElement | null>
    /** Never hide above this scroll position (px), or above what this returns. */
    after?: number | (() => number)
    /** Downward travel (px) before it hides. Default 12. */
    tolerance?: number
    /** Keep it shown, for example while a menu is open. */
    disabled?: boolean
}

/* Upward travel (px) that counts as scrolling up rather than jitter. */
const UP_JITTER = 2

export function useAutoHideHeader({ ref, after = 0, tolerance = 12, disabled = false }: AutoHideHeaderOptions = {}): boolean {
    const [hidden, setHidden] = useState(false)
    const [focusInside, setFocusInside] = useState(false)
    const afterRef = useRef(after)
    useEffect(() => {
        afterRef.current = after
    })

    useEffect(() => {
        const el = ref?.current
        if (!el) return
        const onIn = () => setFocusInside(true)
        const onOut = (e: FocusEvent) => {
            if (!el.contains(e.relatedTarget as Node | null)) setFocusInside(false)
        }
        el.addEventListener('focusin', onIn)
        el.addEventListener('focusout', onOut)
        return () => {
            el.removeEventListener('focusin', onIn)
            el.removeEventListener('focusout', onOut)
        }
    }, [ref])

    useEffect(() => {
        if (disabled || focusInside) {
            setHidden(false)
            return
        }
        let last = window.scrollY
        let down = 0
        let frame: number | null = null
        const read = () => {
            frame = null
            const y = window.scrollY
            const delta = y - last
            last = y
            const limit = typeof afterRef.current === 'function' ? afterRef.current() : afterRef.current
            if (y <= Math.max(0, limit)) {
                down = 0
                setHidden(false)
                return
            }
            if (delta < -UP_JITTER) {
                down = 0
                setHidden(false)
            } else if (delta > 0) {
                down += delta
                if (down > tolerance) setHidden(true)
            }
        }
        const onScroll = () => {
            if (frame === null) frame = requestAnimationFrame(read)
        }
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => {
            window.removeEventListener('scroll', onScroll)
            if (frame !== null) cancelAnimationFrame(frame)
        }
    }, [disabled, focusInside, tolerance])

    return hidden
}
