'use client'

import * as React from 'react'
import * as SelectPrimitive from '@radix-ui/react-select'
import { cn } from '../lib/cn'
import {
    DEFAULT_COUNTRIES,
    findCountryByIso,
    type PhoneCountry,
} from './PhoneCountries'

/**
 * PhoneInput — a single-control phone field with an inline country
 * selector. Common international onboarding pattern: flag + dial code
 * on the left, national number on the right, all inside one hairline
 * container.
 *
 * - **Container**: `--surface` fill, `--border-subtle` hairline,
 *   brand-purple halo on focus (matches `.field-input` grammar).
 * - **Country chip**: flag emoji + dial code + Solar Bold chevron.
 *   Clicks open a Radix Select listing the available countries.
 * - **Input**: digits-only `type="tel"`. The component emits an E.164
 *   string via `onChange` (e.g. `"+61412345678"`) — the leading dial
 *   code is owned by the chip, never typed.
 *
 * Country defaults to `AU` (Autara's launch market). Override via
 * `defaultCountry` (uncontrolled) or `country` (controlled). Replace
 * the country list via `countries` — see `DEFAULT_COUNTRIES` for the
 * curated default.
 *
 * Validation / region-specific formatting is intentionally out of
 * scope here. Consumers that need it should wrap with
 * `libphonenumber-js` on the value they receive — keeps autara-ui
 * dependency-free.
 */

