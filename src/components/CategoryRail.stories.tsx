import type { Meta, StoryObj } from '@storybook/react-vite'
import { CategoryRail, type CategoryRailItem } from './CategoryRail'

/**
 * CategoryRail — horizontal-snap browse-by-category rail used between
 * the hero and the marketplace rails on customer-facing surfaces.
 *
 * Promoted from autara-customer-web 2026-05-30 (AUTAA-UI-007).
 */

const meta = {
    title: 'Molecules/CategoryRail',
    component: CategoryRail,
    parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof CategoryRail>

export default meta
type Story = StoryObj<typeof meta>

// Inlined Solar Linear-style glyphs so the story is self-contained
const dropIcon = (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden>
        <path
            d="M12 2c4 6 7 9 7 13a7 7 0 1 1-14 0c0-4 3-7 7-13z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
        />
    </svg>
)

const shieldIcon = (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden>
        <path
            d="M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
        />
    </svg>
)

const sunIcon = (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
        <path
            d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
        />
    </svg>
)

const baseCategories: CategoryRailItem[] = [
    {
        slug: 'mobile-detailing',
        label: 'Mobile detailing',
        icon: dropIcon,
        blurb: 'Wash & polish at your driveway.',
        href: '/merchants?category=mobile-detailing',
    },
    {
        slug: 'ceramic-coating',
        label: 'Ceramic coating',
        icon: shieldIcon,
        blurb: 'Long-life hydrophobic seal.',
        href: '/merchants?category=ceramic-coating',
    },
    {
        slug: 'window-tinting',
        label: 'Window tinting',
        icon: sunIcon,
        blurb: 'Carbon, ceramic, UV-only films.',
        href: '/merchants?category=window-tinting',
    },
]

export const Default: Story = {
    args: {
        eyebrow: 'Browse by service',
        title: 'What can we book you?',
        seeAllHref: '/merchants',
        categories: baseCategories,
    },
}

export const NoSeeAll: Story = {
    name: 'No "See all" link',
    args: {
        eyebrow: 'Browse by service',
        title: 'What can we book you?',
        categories: baseCategories,
    },
}

export const NoEyebrow: Story = {
    name: 'No eyebrow — title only',
    args: {
        title: 'Pick a service',
        seeAllHref: '/merchants',
        categories: baseCategories,
    },
}

export const SixCategories: Story = {
    name: 'In context — six categories (mobile-snap)',
    args: {
        eyebrow: 'Browse by service',
        title: 'What can we book you?',
        seeAllHref: '/merchants',
        categories: [
            ...baseCategories,
            {
                slug: 'paint-protection-film',
                label: 'Paint protection',
                icon: shieldIcon,
                blurb: 'PPF for stone-chips & swirls.',
                href: '/merchants?category=paint-protection-film',
            },
            {
                slug: 'interior-detailing',
                label: 'Interior detailing',
                icon: dropIcon,
                blurb: 'Deep steam, leather, fabrics.',
                href: '/merchants?category=interior-detailing',
            },
            {
                slug: 'wraps',
                label: 'Full wraps',
                icon: sunIcon,
                blurb: 'Colour change, satin, chrome.',
                href: '/merchants?category=wraps',
            },
        ],
    },
}
