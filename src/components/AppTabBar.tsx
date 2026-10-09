'use client'

import * as React from 'react'
import type { ReactElement, ReactNode } from 'react'
import { cn } from '../lib/cn'
import { motionDurations, motionEasings } from '../lib/motion-tokens'

/**
 * AppTabBar: an app's top-level destinations, one tap away (AUTM-1781).
 *
 * The customer app's dock, as designed (canvas "Customer app", AppBookings and
 * AppHome; Don, 2026-10-09: "bottom navigation should be the same design like
 * that we have designed"):
 *
 *            ╭──────────────────────────────────╮
 *            │ ╭────────────────╮               │
 *            │ │ ▣  Bookings  ① │    ✉ ③    ◯   │
 *            │ ╰────────────────╯               │
 *            ╰──────────────────────────────────╯
 *
 * Two variants of one list, so the destinations, their order and their
 * counts cannot drift between a phone and a desktop:
 *
 *   - `bar` (default): the phone's dock. A pill of ink floating above the
 *     bottom edge, clear of the home indicator. Every destination is an icon,
 *     56 by 52px; the current one opens into a lime pill with its icon and its
 *     name. Hidden from `hideFrom` up (md by default), where the same items
 *     sit in the top bar.
 *   - `inline`: the same items in a row for an app bar on a tablet or a
 *     desktop, every name shown, the current one in the lime pill. At least
 *     44px tall.
 *
 * Motion. When the current destination changes, the lime pill slides from the
 * tab it left to the tab it lands on while the tabs move to their new places
 * and the new name fades in: FLIP, transform and opacity only, on the app
 * vocabulary's `--motion-slide` (450ms) and soft curve. It also plays when the bar is
 * mounted again by the next page (an app whose every page draws its own bar),
 * because the last positions are remembered per `label`. Under
 * `prefers-reduced-motion: reduce` nothing moves; the pill is simply there.
 *
 * Counts are a small brand disc on the tab, ringed in the colour behind it.
 * The disc is drawn, not read: `badgeLabel` is what a screen reader hears,
 * joined to the tab's name ("Messages, 3 unread"), because a bare number means
 * nothing out of sight. A tab's name is always in the accessibility tree, also
 * while only its icon is drawn. The current tab carries `aria-current="page"`.
 *
 * Links: autara-ui never imports a router. Pass `element` (an EMPTY framework
 * link, e.g. `<Link href="/account/bookings" />`) and the tab's content is
 * cloned into it, as BackButton and AccountMenu do; or pass `href` for a
 * plain anchor.
 *
 * Content under the dock needs room: give the page a bottom padding of
 * `calc(6.5rem + env(safe-area-inset-bottom))` below the breakpoint.
 */

