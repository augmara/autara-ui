import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { forwardRef, type AnchorHTMLAttributes } from 'react'
import { ServiceCard, ServiceCardSkeleton } from './ServiceCard'

/**
 * AUTM-1694: the card both the merchant page and the booking picker adopt.
 *
 * jsdom has no layout engine, so these assert behaviour, roles and the
 * classes that produce geometry; the geometry itself (the 4:3 photo, the
 * stacking at 19rem, 200% text) is checked in Storybook in a real browser.
 */

describe('ServiceCard photo slot', () => {
    it('renders the consumer media element in the slot, over coverImageUrl', () => {
        const { container } = render(
            <ServiceCard
                name="Wash"
                priceLabel="$80"
                coverImageUrl="https://cdn.example/should-not-render.jpg"
                media={<img data-testid="own-image" src="/optimised.jpg" alt="" />}
            />,
        )
        const slot = container.querySelector('[data-slot="media"]')
        expect(slot?.querySelector('[data-testid="own-image"]')).not.toBeNull()
        expect(container.querySelectorAll('img')).toHaveLength(1)
    })

    it('renders a plain img for coverImageUrl, at a fixed 4:3 with a cover crop', () => {
        const { container } = render(
            <ServiceCard name="Wash" priceLabel="$80" coverImageUrl="https://cdn.example/cover.jpg" />,
        )
        const slot = container.querySelector('[data-slot="media"]')
        expect(slot?.className).toContain('aspect-[4/3]')
        const img = slot?.querySelector('img')
        expect(img?.getAttribute('src')).toBe('https://cdn.example/cover.jpg')
        expect(img?.className).toContain('object-cover')
        // Decorative: the name beside it already says what it is.
        expect(img?.getAttribute('alt')).toBe('')
    })

    it('with no photo, shows the designed panel with the service\'s own figure, not a glyph tile', () => {
        const { container } = render(<ServiceCard name="Wash" priceLabel="$80" durationLabel="45 min" />)
        const panel = container.querySelector('[data-slot="media-fallback"]')
        expect(panel).not.toBeNull()
        expect(panel?.getAttribute('aria-hidden')).toBe('true')
        expect(panel?.textContent).toBe('45 min')
        expect(container.querySelector('img')).toBeNull()
        // The retired AUTM-1211 car glyph stays retired.
        expect(container.querySelector('svg path[d^="M4 13"]')).toBeNull()
    })

    it('prefers working days over a duration on a multi-day job', () => {
        const { container } = render(
            <ServiceCard name="Ceramic coating" priceLabel="$900" workingDaysLabel="3 working days" />,
        )
        expect(container.querySelector('[data-slot="media-fallback"]')?.textContent).toBe('3 working days')
    })

    it('falls back to the panel when the photo fails to load', () => {
        const { container } = render(
            <ServiceCard name="Wash" priceLabel="$80" durationLabel="45 min" coverImageUrl="https://cdn.example/404.jpg" />,
        )
        fireEvent.error(container.querySelector('img') as HTMLImageElement)
        expect(container.querySelector('img')).toBeNull()
        expect(container.querySelector('[data-slot="media-fallback"]')).not.toBeNull()
    })

    it('gives a new photo its own chance after one failed', () => {
        const { container, rerender } = render(
            <ServiceCard name="Wash" priceLabel="$80" coverImageUrl="https://cdn.example/404.jpg" />,
        )
        fireEvent.error(container.querySelector('img') as HTMLImageElement)
        expect(container.querySelector('img')).toBeNull()
        rerender(<ServiceCard name="Wash" priceLabel="$80" coverImageUrl="https://cdn.example/new.jpg" />)
        expect(container.querySelector('img')?.getAttribute('src')).toBe('https://cdn.example/new.jpg')
    })

    it('takes a consumer fallback in place of the panel', () => {
        const { container } = render(
            <ServiceCard name="Wash" priceLabel="$80" fallback={<span data-testid="own-fallback" />} />,
        )
        expect(container.querySelector('[data-testid="own-fallback"]')).not.toBeNull()
        expect(container.querySelector('[data-slot="media-fallback"]')).toBeNull()
    })
})

