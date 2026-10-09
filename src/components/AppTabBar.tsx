import * as React from 'react'
import type { ReactElement, ReactNode } from 'react'
import { cn } from '../lib/cn'
import { badgeVariants } from './Badge'

/**
 * AppTabBar: an app's top-level destinations, one tap away (AUTM-1781).
 *
 *   ┌──────────────────────────────────────────────┐
 *   │   [▣]          [✉ 3]           [◯]           │
 *   │  Bookings     Messages       Account          │
 *   └──────────────────────────────────────────────┘
 *
 * Two variants of one list, so the destinations, their order and their
 * counts cannot drift between a phone and a desktop:
 *
 *   - `bar` (default): the phone's bottom tab bar. Fixed to the bottom edge,
 *     paper with a hairline above, clear of the home indicator
 *     (`env(safe-area-inset-bottom)`). Each tab is at least 56px tall and
 *     shares the width equally, so every target clears 44px. Hidden from
 *     `hideFrom` up (md by default), where the same items sit in the top bar.
 *   - `inline`: the same items in a row, for an app bar on a tablet or a
 *     desktop. Icon beside the label, at least 44px tall.
 *
 * The current destination is a solid brand capsule behind its icon (the
 * merchant app's dock indicator, AUTM-734: the one place purple is the fill)
 * and `aria-current="page"`. A count is a solid red disc on the icon
 * (`count-alert`, the sheet's dock count). The disc is drawn, not read:
 * `badgeLabel` is what a screen reader hears, joined to the tab's name
 * ("Messages, 3 unread"), because a bare number means nothing out of sight.
 *
 * Links: autara-ui never imports a router. Pass `element` (an EMPTY
 * framework link, e.g. `<Link href="/account/bookings" />`) and the tab's
 * content is cloned into it, as BackButton and AccountMenu do; or pass
 * `href` for a plain anchor.
 *
 * Content under a fixed bar needs room: give the page a bottom padding of
 * `calc(4.5rem + env(safe-area-inset-bottom))` below the breakpoint. rem, so
 * the room grows with the text the way the bar does.
 */

export interface AppTabBarItem {
    /** Stable key. Also seeds the default `data-testid`. */
    key: string
    label: string
    /** The tab's glyph, about 24px. Decorative: the label names the tab. */
    icon: ReactNode
    /** Drawn while the tab is current (a filled weight). Defaults to `icon`. */
    activeIcon?: ReactNode
    /** A plain anchor. Ignored when `element` is supplied. */
    href?: string
    /** An EMPTY framework link; the tab's content is cloned into it. */
    element?: ReactElement
    /** The current destination. */
    active?: boolean
    /** A count on the icon. 0, null and undefined draw nothing. */
    badge?: number | null
    /**
     * How the count is spoken, e.g. "3 unread". Joined to the label in the
     * tab's accessible name. Without it the count is drawn but not heard.
     */
    badgeLabel?: string
    /** Overrides the derived `data-testid`. A shipped one is public API. */
    testId?: string
}

export interface AppTabBarProps {
    items: AppTabBarItem[]
    /** The navigation landmark's name. @default 'Main' */
    label?: string
    /** @default 'bar' */
    variant?: 'bar' | 'inline'
    /**
     * `bar` only: the width from which the bar is hidden (the destinations
     * move to the top bar there). @default 'md'
     */
    hideFrom?: 'md' | 'lg' | 'never'
    className?: string
    /** Seeds each tab's `data-testid` (`${testIdPrefix}-${key}`). @default 'app-tab' */
    testIdPrefix?: string
}

const HIDE_FROM: Record<NonNullable<AppTabBarProps['hideFrom']>, string> = {
    md: 'md:hidden',
    lg: 'lg:hidden',
    never: '',
}

/** Counts past 99 read "99+", so the disc never outgrows the icon. */
function countText(n: number): string {
    return n > 99 ? '99+' : String(n)
}