export interface AppTabBarItem {
    /** Stable key. Also seeds the default `data-testid`. */
    key: string
    label: string
    /** The tab's glyph, about 22px. Decorative: the label names the tab. */
    icon: ReactNode
    /** Drawn while the tab is current. Defaults to `icon`. */
    activeIcon?: ReactNode
    /** A plain anchor. Ignored when `element` is supplied. */
    href?: string
    /** An EMPTY framework link; the tab's content is cloned into it. */
    element?: ReactElement
    /** The current destination. */
    active?: boolean
    /** A count on the tab. 0, null and undefined draw nothing. */
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
    /** The navigation landmark's name. Also keys the remembered positions. @default 'Main' */
    label?: string
    /** @default 'bar' */
    variant?: 'bar' | 'inline'
    /**
     * `bar` only: the width from which the dock is hidden (the destinations
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

/** Counts past 99 read "99+", so the disc never outgrows the tab. */
function countText(n: number): string {
    return n > 99 ? '99+' : String(n)
}

/* ─── Remembered geometry, for the slide between two tabs ──────────────── */

type Box = { left: number; width: number }
type Snapshot = { active: string | null; track: Box; items: Record<string, Box> }

/**
 * The last laid-out positions of each bar, by variant and label. Module scope
 * on purpose: a page that draws its own bar unmounts the old one before the
 * new one mounts, and this is what lets the new one start where the old one
 * stopped. Viewport x, so it survives the remount; the dock does not scroll.
 */
const memory = new Map<string, Snapshot>()

function boxOf(el: Element): Box {
    const r = el.getBoundingClientRect()
    return { left: r.left, width: r.width }
}

function prefersReducedMotion(): boolean {
    return typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

/** A layout effect in the browser, a no-op warning-free effect on the server. */
const useIsoLayoutEffect = typeof window === 'undefined' ? React.useEffect : React.useLayoutEffect

/** The app vocabulary's soft curve (utilities/animations.css, App motion). */
const EASE = `cubic-bezier(${motionEasings.soft.join(', ')})`

/**
 * Slide from the remembered layout to this one. Every tab moves from its old x
 * to its new x; the lime pill (inside the current tab) also starts at the old
 * current tab's box, scaled to its width, so it reads as one pill travelling.
 * The track (the ink behind the dock) eases between its two widths.
 */
function playSlide(list: HTMLUListElement, prev: Snapshot, next: Snapshot, activeKey: string | null) {
    if (typeof list.animate !== 'function') return
    const timing = { duration: motionDurations.slide, easing: EASE }

    const track = list.querySelector<HTMLElement>('[data-tab-track]')
    if (track && prev.track.width > 0 && next.track.width > 0) {
        const sx = prev.track.width / next.track.width
        const dx = prev.track.left - next.track.left
        if (Math.abs(sx - 1) > 0.002 || Math.abs(dx) > 0.5) {
            track.animate([{ transform: `translateX(${dx}px) scaleX(${sx})` }, { transform: 'none' }], timing)
        }
    }

    for (const li of Array.from(list.querySelectorAll<HTMLElement>('[data-tab-key]'))) {
        const key = li.dataset.tabKey ?? ''
        const before = prev.items[key]
        const after = next.items[key]
        if (!before || !after) continue
        const dx = before.left - after.left
        if (Math.abs(dx) > 0.5) {
            li.animate([{ transform: `translateX(${dx}px)` }, { transform: 'none' }], timing)
        }
        if (key !== activeKey) continue

        const pill = li.querySelector<HTMLElement>('[data-tab-pill]')
        const from = prev.active ? prev.items[prev.active] : undefined
        if (pill && from && after.width > 0) {
            // Relative to the tab, which is itself travelling by `dx`.
            const px = from.left - after.left - dx
            const sx = from.width / after.width
            pill.animate([{ transform: `translateX(${px}px) scaleX(${sx})` }, { transform: 'none' }], timing)
        }
        const name = li.querySelector<HTMLElement>('[data-tab-name]')
        name?.animate([{ opacity: 0 }, { opacity: 1 }], {
            duration: motionDurations.row,
            delay: motionDurations.enterStagger,
            easing: EASE,
            fill: 'backwards',
        })
    }
}

/* ─── The tab ──────────────────────────────────────────────────────────── */

function TabContent({ item, variant }: { item: AppTabBarItem; variant: 'bar' | 'inline' }) {
    const count = typeof item.badge === 'number' && item.badge > 0 ? item.badge : 0
    const icon = item.active && item.activeIcon ? item.activeIcon : item.icon
    const dock = variant === 'bar'
    /* The count disc: in the dock at the tab's top right (the design's
       position, clear of the icon); inline, on the icon's corner, so it never
       sits on the name. */
    const badge =
        count > 0 ? (
            <span
                aria-hidden
                className={cn(
                    'absolute grid h-5 min-w-5 place-items-center rounded-full border-2 bg-[var(--brand)] px-[5px] text-xs leading-none font-bold text-[var(--on-brand)] tabular-nums',
                    dock ? 'top-1 right-1.5' : '-top-2.5 -right-3',
                    item.active
                        ? 'border-[var(--lime)]'
                        : dock
                          ? 'border-[var(--surface-inverse)]'
                          : 'border-[var(--surface)]',
                )}
            >
                {countText(count)}
            </span>
        ) : null
    return (
        <>
            {item.active ? (
                <span
                    aria-hidden
                    data-tab-pill=""
                    className="absolute inset-0 origin-left rounded-full bg-[var(--lime)]"
                />
            ) : null}
            <span
                aria-hidden
                className={cn(
                    'relative grid size-[22px] shrink-0 place-items-center [&>svg]:size-[22px]',
                    item.active
                        ? 'text-[var(--on-lime)]'
                        : dock
                          ? 'text-[var(--text-on-inverse)] opacity-[0.78] group-hover:opacity-100'
                          : 'text-[var(--text-muted)] group-hover:text-[var(--text-strong)]',
                )}
            >
                {icon}
                {dock ? null : badge}
            </span>
            <span
                data-tab-name=""
                className={cn(
                    'relative min-w-0 leading-none font-bold [overflow-wrap:anywhere]',
                    dock ? 'text-base' : 'text-[0.9375rem]',
                    item.active
                        ? 'text-[var(--on-lime)]'
                        : dock
                          ? 'sr-only'
                          : 'font-medium text-[var(--text-muted)] group-hover:text-[var(--text-strong)]',
                )}
            >
                {item.label}
            </span>
            {dock ? badge : null}
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
    const listRef = React.useRef<HTMLUListElement>(null)
    const dock = variant === 'bar'
    const activeKey = items.find((i) => i.active)?.key ?? null
    const memoryKey = `${variant}:${label}`

    /* Measure after layout, before paint: slide from the remembered layout
       when the current tab is not the one it remembers, then remember this. */
    useIsoLayoutEffect(() => {
        const list = listRef.current
        if (!list) return
        const track = list.querySelector('[data-tab-track]')
        const next: Snapshot = {
            active: activeKey,
            track: track ? boxOf(track) : { left: 0, width: 0 },
            items: {},
        }
        for (const li of Array.from(list.querySelectorAll<HTMLElement>('[data-tab-key]'))) {
            next.items[li.dataset.tabKey ?? ''] = boxOf(li)
        }
        const prev = memory.get(memoryKey)
        memory.set(memoryKey, next)
        if (!prev || prev.active === activeKey || !activeKey || prefersReducedMotion()) return
        playSlide(list, prev, next, activeKey)
    }, [activeKey, memoryKey, items.length])

    const tabClass = (active: boolean) =>
        cn(
            'group relative flex items-center rounded-full outline-none',
            'focus-visible:ring-2 focus-visible:ring-offset-2',
            dock
                ? 'focus-visible:ring-[var(--lime)] focus-visible:ring-offset-[var(--surface-inverse)]'
                : 'focus-visible:ring-[var(--accent)] focus-visible:ring-offset-[var(--background)]',
            dock
                ? active
                    ? 'min-h-[52px] gap-2 pr-5 pl-4'
                    : 'h-[52px] w-14 justify-center'
                : active
                  ? 'min-h-11 gap-3 pr-4 pl-3'
                  : 'min-h-11 gap-3 px-3 hover:bg-[var(--band)]',
        )

    return (
        <nav
            aria-label={label}
            data-variant={variant}
            className={cn(
                dock
                    ? cn(
                          'pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-[calc(1rem+env(safe-area-inset-bottom))]',
                          HIDE_FROM[hideFrom],
                      )
                    : 'flex items-center',
                className,
            )}
        >
            <ul
                ref={listRef}
                className={cn(
                    'relative m-0 flex max-w-full list-none items-center gap-1 p-0',
                    dock ? 'pointer-events-auto p-1.5' : '',
                )}
            >
                {dock ? (
                    <span
                        aria-hidden
                        data-tab-track=""
                        className="absolute inset-0 origin-left rounded-full bg-[var(--surface-inverse)]"
                    />
                ) : null}
                {items.map((item) => {
                    const count = typeof item.badge === 'number' && item.badge > 0 ? item.badge : 0
                    const cls = tabClass(!!item.active)
                    const props = {
                        className: cls,
                        /* The name starts with the label (voice control matches
                           it), then the count in words. */
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
                                className: cn((item.element.props as { className?: string }).className, cls),
                            },
                            content,
                        )
                    ) : (
                        <a href={item.href} {...props}>
                            {content}
                        </a>
                    )
                    return (
                        <li key={item.key} data-tab-key={item.key} className="relative flex min-w-0 shrink">
                            {control}
                        </li>
                    )
                })}
            </ul>
        </nav>
    )
}
