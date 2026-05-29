import type { Meta, StoryObj } from '@storybook/react-vite'
import { Textarea } from './Textarea'

/**
 * Textarea — Autara's canonical multi-line input. Same hairline +
 * 4px purple halo + `aria-invalid` grammar as `Input`, applied via
 * the `.field-textarea` utility class from
 * `autara-ui/utilities/forms.css`.
 *
 * Defaults to `min-h-[96px]` with vertical resize. Override `rows`
 * for a fixed height, or pass `className="resize-none"` (via
 * tailwind-merge) to lock the size.
 */
const meta: Meta<typeof Textarea> = {
    title: 'Atoms/Textarea',
    component: Textarea,
    parameters: { layout: 'centered' },
    args: {
        placeholder: 'Add anything customers should know about your services…',
    },
}
export default meta
type Story = StoryObj<typeof Textarea>

export const Default: Story = {}

export const Filled: Story = {
    args: {
        defaultValue:
            'Mobile detail studio serving inner-city Sydney. We come to you — bring your own water access or we can supply.',
    },
}

export const Invalid: Story = {
    name: 'Invalid — aria-invalid=true',
    args: {
        'aria-invalid': 'true',
        defaultValue: '',
    },
}

export const Disabled: Story = {
    args: {
        disabled: true,
        defaultValue: 'Field is locked while we verify your account.',
    },
}

export const FixedRows: Story = {
    name: 'Fixed rows — rows={6}',
    args: { rows: 6 },
}

// ─── State matrix ──────────────────────────────────────────────────
export const StateMatrix: Story = {
    name: 'State matrix — default / filled / invalid / disabled',
    parameters: { layout: 'padded' },
    render: () => (
        <div className="max-w-md space-y-4">
            {[
                { eyebrow: 'Default', props: {} },
                {
                    eyebrow: 'Filled',
                    props: {
                        defaultValue:
                            'Mobile detail studio serving inner-city Sydney.',
                    },
                },
                {
                    eyebrow: 'Invalid — aria-invalid=true',
                    props: {
                        'aria-invalid': 'true' as const,
                        defaultValue: 'Too short',
                    },
                },
                {
                    eyebrow: 'Disabled',
                    props: {
                        disabled: true,
                        defaultValue: 'Locked while verifying account.',
                    },
                },
            ].map((row) => (
                <label key={row.eyebrow} className="block">
                    <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]">
                        {row.eyebrow}
                    </span>
                    <Textarea {...row.props} />
                </label>
            ))}
        </div>
    ),
}

// ─── In context — service description editor ──────────────────────
export const InServiceEditor: Story = {
    name: 'In context — service description editor',
    parameters: { layout: 'padded' },
    render: () => (
        <div className="max-w-md space-y-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] p-6">
            <div>
                <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]">
                    Service detail
                </div>
                <h3 className="mt-1 text-lg font-medium leading-tight text-[var(--text-strong)]">
                    Describe your full detail package
                </h3>
                <p className="mt-1 text-sm text-[var(--text-muted)]">
                    Customers will see this on your profile when they tap into
                    the service.
                </p>
            </div>
            <label className="grid gap-1.5">
                <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]">
                    Description
                </span>
                <Textarea
                    rows={5}
                    defaultValue={
                        'Full interior + exterior detail.\n• Exterior wash, clay bar, sealant\n• Interior shampoo + leather treatment\n• Engine bay tidy on request'
                    }
                />
                <span className="text-xs text-[var(--text-muted)]">
                    Markdown supported. Min 80 characters.
                </span>
            </label>
        </div>
    ),
}
