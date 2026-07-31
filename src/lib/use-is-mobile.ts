import * as React from 'react'

/**
 * True below the `md` breakpoint (<768px).
 *
 * Used by the modal family (PickerSheet, AddressPickerSheet) to pick a
 * bottom Sheet on phones and a centered Dialog on tablet/desktop. This has
 * to be a runtime decision rather than a CSS one because the two are
 * different Radix trees — you cannot swap them with a media query.
 *
 * SSR-safe: starts `false` (desktop) and corrects on mount, so the server
 * and first client render agree and React never warns about a hydration
 * mismatch. The one-frame desktop→mobile correction is invisible because
 * these components only mount when already open.
 *
 * PickerSheet still carries a private copy of this hook; converging the two
 * is a follow-up (it is being edited in a parallel branch, and reaching into
 * it here would create a cross-branch conflict for no user-visible gain).
 */
export function useIsMobile(query = '(max-width: 767px)'): boolean {
    const [isMobile, setIsMobile] = React.useState(false)

    React.useEffect(() => {
        if (typeof window === 'undefined' || !window.matchMedia) return
        const mq = window.matchMedia(query)
        setIsMobile(mq.matches)
        const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
        mq.addEventListener('change', handler)
        return () => mq.removeEventListener('change', handler)
    }, [query])

    return isMobile
}
