'use client'

import * as React from 'react'
import { createPortal } from 'react-dom'
import { cn } from '../lib/cn'

/**
 * Toast — Autara notification primitive, modelled on the Torph
 * "Processing Transaction" pill (https://torph.lochie.me): a single-
 * line ink capsule with a leading Solar-Bold status icon and white
 * text. No drop shadow, no backdrop blur — depth comes from the ink
 * contrast against the cream canvas, in line with the Autara house
 * rule.
 *
 * The provider exposes a singleton `toast()` plus `toast.success /
 * .error / .warning / .info / .loading` shortcuts. A new
 * `toast.update(id, opts)` lets a single capsule morph in place
 * (e.g. "Submitting booking…" → "Booking confirmed"), the canonical
 * Torph status-pill pattern.
 *
 * The `theme` prop on `<ToastProvider>` is preserved for source-
 * level compat with existing consumers (autara-merchant-web) but is
 * currently a **no-op** — there is only one ink treatment. A
 * light-fill companion is deferred to a future PR.
 */

type ToastType =
    | 'default'
    | 'success'
    | 'error'
    | 'warning'
    | 'info'
    | 'loading'

/**
 * Six anchor positions, matching Sonner / react-hot-toast conventions.
 * Default is `bottom-center` (the historical Autara position).
 */
type ToastPosition =
    | 'top-left'
    | 'top-center'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right'

/**
 * Capsule variant. `dark` is the canonical Torph ink aesthetic;
 * `light` is the cream-canvas companion (white surface, ink text,
 * hairline border). Set once on the Provider, override per toast if
 * needed.
 */
type ToastVariant = 'dark' | 'light'

interface Toast {
    id: string
    /** Legacy field — combined with `description` on the single-line capsule. */
    title?: string
    description?: string
    type?: ToastType
    /** Milliseconds before auto-dismiss. `0` keeps the toast open (use with `loading`). */
    duration?: number
    /** Override the provider's variant for this single capsule. */
    variant?: ToastVariant
    action?: {
        label: string
        onClick: () => void
    }
}

interface ToastContextValue {
    toasts: Toast[]
    addToast: (toast: Omit<Toast, 'id'>) => string
    updateToast: (id: string, patch: Partial<Omit<Toast, 'id'>>) => void
    removeToast: (id: string) => void
}

const ToastContext = React.createContext<ToastContextValue | null>(null)

function useToast() {
    const context = React.useContext(ToastContext)
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider')
    }
    return context
}

// Standalone toast function (works with the singleton provider)
let globalAddToast: ((toast: Omit<Toast, 'id'>) => string) | null = null
let globalUpdateToast:
    | ((id: string, patch: Partial<Omit<Toast, 'id'>>) => void)
    | null = null
let globalRemoveToast: ((id: string) => void) | null = null

const toast = Object.assign(
    (opts: Omit<Toast, 'id'> | string) => {
        if (!globalAddToast) {
            console.warn('ToastProvider not mounted')
            return ''
        }
        if (typeof opts === 'string') {
            return globalAddToast({ description: opts })
        }
        return globalAddToast(opts)
    },
    {
        success: (opts: Omit<Toast, 'id' | 'type'> | string) => {
            const o = typeof opts === 'string' ? { description: opts } : opts
            return toast({ ...o, type: 'success' })
        },
        error: (opts: Omit<Toast, 'id' | 'type'> | string) => {
            const o = typeof opts === 'string' ? { description: opts } : opts
            return toast({ ...o, type: 'error' })
        },
        warning: (opts: Omit<Toast, 'id' | 'type'> | string) => {
            const o = typeof opts === 'string' ? { description: opts } : opts
            return toast({ ...o, type: 'warning' })
        },
        info: (opts: Omit<Toast, 'id' | 'type'> | string) => {
            const o = typeof opts === 'string' ? { description: opts } : opts
            return toast({ ...o, type: 'info' })
        },
        loading: (opts: Omit<Toast, 'id' | 'type'> | string) => {
            const o = typeof opts === 'string' ? { description: opts } : opts
            // Loading toasts persist until `update` or `dismiss` is called.
            return toast({ duration: 0, ...o, type: 'loading' })
        },
        /** Morph an existing toast in place (e.g. loading → success). */
        update: (id: string, patch: Partial<Omit<Toast, 'id'>>) => {
            globalUpdateToast?.(id, patch)
        },
        /** Programmatically dismiss a toast by id. */
        dismiss: (id: string) => {
            globalRemoveToast?.(id)
        },
    }
)

