import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../lib/cn'

const inputVariants = cva(
    'flex w-full rounded-autara-md text-base outline-none transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50',
    {
        variants: {
            theme: {
                light: [
                    'h-11 bg-white border border-autara-gray-300 px-4 py-3',
                    'text-autara-gray-900 placeholder:text-autara-gray-400',
                    'focus:border-autara-purple/40 focus:outline-none focus:ring-transparent',
                    'focus:[box-shadow:0_0_0_3px_rgba(78,27,189,0.08)]',
                ].join(' '),
                dark: [
                    'h-11 bg-white/[0.06] border border-white/[0.1] px-4 py-3',
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

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement>,
        VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, theme, ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn(inputVariants({ theme }), className)}
                ref={ref}
                {...props}
            />
        )
    }
)
Input.displayName = 'Input'

export { Input, inputVariants }