describe('ServiceCard link mode (merchant page)', () => {
    it('is one link, named by the service, described by its meta and price', () => {
        render(
            <ServiceCard
                name="Exterior wash"
                priceLabel="$80"
                durationLabel="45 min"
                href="/m/abc/book/checkout?serviceId=s1"
                actionLabel="Book"
                testIds={{ action: 'merchant-profile-service-book', price: 'merchant-profile-service-price' }}
            />,
        )
        const links = screen.getAllByRole('link')
        expect(links).toHaveLength(1)
        const link = links[0]
        expect(link).toHaveAccessibleName('Exterior wash')
        expect(link).toHaveAccessibleDescription(/45 min/)
        expect(link).toHaveAccessibleDescription(/\$80/)
        expect(link.getAttribute('href')).toBe('/m/abc/book/checkout?serviceId=s1')
        expect(link.getAttribute('data-testid')).toBe('merchant-profile-service-book')
        expect(screen.getByTestId('merchant-profile-service-price').textContent).toBe('$80')
        // The Book pill is a picture of the action; the card is the link.
        expect(screen.getByText('Book').getAttribute('aria-hidden')).toBe('true')
        // The hit area stretches over the card.
        expect(link.className).toContain('after:absolute')
        expect(link.className).toContain('after:inset-0')
    })

    it('renders through the consumer link component', () => {
        const FakeLink = forwardRef<HTMLAnchorElement, AnchorHTMLAttributes<HTMLAnchorElement>>(
            function FakeLink(props, ref) {
                return <a ref={ref} data-fake-link="" {...props} />
            },
        )
        const { container } = render(<ServiceCard name="Wash" priceLabel="$80" as={FakeLink} href="/x" />)
        expect(container.querySelector('a[data-fake-link]')).not.toBeNull()
    })

    it('still honours the deprecated trailingLabel', () => {
        render(<ServiceCard name="Wash" priceLabel="$80" href="/x" trailingLabel="Book this" />)
        expect(screen.getByText('Book this')).toBeTruthy()
    })

    it('is neither a link nor a radio with no href and no onSelect', () => {
        render(<ServiceCard name="Wash" priceLabel="$80" actionLabel="Book" />)
        expect(screen.queryByRole('link')).toBeNull()
        expect(screen.queryByRole('radio')).toBeNull()
        // No pill promising an action that is not there.
        expect(screen.queryByText('Book')).toBeNull()
    })
})

describe('ServiceCard select mode (booking picker)', () => {
    function Picker({ onSelect, selected }: { onSelect: (id: string) => void; selected: string | null }) {
        return (
            <div role="radiogroup" aria-label="Services">
                {['s1', 's2'].map((id) => (
                    <ServiceCard
                        key={id}
                        name={id === 's1' ? 'Exterior wash' : 'Interior steam clean'}
                        priceLabel="$80"
                        durationLabel="45 min"
                        groupName="service"
                        value={id}
                        selected={selected === id}
                        onSelect={() => onSelect(id)}
                        testIds={{ action: `service-${id}` }}
                    />
                ))}
            </div>
        )
    }

    it('is a real radio group, named by the service', () => {
        render(<Picker onSelect={() => {}} selected="s2" />)
        const radios = screen.getAllByRole('radio')
        expect(radios).toHaveLength(2)
        expect(radios[0]).toHaveAccessibleName('Exterior wash')
        expect(radios[0]).not.toBeChecked()
        expect(radios[1]).toBeChecked()
        expect(radios[0].getAttribute('name')).toBe('service')
        expect(radios[1].getAttribute('name')).toBe('service')
        expect(radios[1].getAttribute('value')).toBe('s2')
        expect(radios[0]).toHaveAccessibleDescription(/45 min/)
    })

    it('selects when the card is clicked, and paints the chosen card', async () => {
        const onSelect = vi.fn()
        const user = userEvent.setup()
        const { container, rerender } = render(<Picker onSelect={onSelect} selected={null} />)
        await user.click(screen.getByText('Interior steam clean'))
        expect(onSelect).toHaveBeenCalledWith('s2')
        rerender(<Picker onSelect={onSelect} selected="s2" />)
        const cards = container.querySelectorAll('[data-slot="service-card"]')
        expect(cards[1].getAttribute('data-selected')).toBe('true')
        expect(cards[1].className).toContain('bg-[var(--selected)]')
        expect(cards[0].hasAttribute('data-selected')).toBe(false)
    })

    it('selects from the keyboard', async () => {
        const onSelect = vi.fn()
        const user = userEvent.setup()
        render(<Picker onSelect={onSelect} selected={null} />)
        screen.getByTestId('service-s1').focus()
        await user.keyboard(' ')
        expect(onSelect).toHaveBeenCalledWith('s1')
    })
})

