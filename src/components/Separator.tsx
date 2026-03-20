import * as React from 'react'
import * as SeparatorPrimitive from '@radix-ui/react-separator'
import { cn } from '../lib/cn'

const Separator = React.forwardRef<
    React.ComponentRef<typeof SeparatorPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root> & {
        gradient?: boolean
    }
>(
    (
        { className, orientation = 'horizontal', decorative = true, gradient = false, ...props },
        ref
    ) =>
        gradient ? (
            <div
                ref={ref as React.Ref<HTMLDivElement>}
                className={cn('divider-gradient', className)}
                role={decorative ? 'none' : 'separator'}
                aria-orientation={orientation}
                {...(props as React.HTMLAttributes<HTMLDivElement>)}
            />
        ) : (
            <SeparatorPrimitive.Root
                ref={ref}
                decorative={decorative}
                orientation={orientation}
                className={cn(
                    'shrink-0 bg-white/[0.06]',
                    orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
                    className
                )}
                {...props}
            />
        )
)
Separator.displayName = SeparatorPrimitive.Root.displayName

export { Separator }
