'use client'

import * as React from 'react'
import { useEffect, useRef } from 'react'
import { cn } from '../lib/cn'

export interface ScrollRevealProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Animation type */
    animation?: 'fade' | 'slide-up' | 'slide-left' | 'slide-right' | 'scale'
    /** Stagger children animations */
    stagger?: boolean
    /** IntersectionObserver threshold (0-1) */
    threshold?: number
    /** Root margin for early/late trigger */
    rootMargin?: string
    /** Only animate once */
    once?: boolean
}

const ScrollReveal = React.forwardRef<HTMLDivElement, ScrollRevealProps>(
    (
        {
            className,
            children,
            animation = 'fade',
            stagger = false,
            threshold = 0.15,
            rootMargin = '0px 0px -40px 0px',
            once = true,
            ...props
        },
        ref
    ) => {
        const innerRef = useRef<HTMLDivElement>(null)
        const resolvedRef = (ref as React.RefObject<HTMLDivElement>) || innerRef

        useEffect(() => {
            const el = resolvedRef.current
            if (!el) return

            const observer = new IntersectionObserver(
                ([entry]) => {
                    if (entry.isIntersecting) {
                        el.classList.add('is-visible')
                        if (once) observer.unobserve(el)
                    } else if (!once) {
                        el.classList.remove('is-visible')
                    }
                },
                { threshold, rootMargin }
            )

            observer.observe(el)
            return () => observer.disconnect()
        }, [threshold, rootMargin, once, resolvedRef])

        const animationClass = {
            fade: 'animate-on-scroll',
            'slide-up': 'animate-on-scroll',
            'slide-left': 'animate-on-scroll slide-left',
            'slide-right': 'animate-on-scroll slide-right',
            scale: 'animate-on-scroll scale-in',
        }[animation]

        return (
            <div
                ref={resolvedRef}
                className={cn(
                    animationClass,
                    stagger && 'stagger-children',
                    className
                )}
                {...props}
            >
                {children}
            </div>
        )
    }
)
ScrollReveal.displayName = 'ScrollReveal'

export { ScrollReveal }
