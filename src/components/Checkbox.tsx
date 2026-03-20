'use client'

import * as React from 'react'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { cn } from '../lib/cn'

const Checkbox = React.forwardRef<
    React.ComponentRef<typeof CheckboxPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> & { theme?: 'dark' | 'light' }
>(({ className, theme = 'dark', ...props }, ref) => {
    const isDark = theme === 'dark'
    return (
        <CheckboxPrimitive.Root
            ref={ref}
            className={cn(
                'peer h-4 w-4 shrink-0 rounded-autara-sm border ring-offset-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-autara-purple/50 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-autara-purple data-[state=checked]:border-autara-purple data-[state=checked]:text-white',
                isDark
                    ? 'border-white/[0.2] bg-white/[0.04]'
                    : 'border-autara-gray-300 bg-white',
                className
            )}
            {...props}
        >
            <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
            </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>
    )
})
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