describe('ServiceCard description', () => {
    const LONG =
        'Two-bucket hand wash, wheel faces and barrels, iron fallout removal, clay bar on the paint, a sealant that lasts three months, glass inside and out, tyre dressing.'

    let restore: () => void
    beforeEach(() => {
        // Pretend the clamped paragraph overflows; jsdom has no layout.
        const sh = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'scrollHeight')
        const ch = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientHeight')
        Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
            configurable: true,
            get() {
                return (this as HTMLElement).classList.contains('line-clamp-2') ? 80 : 40
            },
        })
        Object.defineProperty(HTMLElement.prototype, 'clientHeight', { configurable: true, get: () => 40 })
        // Both live on Element.prototype, so the override is an own property
        // of HTMLElement.prototype that restoring simply deletes.
        restore = () => {
            if (sh) Object.defineProperty(HTMLElement.prototype, 'scrollHeight', sh)
            else delete (HTMLElement.prototype as unknown as Record<string, unknown>).scrollHeight
            if (ch) Object.defineProperty(HTMLElement.prototype, 'clientHeight', ch)
            else delete (HTMLElement.prototype as unknown as Record<string, unknown>).clientHeight
        }
    })
    afterEach(() => restore())

    it('clamps at two lines and offers More only when the text is cut', async () => {
        const user = userEvent.setup()
        render(<ServiceCard name="Full wash" priceLabel="$120" description={LONG} />)
        const toggle = screen.getByRole('button', { name: 'More about Full wash' })
        expect(toggle).toHaveAttribute('aria-expanded', 'false')
        const text = screen.getByText(LONG)
        expect(text.className).toContain('line-clamp-2')
        await user.click(toggle)
        expect(screen.getByRole('button', { name: 'Less about Full wash' })).toHaveAttribute('aria-expanded', 'true')
        expect(text.className).not.toContain('line-clamp-2')
    })

    it('reading more never selects the card', async () => {
        const onSelect = vi.fn()
        const user = userEvent.setup()
        render(<ServiceCard name="Full wash" priceLabel="$120" description={LONG} onSelect={onSelect} groupName="g" />)
        const toggle = screen.getByRole('button', { name: /More/ })
        // It sits above the stretched hit area.
        expect(toggle.className).toContain('z-[2]')
        await user.click(toggle)
        expect(onSelect).not.toHaveBeenCalled()
        expect(screen.getByRole('radio')).not.toBeChecked()
    })

    it('reading more never follows the link', async () => {
        const onClick = vi.fn((e: React.MouseEvent) => e.preventDefault())
        const user = userEvent.setup()
        const Spy = forwardRef<HTMLAnchorElement, AnchorHTMLAttributes<HTMLAnchorElement>>(function Spy(props, ref) {
            return <a ref={ref} {...props} onClick={onClick} />
        })
        render(<ServiceCard name="Full wash" priceLabel="$120" description={LONG} as={Spy} href="/x" />)
        await user.click(screen.getByRole('button', { name: /More/ }))
        expect(onClick).not.toHaveBeenCalled()
    })

    it('shows no toggle for a description that fits', () => {
        restore()
        render(<ServiceCard name="Wash" priceLabel="$80" description="Hand wash and dry." />)
        expect(screen.queryByRole('button')).toBeNull()
    })
})

