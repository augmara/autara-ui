import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../lib/cn'

/**
 * Textarea — the canonical multi-line input. Renders the
 * `.field-textarea` utility class from `autara-ui/utilities/forms.css`,
 * sharing the hairline border, 4px brand-purple halo, and
 * `aria-invalid` red-ring grammar with `Input`.
 *
 * Defaults to `min-h-[96px]` with vertical resize. Override via
 * `rows` / `className` when you need a fixed height or no-resize.
 *
 * `theme` prop kept as no-op for source-level compatibility; dark-
 * surface companion deferred.
 */
const textareaVariants = cva('field-textarea', {
    variants: {
        // Reserved for future size axis — keep the API parallel to Input.
        size: { md: '' },
    },
    defaultVariants: { size: 'md' },
})

export interface TextareaProps
    extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
        VariantProps<typeof textareaVariants> {
    /** @deprecated currently a no-op — dark companion deferred */
    theme?: 'dark' | 'light'
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    function Textarea({ className, size, theme: _theme, ...props }, ref) {
        return (
            <textarea
                ref={ref}
                className={cn(textareaVariants({ size }), className)}
                {...props}
            />
        )
    }
)
Textarea.displayName = 'Textarea'

export { Textarea, textareaVariants }