let toastCounter = 0

function ToastProvider({
    children,
    position = 'bottom-center',
    variant = 'dark',
    theme: _theme,
}: {
    children: React.ReactNode
    /** Anchor edge / corner for the toast stack. Defaults to `bottom-center`. */
    position?: ToastPosition
    /** Default capsule variant. `dark` is the canonical Torph ink; `light`
     *  uses a white surface + ink text for the cream canvas. Per-toast
     *  `variant` overrides this default. Defaults to `'dark'`. */
    variant?: ToastVariant
    /** @deprecated superseded by `variant` — currently a no-op */
    theme?: 'dark' | 'light'
}) {
    const [toasts, setToasts] = React.useState<Toast[]>([])

    const addToast = React.useCallback((t: Omit<Toast, 'id'>) => {
        const id = `toast-${++toastCounter}`
        setToasts((prev) => [
            ...prev,
            { id, duration: 4000, type: 'default', ...t },
        ])
        return id
    }, [])

    const updateToast = React.useCallback(
        (id: string, patch: Partial<Omit<Toast, 'id'>>) => {
            setToasts((prev) =>
                prev.map((t) => (t.id === id ? { ...t, ...patch } : t))
            )
        },
        []
    )

    const removeToast = React.useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
    }, [])

    React.useEffect(() => {
        globalAddToast = addToast
        globalUpdateToast = updateToast
        globalRemoveToast = removeToast
        return () => {
            globalAddToast = null
            globalUpdateToast = null
            globalRemoveToast = null
        }
    }, [addToast, updateToast, removeToast])

    return (
        <ToastContext.Provider
            value={{ toasts, addToast, updateToast, removeToast }}
        >
            {children}
            <ToastViewport
                toasts={toasts}
                removeToast={removeToast}
                position={position}
                providerVariant={variant}
            />
        </ToastContext.Provider>
    )
}

// ─── Solar Bold-style status icons ────────────────────────────────
// Accent colours for each variant — light versions are slightly
// darker so they keep ≥ 4.5:1 against the cream / white surface.

const ACCENT: Record<ToastVariant, Record<Exclude<ToastType, 'default'>, string>> = {
    dark: {
        loading: 'var(--color-autara-lime-bright)',
        success: 'var(--color-autara-lime-bright)',
        error: '#ff8a73',
        warning: '#ffc864',
        info: 'var(--color-autara-sky-aqua)',
    },
    light: {
        loading: '#4a7a14',
        success: '#3a6b14',
        error: 'var(--color-autara-error)',
        warning: 'var(--color-autara-warning-text)',
        info: '#0d4f8c',
    },
}

const SpinnerIcon: React.FC<{ color: string }> = ({ color }) => (
    <svg
        aria-hidden
        viewBox="0 0 24 24"
        width="16"
        height="16"
        className="autara-toast-spin"
        style={{ color }}
        fill="none"
        stroke="currentColor"
        strokeWidth={2.4}
        strokeLinecap="round"
    >
        <path opacity="0.25" d="M22 12a10 10 0 1 1-10-10" />
        <path d="M22 12a10 10 0 0 0-10-10" />
    </svg>
)

const CheckIcon: React.FC<{ color: string }> = ({ color }) => (
    <svg
        aria-hidden
        viewBox="0 0 24 24"
        width="16"
        height="16"
        style={{ color }}
        fill="none"
        stroke="currentColor"
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
)

const CrossIcon: React.FC<{ color: string }> = ({ color }) => (
    <svg
        aria-hidden
        viewBox="0 0 24 24"
        width="16"
        height="16"
        style={{ color }}
        fill="none"
        stroke="currentColor"
        strokeWidth={2.4}
        strokeLinecap="round"
    >
        <path d="M6 6l12 12M18 6L6 18" />
    </svg>
)

