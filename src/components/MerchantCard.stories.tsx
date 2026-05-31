import type { Meta, StoryObj } from "@storybook/react-vite";
import { MerchantCard, type MerchantCardProps } from "./MerchantCard";
import { CarouselHeader } from "./CarouselHeader";

const meta = {
  title: "Marketplace/MerchantCard",
  component: MerchantCard,
  parameters: { layout: "padded" },
  args: {
    name: "Pristine Auto Detail",
    primaryService: "Exterior detailing",
    location: "Surry Hills, NSW",
    rating: 4.9,
    reviewCount: 184,
    priceFromLabel: "$180",
    heroImageUrl:
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=70",
  },
} satisfies Meta<typeof MerchantCard>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Hero image sources — Unsplash car-care imagery ─────────────────────
const CARS = {
  magenta:
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=70",
  wrap: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=900&q=70",
  bay: "https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=900&q=70",
  mobile:
    "https://images.unsplash.com/photo-1601362840469-51e4d8d58785?auto=format&fit=crop&w=900&q=70",
};

const SAMPLE: MerchantCardProps[] = [
  {
    name: "Pristine Auto Detail",
    primaryService: "Exterior detailing",
    location: "Surry Hills, NSW",
    rating: 4.9,
    reviewCount: 184,
    priceFromLabel: "$180",
    heroImageUrl: CARS.magenta,
    badge: { tone: "purple", label: "Featured" },
  },
  {
    name: "Apex Wraps & Tint",
    primaryService: "Full vehicle wraps",
    location: "Alexandria, NSW",
    rating: 4.8,
    reviewCount: 92,
    priceFromLabel: "$2,500",
    heroImageUrl: CARS.wrap,
    badge: { tone: "purple", label: "Featured" },
  },
  {
    name: "Liquid Glass Ceramic",
    primaryService: "Ceramic coating",
    location: "Richmond, VIC",
    rating: 5.0,
    reviewCount: 67,
    priceFromLabel: "$950",
    heroImageUrl: CARS.bay,
    badge: { tone: "purple", label: "Featured" },
  },
  {
    name: "ShineHaus Detailing",
    primaryService: "Interior detailing",
    location: "Fortitude Valley, QLD",
    rating: 4.7,
    reviewCount: 121,
    priceFromLabel: "$240",
    heroImageUrl: CARS.mobile,
  },
];

const SAMPLE_NEW: MerchantCardProps[] = [
  { ...SAMPLE[3], name: "Vivid Auto Studio", location: "Marrickville, NSW", priceFromLabel: "$140", rating: 5.0, reviewCount: 7, badge: { tone: "aqua", label: "New" } },
  { ...SAMPLE[2], name: "Northside Ceramic", location: "Coburg, VIC", priceFromLabel: "$850", rating: 4.8, reviewCount: 12, badge: { tone: "aqua", label: "New" } },
  { ...SAMPLE[0], name: "River City Tinting", primaryService: "Window tinting", location: "West End, QLD", priceFromLabel: "$320", rating: 4.9, reviewCount: 9, badge: { tone: "aqua", label: "New" } },
  { ...SAMPLE[3], name: "Halo Mobile Wash", primaryService: "Mobile wash", location: "Bondi, NSW", priceFromLabel: "$85", rating: 4.9, reviewCount: 15, badge: { tone: "aqua", label: "New" } },
];

// ─── Single-card stories ───────────────────────────────────────────────

export const Featured: Story = {
  parameters: { layout: "centered" },
  args: SAMPLE[0],
  render: (args) => (
    <div className="w-80">
      <MerchantCard {...args} />
    </div>
  ),
};

export const NewBadge: Story = {
  parameters: { layout: "centered" },
  args: SAMPLE_NEW[0],
  render: (args) => (
    <div className="w-80">
      <MerchantCard {...args} />
    </div>
  ),
};

export const LimeBadge: Story = {
  parameters: { layout: "centered" },
  args: { ...SAMPLE[1], badge: { tone: "lime", label: "Trending" } },
  render: (args) => (
    <div className="w-80">
      <MerchantCard {...args} />
    </div>
  ),
};

export const WithFavorite: Story = {
  parameters: { layout: "centered" },
  args: { ...SAMPLE[0], onFavoriteClick: () => {} },
  render: (args) => (
    <div className="w-80">
      <MerchantCard {...args} />
    </div>
  ),
};

export const Favorited: Story = {
  parameters: { layout: "centered" },
  args: { ...SAMPLE[0], onFavoriteClick: () => {}, isFavorite: true },
  render: (args) => (
    <div className="w-80">
      <MerchantCard {...args} />
    </div>
  ),
};

// ─── The canonical homepage carousel — "Top-rated pros near you" ────────

export const TopRatedRail: Story = {
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        story:
          "The exact composition used on autara.au — CarouselHeader with editorial eyebrow + bold heading + arrow nav + 'See all' link, above a 4-up MerchantCard rail. Featured badges, brand-purple rating stars, 'FROM $X' pricing.",
      },
    },
  },
  render: () => (
    <div className="bg-[var(--background)] px-6 py-12 sm:px-10 lg:px-16">
      <CarouselHeader
        eyebrow="Recommended"
        title="Top-rated pros near you"
        description="Hand-picked, ABN-verified detailers with the strongest reviews."
        onPrev={() => {}}
        onNext={() => {}}
        prevDisabled
        seeAll={
          <a
            href="#all"
            className="inline-flex items-center gap-1 text-[var(--text-strong)] hover:text-[var(--color-autara-purple)]"
          >
            See all
            <svg
              viewBox="0 0 24 24"
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M7 17 17 7M9 7h8v8" />
            </svg>
          </a>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SAMPLE.map((m) => (
          <MerchantCard
            key={m.name}
            {...m}
            onFavoriteClick={() => {}}
          />
        ))}
      </div>
    </div>
  ),
};

// ─── "Just joined" rail — NEW badge variant on lime-drive ───────────────

export const JustJoinedRail: Story = {
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        story:
          "The 'Just joined' rail — NEW badges in autara-lime-drive accent. Same CarouselHeader pattern with a different eyebrow + subhead.",
      },
    },
  },
  render: () => (
    <div className="bg-[var(--background)] px-6 py-12 sm:px-10 lg:px-16">
      <CarouselHeader
        eyebrow="New on Autara"
        title="Just joined"
        description="Fresh faces verified in the last 30 days — be one of their first reviews."
        onPrev={() => {}}
        onNext={() => {}}
        seeAll={
          <a
            href="#all"
            className="inline-flex items-center gap-1 text-[var(--text-strong)] hover:text-[var(--color-autara-purple)]"
          >
            See all
            <svg
              viewBox="0 0 24 24"
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M7 17 17 7M9 7h8v8" />
            </svg>
          </a>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SAMPLE_NEW.map((m) => (
          <MerchantCard
            key={m.name}
            {...m}
            onFavoriteClick={() => {}}
          />
        ))}
      </div>
    </div>
  ),
};
