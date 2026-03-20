'use client'

import * as React from 'react'
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import { cn } from '../lib/cn'

const RadioGroup = React.forwardRef<
    React.ComponentRef<typeof RadioGroupPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => (
    <RadioGroupPrimitive.Root
        className={cn('grid gap-2', className)}
        {...props}
        ref={ref}
    />
))
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName

const RadioGroupItem = React.forwardRef<
    React.ComponentRef<typeof RadioGroupPrimitive.Item>,
    React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> & { theme?: 'dark' | 'light' }
>(({ className, theme = 'dark', ...props }, ref) => {
    const isDark = theme === 'dark'
    return (
        <RadioGroupPrimitive.Item
            ref={ref}
            className={cn(
                'aspect-square h-4 w-4 rounded-full border ring-offset-transparent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-autara-purple/50 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                isDark
                    ? 'border-white/[0.2] bg-white/[0.04] data-[state=checked]:border-autara-purple'
                    : 'border-autara-gray-300 bg-white data-[state=checked]:border-autara-purple',
                className
            )}
            {...props}
        >
            <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-autara-purple" />
            </RadioGroupPrimitive.Indicator>
        </RadioGroupPrimitive.Item>
    )
})
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

export { RadioGroup, RadioGroupItem }