const WarningIcon: React.FC<{ color: string }> = ({ color }) => (
    <svg
        aria-hidden
        viewBox="0 0 24 24"
        width="16"
        height="16"
        style={{ color }}
        fill="currentColor"
    >
        <circle cx="12" cy="12" r="10" opacity="0.2" />
        <rect x="11" y="7" width="2" height="7" rx="1" />
        <circle cx="12" cy="17" r="1.2" />
    </svg>
)

const InfoIcon: React.FC<{ color: string }> = ({ color }) => (
    <svg
        aria-hidden
        viewBox="0 0 24 24"
        width="16"
        height="16"
        style={{ color }}
        fill="currentColor"
    >
        <circle cx="12" cy="12" r="10" opacity="0.2" />
        <circle cx="12" cy="8" r="1.2" />
        <rect x="11" y="10.5" width="2" height="7" rx="1" />
    </svg>
)

function renderTypeIcon(
    type: ToastType,
    variant: ToastVariant
): React.ReactNode {
    if (type === 'default') return null
    const color = ACCENT[variant][type]
    switch (type) {
        case 'loading':
            return <SpinnerIcon color={color} />
        case 'success':
            return <CheckIcon color={color} />
        case 'error':
            return <CrossIcon color={color} />
        case 'warning':
            return <WarningIcon color={color} />
        case 'info':
            return <InfoIcon color={color} />
    }
}

// ─── Viewport + Item ──────────────────────────────────────────────

// Maps the 6 anchor positions to viewport-layout classes. Corner
// positions hug their corner; centre positions span the full
// horizontal axis so the capsules sit dead-centre. `top-*` positions
// use `flex-col-reverse` so the newest toast renders at the corner /
// edge and older ones recede further into the page — matching Sonner.
const VIEWPORT_POS: Record<ToastPosition, string> = {
    'top-left': 'top-0 left-0 items-start flex-col-reverse',
    'top-center': 'top-0 inset-x-0 items-center flex-col-reverse',
    'top-right': 'top-0 right-0 items-end flex-col-reverse',
    'bottom-left': 'bottom-0 left-0 items-start flex-col',
    'bottom-center': 'bottom-0 inset-x-0 items-center flex-col',
    'bottom-right': 'bottom-0 right-0 items-end flex-col',
}

function ToastViewport({
    toasts,
    removeToast,
    position,
    providerVariant,
}: {
    toasts: Toast[]
    removeToast: (id: string) => void
    position: ToastPosition
    providerVariant: ToastVariant
}) {
    // Portal to document.body so transformed / contained ancestors
    // (Storybook Docs sections, modal containers with `transform`,
    // CSS `contain`, etc.) don't capture the `position: fixed`
    // anchor. SSR-safe via the mounted guard.
    const [mounted, setMounted] = React.useState(false)
    React.useEffect(() => setMounted(true), [])

    if (!mounted || toasts.length === 0) return null

    const isTop = position.startsWith('top')

    const viewport = (
        <>
            {/* Keyframes for the spinner icon — scoped, no global side effects. */}
            <style>{`
                @keyframes autaraToastSpin { to { transform: rotate(360deg); } }
                .autara-toast-spin { animation: autaraToastSpin 1s linear infinite; transform-origin: 50% 50%; }
            `}</style>
            <div
                className={cn(
                    'fixed z-[100] flex gap-2 p-4 pointer-events-none',
                    VIEWPORT_POS[position]
                )}
                role="region"
                aria-label="Notifications"
            >
                {toasts.map((t) => (
                    <ToastItem
                        key={t.id}
                        toast={t}
                        onDismiss={() => removeToast(t.id)}
                        isTop={isTop}
                        variant={t.variant ?? providerVariant}
                    />
                ))}
            </div>
        </>
    )

    return createPortal(viewport, document.body)
}

