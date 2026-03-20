import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../lib/cn'

const buttonVariants = cva(
    'inline-flex items-center justify-center whitespace-nowrap font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
    {
        variants: {
            variant: {
                // ── Dark theme variants ──
                primary: [
                    'bg-autara-purple text-white rounded-autara-md',
                    'hover:bg-[#3D1595] hover:shadow-[0_0_30px_rgba(78,27,189,0.4)] hover:-translate-y-0.5',
                    'active:bg-[#2E0F73] active:translate-y-0',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-autara-purple/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
                ].join(' '),
                outline: [
                    'border border-white/[0.15] bg-white/[0.03] text-white rounded-autara-md',
                    'hover:bg-white/[0.08] hover:border-white/[0.25] hover:-translate-y-0.5',
                    'active:bg-white/[0.12] active:translate-y-0',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-autara-purple/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
                ].join(' '),
                ghost: [
                    'bg-transparent text-white/60 rounded-autara-md',
                    'hover:text-white hover:bg-white/[0.06]',
                    'active:bg-white/[0.1]',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-autara-purple/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
                ].join(' '),
                secondary: [
                    'bg-white/[0.06] text-white border border-white/[0.08] rounded-autara-md',
                    'hover:bg-white/[0.1] hover:border-white/[0.15]',
                    'active:bg-white/[0.14]',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-autara-purple/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
                ].join(' '),
                destructive: [
                    'bg-autara-error text-white rounded-autara-md',
                    'hover:bg-red-700 hover:-translate-y-0.5',
                    'active:bg-red-800 active:translate-y-0',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
                ].join(' '),
                link: [
                    'text-autara-sky-aqua underline-offset-4 hover:underline bg-transparent rounded-autara-md',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-autara-purple/50',
                ].join(' '),
                light: [
                    'bg-white text-autara-purple rounded-autara-md',
                    'hover:bg-white/90 hover:-translate-y-0.5',
                    'active:bg-white/80 active:translate-y-0',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
                ].join(' '),
                // ── Light theme variants ──
                'light-primary': [
                    'bg-autara-purple text-white rounded-autara-md',
                    'hover:bg-[#3D1595] hover:shadow-[0_4px_12px_rgba(78,27,189,0.25)] hover:-translate-y-0.5',
                    'active:bg-[#2E0F73] active:translate-y-0',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-autara-purple/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
                ].join(' '),
                'light-outline': [
                    'border border-autara-gray-300 bg-white text-autara-gray-900 rounded-autara-md',
                    'hover:bg-autara-gray-50 hover:border-autara-gray-400 hover:shadow-sm',
                    'active:bg-autara-gray-100',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-autara-purple/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
                ].join(' '),
                'light-ghost': [
                    'bg-transparent text-autara-gray-600 rounded-autara-md',
                    'hover:text-autara-gray-900 hover:bg-autara-gray-100',
                    'active:bg-autara-gray-200',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-autara-purple/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
                ].join(' '),
                'light-secondary': [
                    'bg-autara-gray-100 text-autara-gray-900 border border-autara-gray-200 rounded-autara-md',
                    'hover:bg-autara-gray-200 hover:border-autara-gray-300',
                    'active:bg-autara-gray-300',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-autara-purple/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
                ].join(' '),
                'light-destructive': [
                    'bg-autara-error text-white rounded-autara-md',
                    'hover:bg-red-700 hover:-translate-y-0.5',
                    'active:bg-red-800 active:translate-y-0',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
                ].join(' '),
                'light-link': [
                    'text-autara-purple underline-offset-4 hover:underline bg-transparent rounded-autara-md',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-autara-purple/50',
                ].join(' '),
            },
            size: {
                sm: 'h-9 px-4 text-sm',
                default: 'h-11 px-6 text-sm',
                md: 'h-11 px-6 text-sm',
                lg: 'h-[52px] px-8 text-base',
                icon: 'h-10 w-10',
            },
        },
        defaultVariants: {
            variant: 'primary',
            size: 'default',
        },
    }
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : 'button'
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
