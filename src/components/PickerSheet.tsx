'use client'

import * as React from 'react'

import { cn } from '../lib/cn'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from './Sheet'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from './Dialog'
import { SearchInput } from './SearchInput'
import { AsyncSkeleton } from './AsyncSkeleton'
import { ErrorCard } from './ErrorCard'
import { EmptyState } from './EmptyState'
import { Button } from './Button'

/**
 * A selectable option. Presence of `children` / `loadChildren` turns the row
 * into a drill-down into a nested list (hierarchical mode).
 */
export interface PickerOption<T = unknown> {
    /** Stable key + the value reported on selection. */
    value: string
    /** The item handed to `renderRow` + the selection callbacks. */
    data: T
    /** Pre-loaded child options — tapping the row drills into them. */
    children?: PickerOption<T>[]
    /** Lazy child loader — called on drill-in (shows a loading state). */
    loadChildren?: () => Promise<PickerOption<T>[]>
    /** Text the built-in search filters against (current level only). */
    searchText?: string
    disabled?: boolean
}

export type PickerRowRender<T> = (
    data: T,
    meta: { selected: boolean; hasChildren: boolean },
) => React.ReactNode

export interface PickerSheetProps<T = unknown> {
    /** Controlled open state. */
    open: boolean
    onOpenChange: (open: boolean) => void
    /** Header text. */
    title: string
    /** Optional subtitle under the title. */
    description?: string
    /** Root-level options. */
    options: PickerOption<T>[]
    /**
     * Render the row body (leading media + text). The row chrome — 44px min
     * height, focus ring, hover, the trailing check/chevron — is provided by
     * PickerSheet, so this returns just the content.
     */
    renderRow: PickerRowRender<T>
    /** @default 'single' */
    mode?: 'single' | 'multi'
    /** Controlled selection — a single value, or an array in multi mode. */
    selected?: string | string[]
    /** single: fires with the chosen value, then closes. */
    onSelect?: (value: string, data: T) => void
    /** multi: fires with the full selection on each toggle. */
    onSelectionChange?: (values: string[]) => void
    /** Render the built-in search filter (filters `option.searchText`). */
    searchable?: boolean
    searchPlaceholder?: string
    /** Async: show the loading skeleton instead of the list. */
    loading?: boolean
    /** Async: show an error + retry instead of the list. */
    error?: string | null
    onRetry?: () => void
    /** Empty-state copy (no options, not loading/erroring). */
    emptyTitle?: string
    emptyDescription?: string
    /** multi: footer confirm-button label. @default 'Done' */
    confirmLabel?: string
}

// Solar-linear inline glyphs (autara-ui inlines its icons — no icon dep).
function ChevronRightGlyph() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}
function CheckGlyph({ size = 18 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}
function BackGlyph() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}

/**
 * Sheet on small screens (<768px), centered Dialog on larger ones. Runtime
 * (not CSS) because the two are different Radix trees. SSR-safe: starts false,
 * corrects on mount.
 */
