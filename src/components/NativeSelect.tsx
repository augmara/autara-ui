import * as React from 'react'
import { cn } from '../lib/cn'

/**
 * NativeSelect — a real `<select>`, dressed as a field.
 *
 * The Radix `Select` is a listbox in a popover; it is the right control
 * for a rich list. It is NOT a `<select>`: Playwright's `selectOption`
 * cannot drive it, iOS does not give it the native picker wheel, and a
 * form that posts it needs a hidden input. A vehicle make, a cancel
 * reason, a state code: those want the native control (AUTM-1185).
 *
 * Same skin as `Input`: the `.field-input` utility for the hairline, the
 * focus treatment and the `aria-invalid` ring, plus a Solar chevron on the
 * right. `size` mirrors Input (`md` 44px, `lg` 48px); the native `size`
 * attribute (visible rows) is deliberately not exposed.
 *
 * `placeholder` renders a disabled, empty first option so an unset select
 * reads as a prompt rather than as the first real choice.
 */
export interface NativeSelectProps
    extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
    size?: 'md' | 'lg'
    placeholder?: string
    /** `data-testid` on the select element itself. */
    testId?: string
}

const NativeSelect = React.forwardRef<HTMLSelectElement, NativeSelectProps>(
    (
        { className, size = 'md', placeholder, testId, children, value, defaultValue, ...props },
        ref,
    ) => {
        const controlled = value !== undefined
        return (
            <span className={cn('relative block w-full', className)}>
                <select
                    ref={ref}
                    data-testid={testId}
                    className={cn(
                        'field-input appearance-none pr-10',
                        size === 'lg' && 'field-input--lg',
                    )}
                    value={controlled ? value : undefined}
                    defaultValue={
                        !controlled
                            ? defaultValue ?? (placeholder !== undefined ? '' : undefined)
                            : undefined
                    }
                    {...props}
                >
                    {placeholder !== undefined ? (
                        <option value="" disabled>
                            {placeholder}
                        </option>
                    ) : null}
                    {children}
                </select>
                {/* Solar Linear alt-arrow-down, on the muted ink. */}
                <svg
                    aria-hidden
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.8}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                >
                    <path d="m6 9 6 6 6-6" />
                </svg>
            </span>
        )
    },
)
NativeSelect.displayName = 'NativeSelect'

export { NativeSelect }
