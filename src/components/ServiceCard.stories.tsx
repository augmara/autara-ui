import type { Meta, StoryObj } from "@storybook/react-vite";
import { ServiceCard } from "./ServiceCard";
import { MetaChip } from "./MetaChip";

const meta = {
  title: "Marketplace/ServiceCard",
  component: ServiceCard,
  parameters: { layout: "padded" },
  args: {
    name: "Standard exterior wash",
    description:
      "Hand wash, dry, tyre dressing. Interior vacuum. Perfect for fortnightly upkeep.",
    priceLabel: "$80",
    durationLabel: "45 min",
  },
} satisfies Meta<typeof ServiceCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const SERVICE_PHOTO =
  "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=400&q=70";

export const Default: Story = {
  render: (args) => (
    <div className="max-w-2xl">
      <ServiceCard {...args} />
    </div>
  ),
};

export const WithThumbnail: Story = {
  args: { coverImageUrl: SERVICE_PHOTO },
  render: (args) => (
    <div className="max-w-2xl">
      <ServiceCard {...args} />
    </div>
  ),
};

export const WithPricePrefix: Story = {
  args: { pricePrefix: "From", priceLabel: "$120", durationLabel: "1.5 hr" },
  render: (args) => (
    <div className="max-w-2xl">
      <ServiceCard {...args} />
    </div>
  ),
};

export const WithAddonsHint: Story = {
  args: { addonsHint: "+2 add-ons available", coverImageUrl: SERVICE_PHOTO },
  render: (args) => (
    <div className="max-w-2xl">
      <ServiceCard {...args} />
    </div>
  ),
};

export const Interactive: Story = {
  args: {
    coverImageUrl: SERVICE_PHOTO,
    as: "a",
    href: "#book",
    trailingLabel: "Book this",
  },
  render: (args) => (
    <div className="max-w-2xl">
      <ServiceCard {...args} />
    </div>
  ),
};

export const WithBadge: Story = {
  args: {
    coverImageUrl: SERVICE_PHOTO,
    badge: <MetaChip tone="brand">Popular</MetaChip>,
  },
  render: (args) => (
    <div className="max-w-2xl">
      <ServiceCard {...args} />
    </div>
  ),
};

/** Full menu — multiple services stacked, the way they appear on a merchant profile. */
export const ServiceMenu: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "How ServiceCards stack on a real merchant profile — list of bookable services with optional thumbnails, prices, durations, and an arrow-CTA when interactive.",
      },
    },
  },
  render: () => (
    <div className="max-w-2xl space-y-3">
      <ServiceCard
        name="Standard exterior wash"
        description="Hand wash, dry, tyre dressing, interior vacuum."
        priceLabel="$80"
        durationLabel="45 min"
        coverImageUrl={SERVICE_PHOTO}
        as="a"
        href="#"
        trailingLabel="Book this"
      />
      <ServiceCard
        name="Full detail + ceramic top-up"
        description="Two-bucket wash, decontamination, single-stage polish, 3-month ceramic boost."
        pricePrefix="From"
        priceLabel="$320"
        durationLabel="3 hr"
        addonsHint="+2 add-ons available"
        coverImageUrl={SERVICE_PHOTO}
        as="a"
        href="#"
        trailingLabel="Book this"
        badge={<MetaChip tone="brand">Popular</MetaChip>}
      />
      <ServiceCard
        name="Interior steam clean"
        description="Hot-water extraction, leather conditioning, headliner refresh."
        priceLabel="$180"
        durationLabel="2 hr"
        as="a"
        href="#"
        trailingLabel="Book this"
      />
    </div>
  ),
};
