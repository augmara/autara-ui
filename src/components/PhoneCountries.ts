/**
 * Country list for `PhoneInput`.
 *
 * Curated set covering Autara's rollout markets (AU launch → NZ, GB,
 * IE, CA, US near-term) plus a layer of top trading partners and
 * common diaspora origins. Designed to fit cleanly in a Select dropdown
 * without needing a search input. Consumers can extend or replace
 * via the `countries` prop:
 *
 * ```tsx
 * <PhoneInput countries={[...DEFAULT_COUNTRIES, { iso: 'JM', name: 'Jamaica', dial: '+1876', flag: '🇯🇲' }]} />
 * ```
 *
 * The default country (when no `country` / `defaultCountry` prop is
 * passed) is `AU` — Autara's launch market.
 */

export interface PhoneCountry {
    /** ISO 3166-1 alpha-2 code. */
    iso: string
    /** Display name. Use English unless the consumer overrides. */
    name: string
    /** Calling code with leading `+`, e.g. `+61`. */
    dial: string
    /** Unicode flag emoji — zero asset cost on the web. */
    flag: string
}

export const DEFAULT_COUNTRIES: PhoneCountry[] = [
    // Autara launch + near-term rollout
    { iso: 'AU', name: 'Australia', dial: '+61', flag: '🇦🇺' },
    { iso: 'NZ', name: 'New Zealand', dial: '+64', flag: '🇳🇿' },
    { iso: 'GB', name: 'United Kingdom', dial: '+44', flag: '🇬🇧' },
    { iso: 'IE', name: 'Ireland', dial: '+353', flag: '🇮🇪' },
    { iso: 'CA', name: 'Canada', dial: '+1', flag: '🇨🇦' },
    { iso: 'US', name: 'United States', dial: '+1', flag: '🇺🇸' },

    // Western Europe
    { iso: 'DE', name: 'Germany', dial: '+49', flag: '🇩🇪' },
    { iso: 'FR', name: 'France', dial: '+33', flag: '🇫🇷' },
    { iso: 'ES', name: 'Spain', dial: '+34', flag: '🇪🇸' },
    { iso: 'IT', name: 'Italy', dial: '+39', flag: '🇮🇹' },
    { iso: 'NL', name: 'Netherlands', dial: '+31', flag: '🇳🇱' },
    { iso: 'PT', name: 'Portugal', dial: '+351', flag: '🇵🇹' },

    // Asia-Pacific
    { iso: 'JP', name: 'Japan', dial: '+81', flag: '🇯🇵' },
    { iso: 'SG', name: 'Singapore', dial: '+65', flag: '🇸🇬' },
    { iso: 'HK', name: 'Hong Kong', dial: '+852', flag: '🇭🇰' },
    { iso: 'KR', name: 'South Korea', dial: '+82', flag: '🇰🇷' },
    { iso: 'IN', name: 'India', dial: '+91', flag: '🇮🇳' },
    { iso: 'PH', name: 'Philippines', dial: '+63', flag: '🇵🇭' },
    { iso: 'ID', name: 'Indonesia', dial: '+62', flag: '🇮🇩' },
    { iso: 'MY', name: 'Malaysia', dial: '+60', flag: '🇲🇾' },
    { iso: 'TH', name: 'Thailand', dial: '+66', flag: '🇹🇭' },
    { iso: 'VN', name: 'Vietnam', dial: '+84', flag: '🇻🇳' },
    { iso: 'CN', name: 'China', dial: '+86', flag: '🇨🇳' },

    // Middle East + Africa
    { iso: 'AE', name: 'United Arab Emirates', dial: '+971', flag: '🇦🇪' },
    { iso: 'SA', name: 'Saudi Arabia', dial: '+966', flag: '🇸🇦' },
    { iso: 'ZA', name: 'South Africa', dial: '+27', flag: '🇿🇦' },

    // Americas
    { iso: 'MX', name: 'Mexico', dial: '+52', flag: '🇲🇽' },
    { iso: 'BR', name: 'Brazil', dial: '+55', flag: '🇧🇷' },
    { iso: 'AR', name: 'Argentina', dial: '+54', flag: '🇦🇷' },
]

/** Lookup helper — find a country by its ISO code. Case-insensitive. */
export function findCountryByIso(
    iso: string,
    list: PhoneCountry[] = DEFAULT_COUNTRIES
): PhoneCountry | undefined {
    const target = iso.toUpperCase()
    return list.find((c) => c.iso === target)
}