function ToastItem({
    toast: t,
    onDismiss,
    isTop,
    variant,
}: {
    toast: Toast
    onDismiss: () => void
    /** Mirror enter/exit slide direction so top toasts come down from above. */
    isTop: boolean
    /** Resolved variant — provider default, optionally overridden per toast. */
    variant: ToastVariant
}) {
    const [isVisible, setIsVisible] = React.useState(false)
    const [isLeaving, setIsLeaving] = React.useState(false)
    const [contentKey, setContentKey] = React.useState(0)
    const prevContent = React.useRef<{
        title?: string
        description?: string
        type?: ToastType
    }>({ title: t.title, description: t.description, type: t.type })

    // Bump contentKey whenever the user-visible content changes — drives
    // the Torph-style cross-fade morph on `toast.update(...)`.
    React.useEffect(() => {
        const prev = prevContent.current
        if (
            prev.title !== t.title ||
            prev.description !== t.description ||
            prev.type !== t.type
        ) {
            setContentKey((k) => k + 1)
            prevContent.current = {
                title: t.title,
                description: t.description,
                type: t.type,
            }
        }
    }, [t.title, t.description, t.type])

    React.useEffect(() => {
        requestAnimationFrame(() => setIsVisible(true))
    }, [])

    React.useEffect(() => {
        if (t.duration && t.duration > 0) {
            const timer = setTimeout(() => {
                setIsLeaving(true)
                setTimeout(onDismiss, 180)
            }, t.duration)
            return () => clearTimeout(timer)
        }
    }, [t.duration, onDismiss])

    const handleDismiss = () => {
        setIsLeaving(true)
        setTimeout(onDismiss, 180)
    }

    // Single-line message — combine legacy title + description.
    const message = [t.title, t.description].filter(Boolean).join(' — ')

    // Slide IN from above for top-anchored stacks, from below for
    // bottom-anchored ones. Same idle / leaving offsets — the direction
    // is the only thing that flips.
    const idleOffset = isTop ? '-translate-y-2' : 'translate-y-2'

    // Variant grammar — dark is the Torph ink capsule; light is the
    // cream-canvas companion (white surface + ink text + hairline).
    const isDark = variant === 'dark'
    const variantCls = isDark
        ? 'bg-[#0E0A1A] text-white'
        : 'bg-[var(--surface)] text-[var(--text-strong)] ring-1 ring-inset ring-[var(--border-subtle)]'

    return (
        <div
            className={cn(
                'pointer-events-auto inline-flex max-w-[min(560px,calc(100vw-32px))] items-center gap-2.5 rounded-full px-4 py-2 text-[13px] font-medium transition-all duration-[180ms] ease-out',
                variantCls,
                isVisible && !isLeaving
                    ? 'translate-y-0 opacity-100'
                    : `${idleOffset} opacity-0`
            )}
            role={t.type === 'error' ? 'alert' : 'status'}
        >
            {t.type && t.type !== 'default' && (
                <span className="grid h-4 w-4 shrink-0 place-items-center">
                    {renderTypeIcon(t.type, variant)}
                </span>
            )}
            <span
                key={contentKey}
                className="autara-toast-content min-w-0 truncate"
            >
                {message}
            </span>
            {t.action && (
                <button
                    onClick={t.action.onClick}
                    className={cn(
                        'ml-1 shrink-0 rounded-full px-2.5 py-1 text-[11px] uppercase tracking-[0.12em] transition-colors',
                        isDark
                            ? 'bg-white/10 text-white hover:bg-white/20'
                            : 'bg-[var(--surface-elevated)] text-[var(--text-strong)] hover:bg-[rgba(78,27,189,0.08)]'
                    )}
                >
                    {t.action.label}
                </button>
            )}
            <button
                onClick={handleDismiss}
                className={cn(
                    'ml-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full transition-colors',
                    isDark
                        ? 'text-white/45 hover:bg-white/10 hover:text-white'
                        : 'text-[var(--text-subtle)] hover:bg-[var(--surface-elevated)] hover:text-[var(--text-strong)]'
                )}
                aria-label="Dismiss notification"
            >
                <svg
                    aria-hidden
                    viewBox="0 0 24 24"
                    width="12"
                    height="12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.4}
                    strokeLinecap="round"
                >
                    <path d="M6 6l12 12M18 6L6 18" />
                </svg>
            </button>
            <style>{`
                .autara-toast-content { animation: autaraToastMorph 220ms ease-out; }
                @keyframes autaraToastMorph {
                    0%   { opacity: 0; transform: translateY(2px); filter: blur(2px); }
                    100% { opacity: 1; transform: translateY(0);  filter: blur(0);  }
                }
            `}</style>
        </div>
    )
}

export {
    ToastProvider,
    useToast,
    toast,
    type Toast,
    type ToastType,
    type ToastPosition,
    type ToastVariant,
}