export interface PhoneInputProps
    extends Omit<
        React.InputHTMLAttributes<HTMLInputElement>,
        'value' | 'defaultValue' | 'onChange' | 'type'
    > {
    /** Controlled E.164 value, e.g. `"+61412345678"`. */
    value?: string
    /** Uncontrolled initial national portion (digits only). */
    defaultValue?: string
    /** Fires with the full E.164 string on every keystroke / country change. */
    onChange?: (e164: string) => void
    /** Controlled country ISO code (e.g. `"AU"`). */
    country?: string
    /** Uncontrolled initial country ISO code. Defaults to `"AU"`. */
    defaultCountry?: string
    /** Fires when the user picks a different country. */
    onCountryChange?: (iso: string) => void
    /** Country list. Defaults to `DEFAULT_COUNTRIES`. */
    countries?: PhoneCountry[]
    /** @deprecated currently a no-op — dark companion deferred */
    theme?: 'dark' | 'light'
}

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
    function PhoneInput(
        {
            value,
            defaultValue,
            onChange,
            country,
            defaultCountry = 'AU',
            onCountryChange,
            countries = DEFAULT_COUNTRIES,
            className,
            placeholder = 'Phone number',
            disabled,
            theme: _theme,
            ...rest
        },
        ref
    ) {
        // Controlled country state (with uncontrolled fallback).
        const isControlledCountry = country !== undefined
        const [internalCountry, setInternalCountry] = React.useState(
            defaultCountry.toUpperCase()
        )
        const activeCountryIso = (
            isControlledCountry ? country! : internalCountry
        ).toUpperCase()
        const activeCountry =
            findCountryByIso(activeCountryIso, countries) ?? countries[0]

        // National-digits state. If a controlled `value` is supplied we
        // strip the dial prefix to populate the input; otherwise keep
        // the user's typed digits in our own state.
        const stripDial = (e164: string, dial: string) =>
            e164.startsWith(dial) ? e164.slice(dial.length) : e164
        const isControlledValue = value !== undefined
        const [internalDigits, setInternalDigits] = React.useState(
            defaultValue ?? ''
        )
        const activeDigits = isControlledValue
            ? stripDial(value!, activeCountry.dial).replace(/\D/g, '')
            : internalDigits

        const emit = (iso: string, digits: string) => {
            const c = findCountryByIso(iso, countries) ?? countries[0]
            onChange?.(`${c.dial}${digits}`)
        }

        const handleCountryChange = (iso: string) => {
            if (!isControlledCountry) setInternalCountry(iso)
            onCountryChange?.(iso)
            emit(iso, activeDigits)
        }

        const handleDigitsChange = (
            e: React.ChangeEvent<HTMLInputElement>
        ) => {
            const next = e.target.value.replace(/\D/g, '')
            if (!isControlledValue) setInternalDigits(next)
            emit(activeCountryIso, next)
        }

        return (
            <div
                className={cn(
                    'flex h-11 w-full items-stretch overflow-hidden rounded-lg border border-[var(--border-subtle)] bg-[var(--surface)] transition-colors',
                    // Autara focus signature — cream tint + full
                    // brand-purple border (matches .field-input). Clean,
                    // symmetric; no halo, no one-sided bar.
                    'focus-within:border-[var(--color-autara-purple)]',
                    'focus-within:bg-[var(--surface-warm)]',
                    disabled && 'opacity-50',
                    className
                )}
            >
                <SelectPrimitive.Root
                    value={activeCountryIso}
                    onValueChange={handleCountryChange}
                    disabled={disabled}
                >
                    {/* Country selector — a quiet inline segment: flag ·
                        dial code · chevron, divided from the number by a
                        single hairline. The dial code sits in brand purple
                        so it reads as the one accent, not a heavy chip. */}
                    <SelectPrimitive.Trigger
                        aria-label="Country"
                        className={cn(
                            'flex shrink-0 items-center gap-1.5 border-r border-[var(--border-subtle)] pl-3.5 pr-3',
                            'text-sm outline-none transition-colors',
                            'hover:bg-[var(--surface-warm)]',
                            'focus-visible:bg-[var(--surface-warm)]',
                            'data-[state=open]:bg-[var(--surface-warm)]'
                        )}
                    >
                        <span className="text-base leading-none" aria-hidden>
                            {activeCountry.flag}
                        </span>
                        <span className="font-medium tabular-nums text-[var(--color-autara-purple)]">
                            {activeCountry.dial}
                        </span>
                        <SelectPrimitive.Icon asChild>
                            <svg
                                aria-hidden
                                viewBox="0 0 24 24"
                                width="12"
                                height="12"
                                className="text-[var(--text-subtle)] transition-transform data-[state=open]:rotate-180"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2.4}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M6 9l6 6 6-6" />
                            </svg>
                        </SelectPrimitive.Icon>
                    </SelectPrimitive.Trigger>

                    <SelectPrimitive.Portal>
                        <SelectPrimitive.Content
                            position="popper"
                            sideOffset={6}
                            className={cn(
                                'z-50 max-h-[18rem] min-w-[18rem] overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] py-1',
                                'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
                                'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95'
                            )}
                        >
                            <SelectPrimitive.Viewport>
                                {countries.map((c) => (
                                    <SelectPrimitive.Item
                                        key={c.iso}
                                        value={c.iso}
                                        className={cn(
                                            'relative flex cursor-pointer select-none items-center gap-3 px-3 py-2 text-sm text-[var(--text-strong)] outline-none',
                                            'data-[highlighted]:bg-[var(--surface-elevated)]',
                                            'data-[state=checked]:bg-[rgba(78,27,189,0.06)]'
                                        )}
                                    >
                                        <span className="text-base leading-none" aria-hidden>
                                            {c.flag}
                                        </span>
                                        <span className="min-w-0 flex-1 truncate">
                                            {c.name}
                                        </span>
                                        <span className="tabular-nums text-[var(--text-muted)]">
                                            {c.dial}
                                        </span>
                                    </SelectPrimitive.Item>
                                ))}
                            </SelectPrimitive.Viewport>
                        </SelectPrimitive.Content>
                    </SelectPrimitive.Portal>
                </SelectPrimitive.Root>

                <input
                    ref={ref}
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel-national"
                    value={activeDigits}
                    onChange={handleDigitsChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={cn(
                        'min-w-0 flex-1 bg-transparent px-3 text-sm text-[var(--text-strong)] outline-none',
                        'placeholder:text-[var(--text-subtle)]',
                        'disabled:cursor-not-allowed'
                    )}
                    {...rest}
                />
            </div>
        )
    }
)

PhoneInput.displayName = 'PhoneInput'

export { PhoneInput, DEFAULT_COUNTRIES, findCountryByIso }
export type { PhoneCountry }
