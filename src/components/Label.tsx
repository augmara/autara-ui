import * as React from 'react'
import * as LabelPrimitive from '@radix-ui/react-label'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../lib/cn'

const labelVariants = cva(
    'text-[13px] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
    {
        variants: {
            theme: {
                dark: 'text-white/60',
                // AUTM-734 — was `text-autara-gray-900`, a STATIC palette hex.
                // Every form label went near-black on the dark canvas, i.e.
                // invisible (found on merchant-mobile /me: the First name /
                // Last name labels rendered as bare asterisks). The `dark`
                // variant here means "on an ink/marketing surface", which is
                // a different axis from the app theme — only the default
                // (light) branch tracks the themed ladder.
                light: 'text-[var(--text-strong)]',
            },
        },
        defaultVariants: {
            theme: 'light',
        },
    }
)

export interface LabelProps
    extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>,
        VariantProps<typeof labelVariants> {}

const Label = React.forwardRef<
    React.ComponentRef<typeof LabelPrimitive.Root>,
    LabelProps
>(({ className, theme, ...props }, ref) => (
    <LabelPrimitive.Root
        ref={ref}
        className={cn(labelVariants({ theme }), className)}
        {...props}
    />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label, labelVariants }
