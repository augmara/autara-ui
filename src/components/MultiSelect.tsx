'use client'

import * as React from 'react'
import { cn } from '../lib/cn'

interface MultiSelectOption {
    label: string
    value: string
}

interface MultiSelectProps {
    options: MultiSelectOption[]
    value?: string[]
    onChange?: (value: string[]) => void
    placeholder?: string
    theme?: 'dark' | 'light'
    className?: string
    disabled?: boolean
}

const MultiSelect = React.forwardRef<HTMLDivElement, MultiSelectProps>(
    ({ options, value = [], onChange, placeholder = 'Select...', theme = 'dark', className, disabled }, ref) => {
        const [isOpen, setIsOpen] = React.useState(false)
        const [search, setSearch] = React.useState('')
        const containerRef = React.useRef<HTMLDivElement>(null)
        const inputRef = React.useRef<HTMLInputElement>(null)
        const isDark = theme === 'dark'

        const selected = value
        const setSelected = (newVal: string[]) => onChange?.(newVal)

        const filteredOptions = options.filter(
            (opt) =>
                !selected.includes(opt.value) &&
                opt.label.toLowerCase().includes(search.toLowerCase())
        )

        const handleSelect = (optionValue: string) => {
            setSelected([...selected, optionValue])
            setSearch('')
            inputRef.current?.focus()
        }

        const handleRemove = (optionValue: string) => {
            setSelected(selected.filter((v) => v !== optionValue))
        }

        const handleKeyDown = (e: React.KeyboardEvent) => {
            if (e.key === 'Backspace' && search === '' && selected.length > 0) {
                handleRemove(selected[selected.length - 1])
            }
            if (e.key === 'Escape') {
                setIsOpen(false)
                inputRef.current?.blur()
            }
            if (e.key === 'Enter' && filteredOptions.length > 0) {
                e.preventDefault()
                handleSelect(filteredOptions[0].value)
            }
        }

        // Close dropdown on click outside
        React.useEffect(() => {
            const handler = (e: MouseEvent) => {
                if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                    setIsOpen(false)
                }
            }
            document.addEventListener('mousedown', handler)
            return () => document.removeEventListener('mousedown', handler)
        }, [])

        const getLabel = (val: string) => options.find((o) => o.value === val)?.label ?? val

        return (
            <div ref={containerRef} className={cn('relative', className)}>
                <div
                    ref={ref}
                    className={cn(
                        'flex flex-wrap items-center gap-1.5 min-h-[40px] w-full rounded-autara-md border px-2 py-1.5 text-sm transition-colors',
                        isDark
                            ? 'border-white/[0.1] bg-white/[0.04] focus-within:border-autara-purple/50 focus-within:ring-2 focus-within:ring-autara-purple/20'
                            : 'border-autara-gray-300 bg-white focus-within:border-autara-purple focus-within:ring-2 focus-within:ring-autara-purple/20',
                        disabled && 'opacity-50 cursor-not-allowed'
                    )}
                    onClick={() => {
                        if (!disabled) {
                            inputRef.current?.focus()
                            setIsOpen(true)
                        }
                    }}
                >
                    {selected.map((val) => (
                        <span
                            key={val}
                            className={cn(
                                'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium transition-colors',
                                isDark
                                    ? 'bg-autara-purple/20 text-autara-purple-200 border border-autara-purple/30'
                                    : 'bg-autara-purple-50 text-autara-purple border border-autara-purple-200'
                            )}
                        >
                            {getLabel(val)}
                            {!disabled && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleRemove(val)
                                    }}
                                    className={cn(
                                        'rounded-sm transition-colors',
                                        isDark
                                            ? 'hover:bg-white/[0.1] text-white/40 hover:text-white/70'
                                            : 'hover:bg-autara-purple/10 text-autara-purple/50 hover:text-autara-purple'
                                    )}
                                >
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </span>
                    ))}
                    <input
                        ref={inputRef}
                        type="text"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value)
                            setIsOpen(true)
                        }}
                        onFocus={() => setIsOpen(true)}
                        onKeyDown={handleKeyDown}
                        placeholder={selected.length === 0 ? placeholder : ''}
                        disabled={disabled}
                        className={cn(
                            'flex-1 min-w-[80px] bg-transparent outline-none text-sm',
                            isDark
                                ? 'text-white placeholder:text-white/30'
                                : 'text-autara-gray-900 placeholder:text-autara-gray-400'
                        )}
                    />
                </div>

                {isOpen && filteredOptions.length > 0 && (
                    <div
                        className={cn(
                            'absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-autara-lg border shadow-xl',
                            isDark
                                ? 'border-white/[0.08] bg-[#1a1025]/95 backdrop-blur-xl'
                                : 'border-autara-gray-200 bg-white shadow-autara-lg'
                        )}
                    >
                        <div className="p-1">
                            {filteredOptions.map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => handleSelect(opt.value)}
                                    className={cn(
                                        'w-full text-left rounded-md px-3 py-1.5 text-sm transition-colors',
                                        isDark
                                            ? 'text-white/70 hover:bg-autara-purple/20 hover:text-white'
                                            : 'text-autara-gray-700 hover:bg-autara-purple/10 hover:text-autara-purple'
                                    )}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {isOpen && filteredOptions.length === 0 && search && (
                    <div
                        className={cn(
                            'absolute top-full left-0 right-0 z-50 mt-1 rounded-autara-lg border shadow-xl p-3',
                            isDark
                                ? 'border-white/[0.08] bg-[#1a1025]/95 backdrop-blur-xl'
                                : 'border-autara-gray-200 bg-white'
                        )}
                    >
                        <p className={cn('text-sm', isDark ? 'text-white/30' : 'text-autara-gray-400')}>
                            No results for &ldquo;{search}&rdquo;
                        </p>
                    </div>
                )}
            </div>
        )
    }
)
MultiSelect.displayName = 'MultiSelect'

export { MultiSelect, type MultiSelectOption, type MultiSelectProps }
