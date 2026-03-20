'use client'

import * as React from 'react'
import * as ProgressPrimitive from '@radix-ui/react-progress'
import { cn } from '../lib/cn'

const Progress = React.forwardRef<
    React.ComponentRef<typeof ProgressPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
        theme?: 'dark' | 'light'
        indicatorClassName?: string
    }
>(({ className, value, theme = 'dark', indicatorClassName, ...props }, ref) => {
    const isDark = theme === 'dark'
    return (
        <ProgressPrimitive.Root
            ref={ref}
            className={cn(
                'relative h-2 w-full overflow-hidden rounded-full',
                isDark ? 'bg-white/[0.1]' : 'bg-autara-gray-200',
                className
            )}
            {...props}
        >
            <ProgressPrimitive.Indicator
                className={cn(
                    'h-full w-full flex-1 rounded-full bg-autara-purple transition-all duration-500 ease-out',
                    indicatorClassName
                )}
                style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
            />
        </ProgressPrimitive.Root>
    )
})
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
