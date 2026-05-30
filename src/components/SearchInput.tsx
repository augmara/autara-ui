import * as React from 'react'
import { Input, type InputProps } from './Input'
import { cn } from '../lib/cn'

/**
 * SearchInput — `Input` with a leading Solar Linear magnifier glyph.
 *
 * Consolidates the inline pattern that was duplicated across every
 * "filtered list" screen (merchant Bookings / Services / Customers /
 * Notifications; customer marketplace search) where each consumer
 * was rolling its own absolute-positioned icon + `pl-9` Input.
 *
 * Forwards every standard `InputProps` so it composes with form
 * libraries unchanged. The glyph is inlined SVG (Solar Linear style)
 * so autara-ui doesn't have to depend on @solar-icons/react.
 */

export interface SearchInputProps extends Omit<InputProps, 'icon'> {
    /** Override the placeholder. Defaults to "Search". */
    placeholder?: string
}

const MagniferGlyph = () => (
    <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]"
    >
        <circle
            cx="11"
            cy="11"
            r="7"
            stroke="currentColor"
            strokeWidth="1.8"
        />
        <path
            d="m20 20-3.5-3.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
        />
    </svg>
)

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
    ({ className, placeholder = 'Search', ...props }, ref) => {
        return (
            <div className="relative">
                <MagniferGlyph />
                <Input
                    ref={ref}
                    placeholder={placeholder}
                    // `pl-9!` important — `.field-input` declares
                    // `padding: 0 14px` unlayered (forms.css), which
                    // beats Tailwind v4's `@layer utilities` `pl-9`
                    // and hides the placeholder under the absolute
                    // glyph at left-3. The `!` modifier lifts our
                    // override above the layer. Permanent fix: move
                    // `.field-input` padding into a Tailwind layer.
                    className={cn('pl-9!', className)}
                    {...props}
                />
            </div>
        )
    },
)
SearchInput.displayName = 'SearchInput'
