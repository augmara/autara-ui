# autara-ui — Autara Design System

> The canonical UI package. Every reusable component, design token, and
> Tailwind preset for every Autara surface lives here. Published as
> `@augmara/autara-ui` on GitHub Packages.

Read the workspace [`CLAUDE.md`](../CLAUDE.md) end-to-end before any work
in this repo — three gates apply, "Storybook-first" is a hard rule, and
the Cross-Repo Contracts Catalog is the source of truth.

## The hard rule that brought v1.1.0 into being

**If a component is reusable, it lives here, with a Storybook story,
before any consumer imports it.**

This rule is non-negotiable. It exists because customer-web spent six
months evolving an editorial aesthetic that took the v1.1.0 harvest
project to recover into the shared package — six months of consumer
drift. Don't reintroduce that drift.

Full rule + workflow: workspace [`CLAUDE.md` §
Component architecture](../CLAUDE.md#component-architecture--storybook-first-always).

## Stack

| Layer | Choice |
|---|---|
| Build | `tsc` (no bundler — autara-ui ships .js + .d.ts + .css + fonts as-is) |
| Components | React 19 + Radix primitives + CVA + tailwind-merge |
| Tokens | CSS custom properties via Tailwind v4 `@theme inline` |
| Storybook | v10 + `@storybook/react-vite` + Tailwind v4 via `@tailwindcss/vite` |
| Release | semantic-release on PR merge → GitHub Packages |
| Distribution | `@augmara/autara-ui` (consumer pins via `package.json`) |

## Local dev

```sh
pnpm install
pnpm storybook       # http://localhost:6006
pnpm build           # tsc → dist/
pnpm build-storybook # storybook-static/ — deployable to Vercel
pnpm typecheck       # tsc --noEmit
```

## File layout

```
src/
├── components/             # React components — one per file
│   ├── <Component>.tsx
│   ├── <Component>.stories.tsx   ← REQUIRED for new components
│   └── index.ts            # bulk re-export
├── tokens/                 # CSS custom properties
│   ├── colors.css          # semantic surface stack + brand colors
│   ├── shadows.css         # ALL evaluate to `none` (Autara house rule)
│   ├── radii.css
│   ├── typography.css      # @font-face + --font-brand
│   └── index.css           # @import all
├── utilities/              # CSS utility classes
│   ├── forms.css           # .field-input, .field-textarea, .input-light alias
│   ├── glass.css           # .glass-card, .nav-glass, .service-card (no shadows)
│   ├── editorial.css       # .hairline-grid, .editorial-eyebrow, .counter-huge
│   ├── noise.css           # .noise-overlay
│   ├── buttons.css, gradients.css, sections.css, animations.css
│   └── index.css
├── fonts/                  # Satoshi .otf — bundled in v1.1.0+
├── preset/index.mjs        # Tailwind v4 preset (consumers import this)
├── lib/cn.ts               # clsx + tailwind-merge helper
└── index.ts                # public package surface

.storybook/
├── main.ts                 # framework + viteFinal
├── preview.ts              # global decorator + viewports
└── storybook.css           # loads tokens + utilities + forces warm-cream canvas

docs/
├── Introduction.mdx
└── Tokens.mdx              # visual token explorer
```

## Adding a new component — the checklist

1. **Audit first.** Grep `src/components/` for the closest existing
   primitive. Extend rather than duplicate when possible.
2. **Read the [`globals.css`](../autara-customer-web/src/app/globals.css)
   philosophy comment.** *"NO DROP SHADOWS. The brand reads as solid,
   editorial, hairline-edged — never floating-card."* Honor it. Lift
   comes from border-color shifts on hover, never `box-shadow`, never
   `translateY` on static surfaces (interactive buttons may translate).
3. **Use semantic tokens, never raw hex.** `var(--text-strong)` not
   `#0E0A1A`. `var(--surface)` not `#FFFFFF`. The exceptions are when
   you genuinely need a one-off color (rare — almost always wrong).
4. **Polymorphism via Radix Slot (`asChild`)**, not by importing the
   consumer's framework. autara-ui must NEVER `import "next/link"` or
   `from "react-router-dom"`. Slot composes with anything.
5. **Write the story alongside the component.**
   - Default
   - Each meaningful variant
   - At least one edge case (long text, missing optional fields, error
     state)
   - An "in context" story showing real consumer usage when the
     component composes others (see `MerchantCard.stories.tsx`'s
     `TopRatedRail` story for the canonical example)
6. **Export from `src/components/index.ts` AND `src/index.ts`.**
7. **Run `pnpm typecheck`, `pnpm build`, and `pnpm storybook`** — all
   three must be clean before opening a PR.
8. **Commit message follows semantic-release conventions:**
   - `feat: add MerchantCard` → minor bump (v1.1 → v1.2)
   - `fix: ...` → patch bump
   - `feat!: ...` or `BREAKING CHANGE:` in body → major bump

## Aesthetic invariants — the things that make Autara look like Autara

- **Warm cream** `#FBFAF6` — page background, never clinical white
- **Hairline borders** at `rgba(17,24,39,0.08)` — the primary depth signal
- **NO drop shadows** — `--shadow-*` tokens all evaluate to `none`
- **Brand purple `#4E1BBD` is an ACCENT** — used for rating stars,
  brand badges, focus rings, link underlines. Primary CTAs on cream
  surfaces are **solid black** (`BrandButton variant="dark"`), not
  purple. Purple primary is reserved for dark/photo surfaces.
- **Satoshi typography** — bundled. Use weights 400 / 500 / 700 only
  (Black mapped to 700). Never 300, 600, 800, 900.
- **4px brand-purple halo** on focused inputs (`.field-input`) — the
  signature focus ring
- **Editorial eyebrow** — uppercase 11px, `letter-spacing: 0.22em`,
  with a hairline tick (`::before`) — anchors every section heading

## Known gotchas

- Storybook 10's default canvas is dark; `storybook.css` forces
  warm-cream via `!important` on `html`, `body`, `#storybook-root`,
  `.docs-story`, `.sb-show-main`, `.sbdocs-*` so stories render in the
  canonical background. If you add a new Storybook chrome surface that
  ignores this, extend the selector list rather than removing the
  `!important`.
- `@theme inline` (Tailwind v4 native) is the right place for tokens.
  Don't define tokens in `:root {}` outside of `@theme inline` — they
  won't be available as Tailwind utilities.
- The Tailwind preset (`src/preset/index.mjs`) maps `bg-autara-purple`
  and friends. Consumers must include the preset in their Tailwind
  config OR import the CSS tokens — pick one consistent path per app.
- Components must NOT import `motion/react` for layout-critical
  visuals — `whileInView` + variants are flaky on Next 16 + React 19 +
  motion v12 in customer-web. Use IntersectionObserver or direct
  scroll-driven `useMotionValue` if motion is unavoidable. See
  `HowItWorks.tsx` in customer-web for the working pattern.

## Versioning

semantic-release fires on PR merge to `main`. The current major is
v1; v1.1.0 introduces the customer-web aesthetic + Storybook + 8
promoted components (MerchantCard, SectionHeading, CarouselHeader,
BrandButton, MetaChip, RatingStars, EmptyState, plus the existing
Card/Input/Button etc.). v1.2.0 is reserved for the remaining
component promotions (ServiceCard horizontal-thumb variant, TrustItem,
HowItWorks step-card pattern).