function useIsMobile(query = '(max-width: 767px)'): boolean {
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

interface Level<T> {
    /** null at the root; otherwise the option we drilled through. */
    parent: PickerOption<T> | null
    options: PickerOption<T>[]
}

/**
 * PickerSheet — responsive modal-select for rich, hierarchical lists.
 *
 * Bottom sheet on phones, centered dialog on tablet/web. Single + multi
 * select, optional search, drill-down with a back affordance, and the four
 * async folds (loading / error+retry / empty / results). The consumer supplies
 * a `renderRow` for the row body; the row chrome is provided here so every
 * picker stays 44px-min, keyboard-navigable, and on-brand.
 */
export function PickerSheet<T = unknown>(props: PickerSheetProps<T>) {
    const {
        open,
        onOpenChange,
        title,
        description,
        options,
        renderRow,
        mode = 'single',
        selected,
        onSelect,
        onSelectionChange,
        searchable = false,
        searchPlaceholder = 'Search…',
        loading = false,
        error = null,
        onRetry,
        emptyTitle = 'Nothing to show',
        emptyDescription,
        confirmLabel = 'Done',
    } = props

    const isMobile = useIsMobile()
    const [query, setQuery] = React.useState('')
    const [stack, setStack] = React.useState<Level<T>[]>([{ parent: null, options }])
    const [levelLoading, setLevelLoading] = React.useState(false)
    const [levelError, setLevelError] = React.useState<string | null>(null)

    // Reset drill-down + search when the picker closes.
    React.useEffect(() => {
        if (!open) {
            setQuery('')
            setStack([{ parent: null, options }])
            setLevelLoading(false)
            setLevelError(null)
        }
        // Only reset on the open→closed edge; options is refreshed below.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open])

    // Keep the root level in sync if the options prop changes while at root.
    React.useEffect(() => {
        setStack((s) => (s.length === 1 ? [{ parent: null, options }] : s))
    }, [options])

    const selectedSet = React.useMemo(() => {
        if (mode === 'multi') return new Set(Array.isArray(selected) ? selected : [])
        return new Set(typeof selected === 'string' && selected ? [selected] : [])
    }, [selected, mode])

    const current = stack[stack.length - 1]
    const atRoot = stack.length === 1

    const visible = React.useMemo(() => {
        if (!searchable || !query.trim()) return current.options
        const q = query.trim().toLowerCase()
        return current.options.filter((o) => (o.searchText ?? '').toLowerCase().includes(q))
    }, [current.options, searchable, query])

    async function drillInto(option: PickerOption<T>) {
        setLevelError(null)
        setQuery('')
        if (option.children) {
            setStack((s) => [...s, { parent: option, options: option.children! }])
            return
        }
        if (option.loadChildren) {
            setLevelLoading(true)
            try {
                const children = await option.loadChildren()
                setStack((s) => [...s, { parent: option, options: children }])
            } catch (err) {
                setLevelError(err instanceof Error ? err.message : 'Failed to load')
            } finally {
                setLevelLoading(false)
            }
        }
    }

    function goBack() {
        setQuery('')
        setLevelError(null)
        setStack((s) => (s.length > 1 ? s.slice(0, -1) : s))
    }

    function handleRow(option: PickerOption<T>) {
        if (option.disabled) return
        if (option.children || option.loadChildren) {
            void drillInto(option)
            return
        }
        if (mode === 'single') {
            onSelect?.(option.value, option.data)
            onOpenChange(false)
            return
        }
        const next = new Set(selectedSet)
        if (next.has(option.value)) next.delete(option.value)
        else next.add(option.value)
        onSelectionChange?.(Array.from(next))
    }

    const shownError = error ?? levelError
    const isLoading = loading || levelLoading

    const body = (
        <div className="flex min-h-0 flex-1 flex-col gap-3">
            {searchable && !isLoading && !shownError ? (
                <SearchInput
                    placeholder={searchPlaceholder}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
            ) : null}

            {isLoading ? (
                <AsyncSkeleton variant="list" count={4} rowHeight="h-14" />
            ) : shownError ? (
                <ErrorCard
                    message={shownError}
                    onRetry={levelError ? goBack : onRetry}
                    retryLabel={levelError ? 'Back' : 'Retry'}
                />
            ) : visible.length === 0 ? (
                <EmptyState
                    title={query.trim() ? 'No matches' : emptyTitle}
                    description={query.trim() ? undefined : emptyDescription}
                />
            ) : (
                <ul
                    role="listbox"
                    aria-label={title}
                    aria-multiselectable={mode === 'multi'}
                    className="-mx-1 flex max-h-[min(60vh,420px)] flex-col gap-1.5 overflow-y-auto px-1 py-0.5"
                >
                    {visible.map((option) => {
                        const hasChildren = !!(option.children || option.loadChildren)
                        const isSelected = selectedSet.has(option.value)
                        return (
                            <li key={option.value}>
                                <button
                                    type="button"
                                    role="option"
                                    aria-selected={isSelected}
                                    disabled={option.disabled}
                                    onClick={() => handleRow(option)}
                                    className={cn(
                                        'flex min-h-[44px] w-full items-center gap-3 rounded-2xl border px-3 py-2 text-left transition-colors',
                                        'border-[var(--border-subtle)] bg-[var(--surface)] text-[var(--text-strong)]',
                                        'hover:border-autara-purple/35',
                                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-autara-purple/35 focus-visible:ring-offset-2',
                                        'disabled:cursor-not-allowed disabled:opacity-50',
                                        isSelected && !hasChildren && 'border-autara-purple/40',
                                    )}
                                >
                                    <span className="min-w-0 flex-1">
                                        {renderRow(option.data, { selected: isSelected, hasChildren })}
                                    </span>

                                    {hasChildren ? (
                                        <span className="shrink-0 text-[var(--text-muted)]" aria-hidden="true">
                                            <ChevronRightGlyph />
                                        </span>
                                    ) : mode === 'multi' ? (
                                        <span
                                            aria-hidden="true"
                                            className={cn(
                                                'flex size-5 shrink-0 items-center justify-center rounded-[6px] border',
                                                isSelected
                                                    ? 'border-autara-purple bg-autara-purple text-white'
                                                    : 'border-[var(--border-subtle)] bg-[var(--surface)]',
                                            )}
                                        >
                                            {isSelected ? <CheckGlyph size={14} /> : null}
                                        </span>
                                    ) : isSelected ? (
                                        <span className="shrink-0 text-autara-purple" aria-hidden="true">
                                            <CheckGlyph />
                                        </span>
                                    ) : null}
                                </button>
                            </li>
                        )
                    })}
                </ul>
            )}

            {mode === 'multi' ? (
                <div className="flex items-center justify-between border-t border-[var(--border-subtle)] pt-3">
                    <span className="text-sm text-[var(--text-muted)]">
                        {selectedSet.size} selected
                    </span>
                    <Button variant="secondary" onClick={() => onOpenChange(false)}>
                        {confirmLabel}
                    </Button>
                </div>
            ) : null}
        </div>
    )

    const backButton = !atRoot ? (
        <button
            type="button"
            onClick={goBack}
            className="mb-1 inline-flex items-center gap-1 self-start rounded-md text-sm font-medium text-autara-purple focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-autara-purple/35"
        >
            <BackGlyph /> Back
        </button>
    ) : null

    if (isMobile) {
        return (
            <Sheet open={open} onOpenChange={onOpenChange}>
                <SheetContent side="bottom" className="flex max-h-[85vh] flex-col gap-3">
                    <SheetHeader>
                        {backButton}
                        <SheetTitle>{title}</SheetTitle>
                        {description ? <SheetDescription>{description}</SheetDescription> : null}
                    </SheetHeader>
                    {body}
                </SheetContent>
            </Sheet>
        )
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[85vh] max-w-lg flex-col gap-3">
                <DialogHeader>
                    {backButton}
                    <DialogTitle>{title}</DialogTitle>
                    {description ? <DialogDescription>{description}</DialogDescription> : null}
                </DialogHeader>
                {body}
            </DialogContent>
        </Dialog>
    )
}
