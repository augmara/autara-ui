import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../lib/cn'

const cardVariants = cva('transition-all duration-[350ms]', {
    variants: {
        variant: {
            // Dark theme cards
            glass: [
                'rounded-autara-xl bg-white/[0.03] border border-white/[0.06]',
                'backdrop-blur-[12px] [-webkit-backdrop-filter:blur(12px)]',
                'hover:bg-white/[0.06] hover:border-autara-purple/30 hover:translate-y-[-2px]',
            ].join(' '),
            service: [
                'rounded-autara-xl bg-white/[0.03] border border-white/[0.06] p-6 cursor-pointer',
                'hover:bg-white/[0.07] hover:border-autara-purple/30 hover:translate-y-[-3px]',
            ].join(' '),
            outline: 'rounded-autara-xl border border-white/[0.08] bg-transparent',
            solid: 'rounded-autara-xl bg-white/[0.04] border border-white/[0.06]',
            // Light theme cards
            light: [
                'rounded-autara-xl bg-white p-7 text-autara-gray-900',
                'shadow-autara',
                'hover:translate-y-[-3px] hover:shadow-autara-lg',
            ].join(' '),
        },
    },
    defaultVariants: {
        variant: 'glass',
    },
})

export interface CardProps
    extends React.HTMLAttributes<HTMLDivElement>,
        VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, variant, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(cardVariants({ variant }), className)}
            {...props}
        />
    )
)
Card.displayName = 'Card'

const CardHeader = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn('flex flex-col space-y-1.5 p-6', className)}
        {...props}
    />
))
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn('text-lg font-semibold leading-none tracking-tight', className)}
        {...props}
    />
))
CardTitle.displayName = 'CardTitle'

const CardDescription = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn('text-sm text-white/35', className)}
        {...props}
    />
))
CardDescription.displayName = 'CardDescription'

const CardContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
))
CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn('flex items-center p-6 pt-0', className)}
        {...props}
    />
))
CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, cardVariants }
