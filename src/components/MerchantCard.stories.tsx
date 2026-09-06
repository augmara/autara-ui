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

/* AUTM-1107: new merchants carry no rating and no invented one. `isNew`
   renders the lime parallelogram; the body has nothing standing in for
   stars. This is what a public search result looks like today: no price,
   no primary service, a suburb, sometimes a mode. */
const SAMPLE_NEW: MerchantCardProps[] = [
  { name: "Brunswick Mobile Detailing", location: "Brunswick, VIC", mode: "mobile", heroImageUrl: CARS.mobile, isNew: true },
  { name: "Richmond Ceramic Studio", location: "Richmond, VIC", mode: "workshop", heroImageUrl: CARS.bay, isNew: true },
  { name: "St Kilda Interior Care", location: "St Kilda, VIC", mode: "both", heroImageUrl: CARS.magenta, isNew: true },
  { name: "Waverley Wash Co.", location: "Glen Waverley, VIC", mode: "mobile", heroImageUrl: CARS.wrap, isNew: true },
];

// ─── Single-card stories ───────────────────────────────────────────────

const One = (args: MerchantCardProps) => (
  <div className="w-80">
    <MerchantCard {...args} />
  </div>
);

export const Rated: Story = {
  parameters: { layout: "centered" },
  args: { ...SAMPLE[0], badge: null, mode: "workshop" },
  render: One,
};

export const NewOnAutara: Story = {
  name: "New on Autara",
  parameters: { layout: "centered" },
  args: SAMPLE_NEW[0],
  render: One,
};

export const NewButRated: Story = {
  name: "New, but already rated (rating wins)",
  parameters: { layout: "centered" },
  args: { ...SAMPLE[3], isNew: true, badge: null },
  render: One,
};

export const Featured: Story = {
  parameters: { layout: "centered" },
  args: SAMPLE[0],
  render: One,
};

export const Modes: Story = {
  parameters: { layout: "padded" },
  render: () => (
    <div className="grid max-w-4xl grid-cols-3 gap-4">
      {(["mobile", "workshop", "both"] as const).map((mode, i) => (
        <MerchantCard key={mode} {...SAMPLE_NEW[i]} mode={mode} />
      ))}
    </div>
  ),
};

export const SearchResultBare: Story = {
  name: "Search result, nothing but a name and a suburb",
  parameters: { layout: "centered" },
  args: { name: "Xotic customs", location: "Dandenong South, VIC", heroImageUrl: CARS.wrap },
  render: One,
};

export const WithFavorite: Story = {
  parameters: { layout: "centered" },
  args: { ...SAMPLE_NEW[1], onFavoriteClick: () => {} },
  render: One,
};

export const Favorited: Story = {
  parameters: { layout: "centered" },
  args: { ...SAMPLE_NEW[1], onFavoriteClick: () => {}, isFavorite: true },
  render: One,
};

export const NoPhoto: Story = {
  parameters: { layout: "centered" },
  args: { ...SAMPLE_NEW[2], heroImageUrl: null },
  render: One,
};

export const LongName: Story = {
  parameters: { layout: "centered" },
  args: { ...SAMPLE[0], badge: null, name: "Melbourne Premium Mobile Detailing and Paint Correction Specialists" },
  render: One,
};

export const TextScale200: Story = {
  name: "At a 200% root",
  parameters: { layout: "centered" },
  args: { ...SAMPLE[0], badge: null, mode: "both", onFavoriteClick: () => {} },
  render: (args) => (
    <div className="w-[40rem]" style={{ fontSize: "32px" }}>
      <MerchantCard {...args} />
    </div>
  ),
};

// ─── In context: the marketplace rail and the directory grid ────────────

export const HomeRail: Story = {
  name: "In context: the home rail",
  parameters: { layout: "fullscreen" },
  render: () => (
    <div className="gradient-ground min-h-screen py-12">
      <div className="mx-auto max-w-7xl px-8">
        <CarouselHeader
          eyebrow="Now live"
          title="Verified pros in Melbourne"
          description="Every pro here is ABN-verified, ID-checked and insured before they can take a booking."
          onPrev={() => {}}
          onNext={() => {}}
          seeAll={<a href="#">See all</a>}
        />
        <div className="mt-7 flex gap-5 overflow-x-auto pb-2">
          {[...SAMPLE_NEW, { ...SAMPLE[0], badge: null, mode: "workshop" as const }].map((m) => (
            <div key={m.name} className="w-[280px] shrink-0">
              <MerchantCard {...m} onFavoriteClick={() => {}} />
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
};

export const DirectoryGrid: Story = {
  name: "In context: the directory grid",
  parameters: { layout: "fullscreen" },
  render: () => (
    <div className="gradient-ground min-h-screen py-12">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-5 px-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[...SAMPLE_NEW, ...SAMPLE.map((m) => ({ ...m, badge: null, priceFromLabel: undefined, primaryService: undefined }))].map((m) => (
          <MerchantCard key={m.name} {...m} onFavoriteClick={() => {}} />
        ))}
      </div>
    </div>
  ),
};
