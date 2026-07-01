'use client'

import * as React from 'react'
import { cn } from '../lib/cn'

export interface StepperStep {
    id: string
    label: string
}

export interface StepperProps {
    steps: StepperStep[]
    /** 0-indexed. */
    currentStep: number
    onStepClick?: (index: number) => void
    /** Disables navigation back to completed steps — e.g. a Review step that shouldn't allow backtracking. */
    locked?: boolean
    className?: string
}

const CheckIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
            d="M5 13l4 4L19 7"
            stroke="currentColor"
            strokeWidth="2.25"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
)

/**
 * Slim, static step indicator — a thin progress track + editorial-eyebrow
 * "Step N of M · [current label]" text, with an optional clickable label
 * row on larger screens for navigating back to completed steps.
 *
 * Deliberately quiet: no icon-per-step glyphs, no pulse/scale animation on
 * the current step. Autara's aesthetic reads as calm and hairline-edged,
 * not busy — a bouncing icon avatar per step is closer to a generic SaaS
 * wizard than this design system. Depth/emphasis comes from the purple
 * fill and font-weight, not motion or color-heavy iconography.
 */
const Stepper = React.forwardRef<HTMLDivElement, StepperProps>(function Stepper(
    { steps, currentStep, onStepClick, locked = false, className },
    ref
) {
    const total = steps.length
    const clampedStep = Math.min(Math.max(currentStep, 0), Math.max(total - 1, 0))
    const current = steps[clampedStep]
    const progressPercent = total > 0 ? ((clampedStep + 1) / total) * 100 : 0

    return (
        <nav ref={ref} aria-label="Onboarding progress" className={cn('w-full', className)}>
            <div
                className="relative h-[3px] w-full overflow-hidden rounded-full bg-[var(--surface-elevated)]"
                role="progressbar"
                aria-valuenow={clampedStep + 1}
                aria-valuemin={1}
                aria-valuemax={total}
                aria-valuetext={`Step ${clampedStep + 1} of ${total}: ${current?.label ?? ''}`}
            >
                <div
                    className="h-full rounded-full bg-autara-purple transition-all duration-500 ease-out"
                    style={{ width: `${progressPercent}%` }}
                />
            </div>

            <p className="editorial-eyebrow mt-3">
                Step {clampedStep + 1} of {total}
                {current ? (
                    <span className="normal-case tracking-normal text-[var(--text-strong)]">
                        · {current.label}
                    </span>
                ) : null}
            </p>

            {/* Expanded label row — hidden on mobile (mirrors the retired
                StepIndicator's mobile behavior), gives clickable back-nav
                to completed steps on larger screens. */}
            <ol className="mt-4 hidden items-center gap-3 sm:flex">
                {steps.map((step, index) => {
                    const status =
                        index < clampedStep ? 'complete' : index === clampedStep ? 'current' : 'upcoming'
                    const clickable = !locked && status === 'complete' && Boolean(onStepClick)

                    const content = (
                        <span className="inline-flex items-center gap-1.5">
                            {status === 'complete' ? (
                                <span className="text-autara-purple">
                                    <CheckIcon />
                                </span>
                            ) : null}
                            <span
                                className={cn(
                                    'text-[13px]',
                                    status === 'current' && 'font-medium text-[var(--text-strong)]',
                                    status === 'complete' && 'text-[var(--text-muted)]',
                                    status === 'upcoming' && 'text-[var(--text-subtle)]'
                                )}
                            >
                                {step.label}
                            </span>
                        </span>
                    )

                    return (
                        <li key={step.id} className="flex items-center gap-3">
                            {index > 0 ? (
                                <span aria-hidden="true" className="h-px w-4 bg-[var(--border-subtle)]" />
                            ) : null}
                            {clickable ? (
                                // Clickable steps are always 'complete' (see `clickable` above) —
                                // never the current step, so no aria-current here.
                                <button
                                    type="button"
                                    onClick={() => onStepClick?.(index)}
                                    className="rounded-sm transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-autara-purple/35"
                                >
                                    {content}
                                </button>
                            ) : (
                                <span aria-current={status === 'current' ? 'step' : undefined}>{content}</span>
                            )}
                        </li>
                    )
                })}
            </ol>
        </nav>
    )
})
Stepper.displayName = 'Stepper'

export { Stepper }
