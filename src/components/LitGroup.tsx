'use client'

import { forwardRef, useEffect, useRef, type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '../lib/cn'

/**
 * LitGroup — one pointer, many lit surfaces.
 *
 * AUTM-1475. `GlassSurface lit` brightens its 1px top highlight toward the
 * pointer and moves a faint sheen inside the panel. The CSS for that is
 * driven by three custom properties on each surface: `--lx`, `--ly` (where
 * the pointer is, as percentages of the surface) and `--lo` (whether it is
 * over the group at all).
 *
 * This wrapper is the ONE listener that sets them. A grid of nine tiles gets
 * one `pointermove` handler, not nine, and the writes are coalesced to one
 * animation frame. Touch pointers are ignored on purpose: a finger has no
 * hover, so the flat highlight is what a touch device sees.
 *
 * Nothing leaves a panel. The sheen and the highlight are clipped to the
 * surface's own radius, so rule 7 (no glow) holds.
 */
export interface LitGroupProps extends HTMLAttributes<HTMLDivElement> {
    children?: ReactNode
}

export const LitGroup = forwardRef<HTMLDivElement, LitGroupProps>(function LitGroup(
    { className, children, ...rest },
    ref
) {
    const innerRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        const el = innerRef.current
        if (!el) return
        let queued: PointerEvent | null = null
        let raf = 0

        const flush = () => {
            raf = 0
            const e = queued
            queued = null
            if (!e) return
            el.querySelectorAll<HTMLElement>('[data-lit]').forEach((t) => {
                const r = t.getBoundingClientRect()
                if (r.width === 0 || r.height === 0) return
                t.style.setProperty('--lx', `${(((e.clientX - r.left) / r.width) * 100).toFixed(1)}%`)
                t.style.setProperty('--ly', `${(((e.clientY - r.top) / r.height) * 100).toFixed(1)}%`)
                t.style.setProperty('--lo', '1')
            })
        }
        const onMove = (e: PointerEvent) => {
            if (e.pointerType === 'touch') return
            queued = e
            if (!raf) raf = requestAnimationFrame(flush)
        }
        const onLeave = () => {
            queued = null
            el.querySelectorAll<HTMLElement>('[data-lit]').forEach((t) => t.style.setProperty('--lo', '0'))
        }
        el.addEventListener('pointermove', onMove, { passive: true })
        el.addEventListener('pointerleave', onLeave)
        return () => {
            if (raf) cancelAnimationFrame(raf)
            el.removeEventListener('pointermove', onMove)
            el.removeEventListener('pointerleave', onLeave)
        }
    }, [])

    return (
        <div
            ref={(node) => {
                innerRef.current = node
                if (typeof ref === 'function') ref(node)
                else if (ref) ref.current = node
            }}
            data-lit-group=""
            className={cn(className)}
            {...rest}
        >
            {children}
        </div>
    )
})

LitGroup.displayName = 'LitGroup'