describe('ServiceCard price, chips and copy', () => {
    it('shows a single price and words no fee of its own', () => {
        const { container } = render(<ServiceCard name="Wash" priceLabel="$80" />)
        expect(container.textContent).toContain('$80')
        expect(container.textContent?.toLowerCase()).not.toContain('fee')
        expect(container.querySelector('dl')).toBeNull()
    })

    it('shows the consumer\'s price lines under the total, in the consumer\'s words', () => {
        render(
            <ServiceCard
                name="Wash"
                priceLabel="$83.92"
                priceLines={[
                    { label: 'Service', value: '$80' },
                    { label: '+ booking fee', value: '$3.92' },
                ]}
                testIds={{ price: 'booking-service-price', priceLines: 'booking-service-price-parts' }}
            />,
        )
        // Exactly the text customer-web's listing-price spec reads today.
        expect(screen.getByTestId('booking-service-price').textContent).toBe('$83.92')
        expect(screen.getByTestId('booking-service-price-parts').textContent).toBe('Service $80 + booking fee $3.92')
    })

    it('sets the total larger and heavier than its parts', () => {
        render(
            <ServiceCard
                name="Wash"
                priceLabel="$83.92"
                priceLines={[{ label: 'Service', value: '$80' }]}
                testIds={{ price: 'p', priceLines: 'parts' }}
            />,
        )
        expect(screen.getByTestId('p').parentElement?.className).toMatch(/text-lg font-bold/)
        expect(screen.getByTestId('parts').className).toContain('text-[0.8125rem]')
        expect(screen.getByTestId('parts').className).not.toMatch(/font-(bold|medium)/)
    })

    it('renders duration, working days and consumer chips, each locatable', () => {
        render(
            <ServiceCard
                name="Ceramic coating"
                priceLabel="$900"
                workingDaysLabel="3 working days"
                chips={[{ label: 'Drop off at the workshop', testId: 'booking-service-dropoff-tag' }]}
                testIds={{ workingDays: 'booking-service-working-days' }}
            />,
        )
        // Each chip's text is exactly its label, as the multi-day spec reads it.
        expect(screen.getByTestId('booking-service-working-days').textContent).toBe('3 working days')
        expect(screen.getByTestId('booking-service-dropoff-tag').textContent).toBe('Drop off at the workshop')
    })

    it('reads the chips as one line, the way the product writes it', () => {
        const { container } = render(
            <ServiceCard
                name="Ceramic coating"
                priceLabel="$900"
                workingDaysLabel="3 working days"
                chips={[{ label: 'Drop off at the workshop' }]}
            />,
        )
        expect(container.textContent).toContain('3 working days · Drop off at the workshop')
    })

    it('keeps labels in sentence case and carries no em or en dash', () => {
        const { container } = render(
            <ServiceCard
                name="Wash"
                priceLabel="$120"
                pricePrefix="From"
                durationLabel="45 min"
                addonsHint="+2 add-ons available"
                href="/x"
                actionLabel="Book"
            />,
        )
        // No letterspaced uppercase. `tracking-normal` on the name is the
        // opposite: it undoes a consumer heading rule's negative tracking.
        expect(container.innerHTML).not.toMatch(/uppercase|tracking-(wide|wider|widest|\[)/)
        expect(container.innerHTML).not.toMatch(/[–—]/)
        expect(container.textContent).toContain('From')
    })

    it('uses rem type, never a pixel font size', () => {
        const { container } = render(
            <ServiceCard name="Wash" priceLabel="$80" durationLabel="45 min" priceLines={[{ label: 'Service', value: '$80' }]} />,
        )
        expect(container.innerHTML).not.toMatch(/text-\[\d+px\]/)
    })
})

describe('ServiceCard motion', () => {
    it('staggers its entrance by its index', () => {
        const { container } = render(<ServiceCard name="Wash" priceLabel="$80" revealIndex={3} />)
        const card = container.querySelector('[data-slot="service-card"]') as HTMLElement
        expect(card.className).toContain('service-card-reveal')
        expect(card.style.getPropertyValue('--service-card-index')).toBe('3')
    })

    it('does not animate unless asked', () => {
        const { container } = render(<ServiceCard name="Wash" priceLabel="$80" />)
        expect(container.querySelector('.service-card-reveal')).toBeNull()
    })

    it('presses and zooms only under motion-safe, and only when it is a control', () => {
        const { container, rerender } = render(<ServiceCard name="Wash" priceLabel="$80" href="/x" />)
        expect(container.innerHTML).toContain('motion-safe:has-[[data-hit]:active]:scale-[0.985]')
        expect(container.innerHTML).toContain('motion-safe:group-hover/service:scale-[1.04]')
        rerender(<ServiceCard name="Wash" priceLabel="$80" />)
        expect(container.innerHTML).not.toContain('scale-[')
    })
})

describe('ServiceCardSkeleton', () => {
    it('is silent by default, because a list renders several', () => {
        const { container } = render(<ServiceCardSkeleton />)
        const el = container.firstElementChild as HTMLElement
        expect(el.getAttribute('aria-hidden')).toBe('true')
        expect(screen.queryByRole('status')).toBeNull()
    })

    it('announces when given a label', () => {
        render(<ServiceCardSkeleton layout="vertical" label="Loading services" />)
        expect(screen.getByRole('status')).toHaveTextContent('Loading services')
    })
})

describe('ServiceCard name survives a consumer heading rule', () => {
    /**
     * merchant-mobile and customer-web both set colour, line-height and
     * letter-spacing on h1 to h6 with an unlayered rule, which beats any
     * Tailwind utility on the heading itself. The name's ink therefore has to
     * live on the element inside the heading, or a selected card paints its
     * name ink on deep purple.
     */
    it.each([
        ['link', { href: '/x' }],
        ['select', { onSelect: () => {}, groupName: 'g' }],
        ['static', {}],
    ] as const)('%s mode puts the ink inside the heading, not on it', (_mode, props) => {
        render(<ServiceCard name="Wash" priceLabel="$80" selected {...props} />)
        const heading = screen.getByRole('heading', { name: 'Wash' })
        expect(heading.className).not.toMatch(/text-\[var/)
        const inner = heading.firstElementChild as HTMLElement
        expect(inner.className).toContain('text-[var(--on-selected)]')
        expect(inner.className).toContain('tracking-normal')
        expect(inner.className).toContain('leading-snug')
    })
})

