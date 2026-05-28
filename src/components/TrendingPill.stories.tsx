import type { Meta, StoryObj } from '@storybook/react-vite'
import { TrendingPill } from './TrendingPill'

const TrendingFlameIcon = () => (
    <svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor" aria-hidden>
        <path d="M13.5 0.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z" />
    </svg>
)

const meta: Meta<typeof TrendingPill> = {
    title: 'Markers/TrendingPill',
    component: TrendingPill,
    args: {
        label: 'Trending',
    },
    parameters: {
        layout: 'centered',
    },
}
export default meta
type Story = StoryObj<typeof TrendingPill>

export const Default: Story = {}

export const TrendingTone: Story = {
    args: { label: 'Trending', tone: 'trending', icon: <TrendingFlameIcon /> },
}

export const NewTone: Story = {
    name: 'Tone — new (higgsfield)',
    args: { label: 'New', tone: 'new' },
}

export const FeaturedTone: Story = {
    args: { label: 'Featured', tone: 'featured' },
}

export const PillFallback: Story = {
    name: 'Shape — pill (legacy fallback)',
    args: { label: 'Trending', shape: 'pill', icon: <TrendingFlameIcon /> },
}

export const Sizes: Story = {
    render: () => (
        <div className="flex items-center gap-3">
            <TrendingPill label="Trending" size="sm" />
            <TrendingPill label="Trending" size="md" />
            <TrendingPill label="Trending" size="lg" />
        </div>
    ),
}

export const AllTones: Story = {
    render: () => (
        <div className="flex items-center gap-3">
            <TrendingPill label="Trending" tone="trending" icon={<TrendingFlameIcon />} />
            <TrendingPill label="New" tone="new" />
            <TrendingPill label="Featured" tone="featured" />
        </div>
    ),
}

// In-context — on a hero image, matching MerchantCard's left-3/top-3 placement.
export const OnHeroImage: Story = {
    name: 'In context — on hero image',
    parameters: { layout: 'padded' },
    render: () => (
        <div className="relative h-56 w-72 overflow-hidden rounded-2xl bg-[var(--surface-warm)]">
            <img
                src="https://images.unsplash.com/photo-1611016186353-9af58c69a533?w=400&q=80"
                alt=""
                className="h-full w-full object-cover"
            />
            <TrendingPill
                label="Trending"
                tone="trending"
                icon={<TrendingFlameIcon />}
                className="absolute left-3 top-3"
            />
        </div>
    ),
}
