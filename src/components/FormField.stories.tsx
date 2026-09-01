import type { Meta, StoryObj } from '@storybook/react-vite'
import { FormField } from './FormField'
import { Input } from './Input'
import { Textarea } from './Textarea'
import { Button } from './Button'

/**
 * FormField — label + control + description + error, wired together.
 *
 * This file did not exist until AUTM-935, which is most of why the
 * wiring was missing: the wrapper every Autara form goes through was
 * never once looked at on its own.
 *
 * Precedence is caller-wins. `id` and `aria-invalid` are only filled in
 * when absent, and `aria-describedby` is merged rather than replaced, so
 * a call site that already points describedby at a character counter
 * keeps it.
 *
 * Inspect any story with the a11y addon or the DOM panel: the label's
 * `for`, the control's `id`, `aria-invalid`, `aria-required` and
 * `aria-describedby` should all line up without the story passing them.
 */
const meta = {
    title: 'Molecules/FormField',
    component: FormField,
    parameters: { layout: 'padded' },
} satisfies Meta<typeof FormField>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
    render: () => (
        <div className="max-w-sm">
            <FormField label="Business name">
                <Input placeholder="Northside Mobile Detailing" />
            </FormField>
        </div>
    ),
}

/** `required` adds the red asterisk AND a visually-hidden "(required)". */
export const Required: Story = {
    render: () => (
        <div className="max-w-sm">
            <FormField label="First name" required>
                <Input placeholder="Sam" />
            </FormField>
        </div>
    ),
}

/** Helper copy, linked through `aria-describedby`. */
export const WithDescription: Story = {
    render: () => (
        <div className="max-w-sm">
            <FormField
                label="ABN"
                description="11 digits, no spaces. We check it against the ABR."
            >
                <Input inputMode="numeric" placeholder="51824753556" />
            </FormField>
        </div>
    ),
}

/**
 * The error state. The control goes `aria-invalid` (which is also what
 * fires the red `.field-input` treatment), and the message is both
 * announced via `role="alert"` and pulled into the control's accessible
 * description.
 *
 * Copy is content: name what to do, not that something is wrong.
 */
export const WithError: Story = {
    render: () => (
        <div className="max-w-sm">
            <FormField
                label="Email"
                required
                error="Enter an email we can reach you on — we send booking requests here."
            >
                <Input defaultValue="sam@" />
            </FormField>
        </div>
    ),
}

/**
 * Edge case — error wins over description. Showing both stacks two
 * competing instructions under one field, so the description is
 * suppressed while the field is invalid and returns once it is fixed.
 */
export const ErrorSupersedesDescription: Story = {
    name: 'Edge — error supersedes description',
    render: () => (
        <div className="grid max-w-3xl gap-6 sm:grid-cols-2">
            <FormField
                label="ABN"
                description="11 digits, no spaces. We check it against the ABR."
            >
                <Input defaultValue="51824753556" />
            </FormField>
            <FormField
                label="ABN"
                description="11 digits, no spaces. We check it against the ABR."
                error="That ABN is 9 digits — check for a missing pair."
            >
                <Input defaultValue="518247535" />
            </FormField>
        </div>
    ),
}

/**
 * Edge case — an adornment after the control. Only the FIRST element
 * child is wired; the counter keeps its own id, and because describedby
 * is merged rather than replaced, the field announces both the counter
 * and the error.
 */
export const WithAdornment: Story = {
    name: 'Edge — control plus character counter',
    render: () => (
        <div className="max-w-sm">
            <FormField
                label="Description"
                error="Trim this to 200 characters."
            >
                <Textarea
                    aria-describedby="story-count"
                    defaultValue="Full interior and exterior detail, clay bar, machine polish and a six month sealant. We come to you anywhere inside the ring road and bring our own power and water."
                />
                <span
                    id="story-count"
                    className="block text-xs text-[var(--text-subtle)]"
                >
                    212 / 200
                </span>
            </FormField>
        </div>
    ),
}

/**
 * Edge case — a composite that owns its own ARIA. A radio group is
 * labelled by a group label, not by `for`/`id`, so cloning the wiring
 * onto it would be misleading. `wireControl={false}` opts out.
 */
export const OptedOut: Story = {
    name: 'Edge — wireControl={false} for composites',
    render: () => (
        <div className="max-w-sm">
            <FormField label="Business type" required wireControl={false}>
                <div
                    role="radiogroup"
                    aria-label="Business type"
                    className="mt-1.5 space-y-2"
                >
                    {['Sole trader', 'Company'].map((option) => (
                        <label
                            key={option}
                            className="flex min-h-11 items-center gap-2.5 rounded-autara-md border border-[var(--border-subtle)] bg-[var(--surface)] px-3.5 text-sm text-[var(--text-strong)]"
                        >
                            <input type="radio" name="story-business-type" />
                            {option}
                        </label>
                    ))}
                </div>
            </FormField>
        </div>
    ),
}

/**
 * In context — the onboarding business-info step, which is the real
 * consumer shape: a mixed grid of required and optional fields with one
 * field in error after a submit attempt.
 */
export const InContextOnboardingStep: Story = {
    name: 'In context — onboarding step',
    render: () => (
        <form
            className="max-w-lg space-y-5 rounded-autara-lg border border-[var(--border-subtle)] bg-[var(--surface)] p-6"
            onSubmit={(e) => e.preventDefault()}
        >
            <p className="text-[0.6875rem] font-medium uppercase tracking-[0.22em] text-[var(--text-muted)]">
                Step 2 of 7
            </p>
            <h2 className="text-2xl font-bold tracking-[-0.02em] text-[var(--text-strong)]">
                Tell us about the business
            </h2>
            <FormField label="Business name" required>
                <Input defaultValue="Northside Mobile Detailing" />
            </FormField>
            <div className="grid gap-5 sm:grid-cols-2">
                <FormField
                    label="ABN"
                    required
                    error="That ABN is 9 digits — check for a missing pair."
                >
                    <Input defaultValue="518247535" />
                </FormField>
                <FormField
                    label="Trading since"
                    description="Year you started trading."
                >
                    <Input inputMode="numeric" defaultValue="2019" />
                </FormField>
            </div>
            <FormField
                label="What you do"
                description="Customers see this on your profile."
            >
                <Textarea defaultValue="Mobile detailing across the inner north." />
            </FormField>
            <Button variant="dark" fullWidth type="submit">
                Continue
            </Button>
        </form>
    ),
}
