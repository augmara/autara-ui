import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../lib/cn'

const textareaVariants = cva(
    'flex min-h-[80px] w-full rounded-autara-md text-base outline-none transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50',
    {
        variants: {
            theme: {
                light: [
                    'bg-white border border-autara-gray-300 px-4 py-3',
                    'text-autara-gray-900 placeholder:text-autara-gray-400',
                    'focus:border-autara-purple focus:ring-1 focus:ring-autara-purple',
                    'focus:shadow-[0_0_0_3px_rgba(78,27,189,0.1)]',
                ].join(' '),
                dark: [
                    'bg-white/[0.06] border border-white/[0.1] px-4 py-3',
                    'text-white placeholder:text-white/25',
                    'focus:border-autara-purple focus:ring-0',
                ].join(' '),
            },
        },
        defaultVariants: {
            theme: 'light',
        },
    }
)

export interface TextareaProps
    extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
        VariantProps<typeof textareaVariants> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, theme, ...props }, ref) => {
        return (
            <textarea
                className={cn(textareaVariants({ theme }), className)}
                ref={ref}
                {...props}
            />
        )
    }
)
Textarea.displayName = 'Textarea'

export { Textarea, textareaVariants }
