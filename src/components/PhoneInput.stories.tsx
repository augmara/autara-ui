import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Button } from './Button'
import { PhoneInput, DEFAULT_COUNTRIES } from './PhoneInput'

/**
 * PhoneInput — phone field with an inline country selector.
 *
 * - AU default (Autara's launch market).
 * - 29 countries pre-loaded; replace with your own via the `countries`
 *   prop.
 * - Emits a full E.164 string on every keystroke / country change.
 * - Hairline container + brand-purple halo on focus, matching the
 *   `.field-input` grammar across the design system.
 */
const meta: Meta<typeof PhoneInput> = {
    title: 'Atoms/PhoneInput',
    component: PhoneInput,
    parameters: { layout: 'padded' },
}
export default meta
type Story = StoryObj<typeof PhoneInput>

// ─── Default — empty AU input ──────────────────────────────────────
export const Default: Story = {
    render: () => (
        <div className="max-w-sm">
            <PhoneInput />
        </div>
    ),
}

// ─── With placeholder ──────────────────────────────────────────────
export const WithPlaceholder: Story = {
    render: () => (
        <div className="max-w-sm">
            <PhoneInput placeholder="04XX XXX XXX" />
        </div>
    ),
}

// ─── Default country other than AU ─────────────────────────────────
export const DefaultCountryGB: Story = {
    name: 'Default country — GB',
    render: () => (
        <div className="max-w-sm">
            <PhoneInput defaultCountry="GB" />
        </div>
    ),
}

// ─── Disabled state ────────────────────────────────────────────────
export const Disabled: Story = {
    render: () => (
        <div className="max-w-sm">
            <PhoneInput disabled defaultValue="412345678" />
        </div>
    ),
}

// ─── Fully controlled — value + country surface back to the page ───
export const Controlled: Story = {
    render: () => {
        const Demo = () => {
            const [value, setValue] = useState('+61412345678')
            const [country, setCountry] = useState('AU')
            return (
                <div className="max-w-md space-y-3">
                    <PhoneInput
                        value={value}
                        onChange={setValue}
                        country={country}
                        onCountryChange={setCountry}
                    />
                    <pre className="rounded-lg bg-[var(--surface-elevated)] p-3 text-xs text-[var(--text-strong)]">
                        {JSON.stringify({ value, country }, null, 2)}
                    </pre>
                </div>
            )
        }
        return <Demo />
    },
}

// ─── In context — onboarding "verify phone" panel ──────────────────
export const VerifyPhonePanel: Story = {
    name: 'In context — onboarding verify-phone panel',
    render: () => {
        const Demo = () => {
            const [phone, setPhone] = useState('')
            return (
                <div className="max-w-md space-y-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] p-6">
                    <div>
                        <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]">
                            Step 2 of 5
                        </div>
                        <h3 className="mt-1 text-lg font-medium leading-tight text-[var(--text-strong)]">
                            What&apos;s the best number to reach you?
                        </h3>
                        <p className="mt-1 text-sm leading-relaxed text-[var(--text-muted)]">
                            We&apos;ll send a 6-digit code to verify it&apos;s
                            really you. Standard SMS rates apply.
                        </p>
                    </div>
                    <label className="grid gap-1.5">
                        <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--text-muted)]">
                            Mobile number
                        </span>
                        <PhoneInput
                            value={phone}
                            onChange={setPhone}
                            placeholder="04XX XXX XXX"
                            autoComplete="tel"
                        />
                    </label>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm">
                            Back
                        </Button>
                        <Button variant="dark" size="sm" disabled={!phone.replace(/\D/g, '').length}>
                            Send code
                        </Button>
                    </div>
                </div>
            )
        }
        return <Demo />
    },
}

// ─── Custom country list — AU + neighbours only ────────────────────
export const CustomCountryList: Story = {
    name: 'Custom country list — AU + neighbours',
    render: () => {
        const list = DEFAULT_COUNTRIES.filter((c) =>
            ['AU', 'NZ', 'SG', 'PH', 'ID', 'MY'].includes(c.iso)
        )
        return (
            <div className="max-w-sm">
                <PhoneInput countries={list} defaultCountry="AU" />
                <p className="mt-2 text-xs text-[var(--text-muted)]">
                    Dropdown limited to {list.length} markets.
                </p>
            </div>
        )
    },
}
