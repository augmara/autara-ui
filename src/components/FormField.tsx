import * as React from 'react'
import { Label } from './Label'
import { cn } from '../lib/cn'

export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
    label?: string
    htmlFor?: string
    error?: string
    description?: string
    required?: boolean
    theme?: 'dark' | 'light'
}

const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
    ({ className, label, htmlFor, error, description, required, theme = 'light', children, ...props }, ref) => (
        <div ref={ref} className={cn('space-y-1.5', className)} {...props}>
            {label && (
                <Label htmlFor={htmlFor} theme={theme}>
                    {label}
                    {required && <span className="text-autara-error ml-0.5">*</span>}
                </Label>
            )}
            {children}
            {description && !error && (
                <p className={cn(
                    'text-xs',
                    theme === 'dark' ? 'text-white/30' : 'text-autara-gray-400'
                )}>
                    {description}
                </p>
            )}
            {error && (
                <p className="text-xs text-autara-error mt-1.5">{error}</p>
            )}
        </div>
    )
)
FormField.displayName = 'FormField'

export { FormField }
