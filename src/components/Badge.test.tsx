import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { Badge } from './Badge'

/**
 * AUTM-948 — rule 1 of the Autara Glass direction: skew is for pills and
 * status ONLY, they are rounded parallelograms, and **the label is
 * counter-skewed**.
 *
 * The geometry was right and the render was not. `badgeVariants` declared
 * `defaultVariants.shape = 'parallelogram'`, so cva applied
 * `skewX(-12deg)` whenever `shape` was omitted — but the render branch tested
 * the RAW prop (`shape === 'parallelogram'`), which is `undefined` in exactly
 * that case, so the counter-skew `<span>` was never emitted. Every
 * `<Badge>` written the documented way rendered a slanted label.
 *
 * It survived because `Badge.stories.tsx` pinned `shape: 'pill'` in its meta
 * args, so the default silhouette was not on screen in Storybook either —
 * the same shape of miss as AUTM-934, where the meta args pinned
 * `variant: 'light-default'` and hid an invisible default.
 *
 * These assert the DOM rather than the visual, which is the part jsdom can
 * actually answer: the skew is a class on the wrapper and the counter-skew is
 * a real element that either exists or does not.
 */

const SKEW = '[transform:skewX(-12deg)]'
const COUNTER_SKEW = '[transform:skewX(12deg)]'

describe('Badge geometry — rule 1', () => {
    it('counter-skews the label when no shape prop is passed', () => {
        const { container } = render(<Badge>Verified</Badge>)
        const wrapper = container.firstElementChild!
        expect(wrapper.className).toContain(SKEW)
        // The regression: this element was missing.
        expect(container.querySelector(`span.${CSS.escape(COUNTER_SKEW)}`)).not.toBeNull()
    })

    it('renders identically whether the default is implicit or explicit', () => {
        const implicit = render(<Badge>Verified</Badge>).container.innerHTML
        const explicit = render(
            <Badge shape="parallelogram">Verified</Badge>
        ).container.innerHTML
        expect(implicit).toBe(explicit)
    })

    it('does not skew a pill, and emits no counter-skew wrapper for one', () => {
        const { container } = render(<Badge shape="pill">Verified</Badge>)
        expect(container.firstElementChild!.className).not.toContain(SKEW)
        expect(container.querySelector(`span.${CSS.escape(COUNTER_SKEW)}`)).toBeNull()
        expect(container.firstElementChild!.className).toContain('rounded-full')
    })

    /**
     * Rule 1 again, from the other side: the parallelogram is ROUNDED. A
     * sharp-cornered slab was part of the revision Don rejected.
     */
    it('keeps a border radius on the parallelogram', () => {
        const { container } = render(<Badge>Verified</Badge>)
        expect(container.firstElementChild!.className).toContain('rounded-md')
    })
})

/**
 * Rule 3 — status is a SOLID fill, never a tint. Rule 4 — purple ACTS, aqua
 * is IN FLIGHT, lime is DONE and money-in.
 *
 * Asserted at class level because jsdom has no themed stylesheet: what is
 * checkable here is that the tone resolves to the semantic fill token and its
 * paired on-colour, not to an alpha tint. The ratios themselves are measured
 * in `tokens/glass-contrast.test.ts`, which reads the real CSS.
 */
describe('Badge semantic tones — rules 3 and 4', () => {
    it.each([
        ['act', '--act-fill', '--on-act'],
        ['flight', '--flight-fill', '--on-flight'],
        ['money', '--money-fill', '--on-money'],
    ] as const)('%s is a solid fill with its on-colour', (variant, fill, on) => {
        const { container } = render(<Badge variant={variant}>State</Badge>)
        const cls = container.firstElementChild!.className
        expect(cls).toContain(`bg-[var(${fill})]`)
        expect(cls).toContain(`text-[var(${on})]`)
        // No alpha tint — the pastel Tailwind look AUTM-211 removed.
        expect(cls).not.toMatch(/bg-\[rgba\(/)
        expect(cls).not.toMatch(/\/\d{1,2}\]/)
    })
})
