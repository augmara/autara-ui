import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../lib/cn'

/**
 * Input — the canonical Autara text input. Renders the
 * `.field-input` utility class from `autara-ui/utilities/forms.css`,
 * which encodes the hairline border, the signature **4px brand-purple
 * halo on focus**, and the `aria-invalid` red-ring state. Consumers
 * who already import `@augmara/autara-ui/utilities` (every web app
 * does) get the look automatically.
 *
 * Visual rules — see [`autara-ui/CLAUDE.md` § Aesthetic invariants](../../CLAUDE.md):
 *   - 44 × full-width pill on cream surface (`size="md"`, default).
 *   - 48 × full-width on hero / onboarding panels (`size="lg"`).
 *   - 4px brand-purple halo on focus — never a doubled outline.
 *   - Red border + red halo when `aria-invalid="true"`.
 *   - Disabled fills with `--surface-warm` and dims text.
 *
 * `theme` prop preserved for source-level compatibility (was the
 * legacy axis switching between light cream and dark photo surfaces).
 * It is now a **no-op** — only the light treatment ships. A dark-
 * surface companion can land later without breaking consumers.
 */
const inputVariants = cva('field-input', {
    variants: {
        size: {
            md: '',
            lg: 'field-input--lg',
        },
    },
    defaultVariants: {
        size: 'md',
    },
})

export interface InputProps
    extends Omit<
            React.InputHTMLAttributes<HTMLInputElement>,
            'size'
        >,
        VariantProps<typeof inputVariants> {
    /** @deprecated currently a no-op — dark companion deferred */
    theme?: 'dark' | 'light'
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    function Input(
        { className, type = 'text', size, theme: _theme, ...props },
        ref
    ) {
        return (
            <input
                ref={ref}
                type={type}
                className={cn(inputVariants({ size }), className)}
                {...props}
            />
        )
    }
)
Input.displayName = 'Input'

export { Input, inputVariants }
