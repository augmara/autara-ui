import { forwardRef, type ElementType, type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '../lib/cn'

/**
 * PageContainer — the page's content track (AUTM-1739).
 *
 * Don, 2026-10-05: "all Autara websites feel contained; widen the content,
 * see Wise." Full width up to 1440px of content (--page-max), with a fluid
 * gutter either side (--page-gutter: 16px on a phone, 96px from 1440),
 * centred. At 1920 that is 1440px of content; at 1440, 1248px between 96px
 * gutters; at 390, 358px between 16px gutters.
 *
 * Put sections, grids and product visuals on the full track and keep long
 * running text to a readable line: `measure` on this component, or the
 * `.page-measure` class on a paragraph (--page-measure, about 65 to 70
 * characters).
 *
 * A server component, no script. The class it renders is `.page-container`
 * (utilities/layout.css), for markup that cannot use the component.
 */
export interface PageContainerProps extends HTMLAttributes<HTMLElement> {
    /** Render as another element (`section`, `header`, `footer`, `main`). */
    as?: ElementType
    /** Keep the content to the readable measure, for a page of running text. */
    measure?: boolean
    children?: ReactNode
}

export const PageContainer = forwardRef<HTMLElement, PageContainerProps>(function PageContainer(
    { as, measure = false, className, children, ...rest },
    ref
) {
    const Comp: ElementType = as ?? 'div'
    return (
        <Comp ref={ref} className={cn('page-container', className)} {...rest}>
            {measure ? <div className="page-measure">{children}</div> : children}
        </Comp>
    )
})

PageContainer.displayName = 'PageContainer'
