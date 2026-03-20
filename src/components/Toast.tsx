'use client'

import * as React from 'react'
import { cn } from '../lib/cn'

type ToastType = 'default' | 'success' | 'error' | 'warning' | 'info'

interface Toast {
    id: string
    title?: string
    description?: string
    type?: ToastType
    duration?: number
    action?: {
        label: string
        onClick: () => void
    }
}

interface ToastContextValue {
    toasts: Toast[]
    addToast: (toast: Omit<Toast, 'id'>) => string
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
    }
)

let toastCounter = 0

function ToastProvider({
    children,
    theme = 'dark',
}: {
    children: React.ReactNode
    theme?: 'dark' | 'light'
}) {
    const [toasts, setToasts] = React.useState<Toast[]>([])

    const addToast = React.useCallback((toast: Omit<Toast, 'id'>) => {
        const id = `toast-${++toastCounter}`
        setToasts((prev) => [...prev, { id, duration: 4000, type: 'default', ...toast }])
        return id
    }, [])

    const removeToast = React.useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
    }, [])

    React.useEffect(() => {
        globalAddToast = addToast
        return () => {
            globalAddToast = null
        }
    }, [addToast])

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
            {children}
            <ToastViewport toasts={toasts} removeToast={removeToast} theme={theme} />
        </ToastContext.Provider>
    )
}

const typeIcons: Record<ToastType, React.ReactNode> = {
    default: null,
    success: (
        <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    error: (
        <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
    ),
    warning: (
        <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
    ),
    info: (
        <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
        </svg>
    ),
}

function ToastViewport({
    toasts,
    removeToast,
    theme,
}: {
    toasts: Toast[]
    removeToast: (id: string) => void
    theme: 'dark' | 'light'
}) {
    if (toasts.length === 0) return null

    return (
        <div className="fixed bottom-0 right-0 z-[100] flex flex-col gap-2 p-4 max-w-[420px] w-full pointer-events-none">
            {toasts.map((t) => (
                <ToastItem key={t.id} toast={t} onDismiss={() => removeToast(t.id)} theme={theme} />
            ))}
        </div>
    )
}

function ToastItem({
    toast: t,
    onDismiss,
    theme,
}: {
    toast: Toast
    onDismiss: () => void
    theme: 'dark' | 'light'
}) {
    const [isVisible, setIsVisible] = React.useState(false)
    const [isLeaving, setIsLeaving] = React.useState(false)
    const isDark = theme === 'dark'

    React.useEffect(() => {
        requestAnimationFrame(() => setIsVisible(true))
    }, [])

    React.useEffect(() => {
        if (t.duration && t.duration > 0) {
            const timer = setTimeout(() => {
                setIsLeaving(true)
                setTimeout(onDismiss, 200)
            }, t.duration)
            return () => clearTimeout(timer)
        }
    }, [t.duration, onDismiss])

    const handleDismiss = () => {
        setIsLeaving(true)
        setTimeout(onDismiss, 200)
    }

    return (
        <div
            className={cn(
                'pointer-events-auto rounded-xl border p-4 shadow-xl transition-all duration-200 ease-out',
                isVisible && !isLeaving
                    ? 'translate-y-0 opacity-100'
                    : 'translate-y-2 opacity-0',
                isDark
                    ? 'border-white/[0.08] bg-[#1a1025]/95 backdrop-blur-xl'
                    : 'border-autara-gray-200 bg-white shadow-autara-lg'
            )}
        >
            <div className="flex items-start gap-3">
                {t.type && t.type !== 'default' && (
                    <div className="mt-0.5 shrink-0">{typeIcons[t.type]}</div>
                )}
                <div className="flex-1 min-w-0">
                    {t.title && (
                        <div className={cn('text-sm font-semibold', isDark ? 'text-white' : 'text-autara-gray-900')}>
                            {t.title}
                        </div>
                    )}
                    {t.description && (
                        <div className={cn('text-sm', t.title ? 'mt-1' : '', isDark ? 'text-white/60' : 'text-autara-gray-500')}>
                            {t.description}
                        </div>
                    )}
                </div>
                {t.action && (
                    <button
                        onClick={t.action.onClick}
                        className={cn(
                            'shrink-0 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors',
                            isDark
                                ? 'bg-white/[0.08] text-white hover:bg-white/[0.15]'
                                : 'bg-autara-purple/10 text-autara-purple hover:bg-autara-purple/20'
                        )}
                    >
                        {t.action.label}
                    </button>
                )}
                <button
                    onClick={handleDismiss}
                    className={cn(
                        'shrink-0 rounded-md p-1 transition-opacity opacity-50 hover:opacity-100',
                        isDark ? 'text-white' : 'text-autara-gray-400'
                    )}
                >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    )
}

export { ToastProvider, useToast, toast, type Toast, type ToastType }