function TabContent({
    item,
    variant,
}: {
    item: AppTabBarItem
    variant: 'bar' | 'inline'
}) {
    const count = typeof item.badge === 'number' && item.badge > 0 ? item.badge : 0
    const icon = item.active && item.activeIcon ? item.activeIcon : item.icon
    return (
        <>
            <span
                aria-hidden
                className={cn(
                    'relative grid shrink-0 place-items-center transition-colors',
                    variant === 'bar' ? 'h-8 w-14 rounded-full' : 'size-9 rounded-full',
                    item.active
                        ? 'bg-[var(--accent-fill)] text-[var(--on-accent)]'
                        : 'text-[var(--text-muted)] group-hover:text-[var(--text-strong)]',
                )}
            >
                <span className="grid size-6 place-items-center [&>svg]:size-6">{icon}</span>
                {count > 0 ? (
                    <span
                        className={cn(
                            badgeVariants({ variant: 'count-alert' }),
                            'absolute -top-1.5 rounded-full ring-2 ring-[var(--surface)]',
                            variant === 'bar' ? 'left-[calc(50%+0.375rem)]' : '-right-2',
                        )}
                    >
                        {countText(count)}
                    </span>
                ) : null}
            </span>
            <span
                className={cn(
                    'min-w-0 leading-tight [overflow-wrap:anywhere]',
                    variant === 'bar' ? 'text-center text-[0.75rem]' : 'text-[0.9375rem]',
                    item.active
                        ? 'font-bold text-[var(--text-strong)]'
                        : 'font-medium text-[var(--text-muted)] group-hover:text-[var(--text-strong)]',
                )}
            >
                {item.label}
            </span>
        </>
    )
}

export function AppTabBar({
    items,
    label = 'Main',
    variant = 'bar',
    hideFrom = 'md',
    className,
    testIdPrefix = 'app-tab',
}: AppTabBarProps) {
    const tabClass = cn(
        'group flex w-full items-center rounded-2xl',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]',
        variant === 'bar'
            ? 'min-h-14 flex-col justify-center gap-1 px-1 py-1.5'
            : 'min-h-11 flex-row gap-2 px-2.5 py-1 hover:bg-[var(--band)]',
    )

    return (
        <nav
            aria-label={label}
            data-variant={variant}
            className={cn(
                variant === 'bar'
                    ? cn(
                          'fixed inset-x-0 bottom-0 z-40 border-t border-[var(--hairline)] bg-[var(--surface)] pb-[env(safe-area-inset-bottom)]',
                          HIDE_FROM[hideFrom],
                      )
                    : 'flex items-center',
                className,
            )}
        >
            <ul
                className={cn(
                    'm-0 flex list-none p-0',
                    variant === 'bar'
                        ? 'mx-auto w-full max-w-lg items-stretch px-2 pt-1'
                        : 'items-center gap-1',
                )}
            >
                {items.map((item) => {
                    const count = typeof item.badge === 'number' && item.badge > 0 ? item.badge : 0
                    const props = {
                        className: tabClass,
                        /* The name starts with the visible label (voice control
                           matches it), then the count in words. */
                        'aria-label': count > 0 && item.badgeLabel ? `${item.label}, ${item.badgeLabel}` : undefined,
                        'aria-current': item.active ? ('page' as const) : undefined,
                        'data-testid': item.testId ?? `${testIdPrefix}-${item.key}`,
                        'data-active': item.active ? '' : undefined,
                    }
                    const content = <TabContent item={item} variant={variant} />
                    const control = item.element ? (
                        React.cloneElement(
                            item.element as ReactElement<Record<string, unknown>>,
                            {
                                ...props,
                                className: cn(
                                    (item.element.props as { className?: string }).className,
                                    tabClass,
                                ),
                            },
                            content,
                        )
                    ) : (
                        <a href={item.href} {...props}>
                            {content}
                        </a>
                    )
                    return (
                        <li key={item.key} className={variant === 'bar' ? 'flex min-w-0 flex-1' : 'flex'}>
                            {control}
                        </li>
                    )
                })}
            </ul>
        </nav>
    )
}
