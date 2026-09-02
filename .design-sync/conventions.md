## Building with Autara UI

Every component is the real compiled `@augmara/autara-ui` code, reachable at
`window.AugmaraAutaraUi.<Name>` (e.g. `window.AugmaraAutaraUi.Button`). All styling
ships in `styles.css` (link it once — it `@import`s the design tokens, the Satoshi
fonts, and every component's CSS). There is **no Tailwind compiler in the render
context**, so only classes already in the shipped CSS resolve — see the styling rules
below before you reach for a utility class.

### Setup / wrapping

Components are self-contained — mount any of them directly, no theme provider or root
wrapper required (the tokens live in `:root`, loaded by `styles.css`). One exception:

- **Toasts** need `<AugmaraAutaraUi.ToastProvider>` mounted once near the root, then
  fire them imperatively with the `AugmaraAutaraUi.toast(...)` singleton (not a prop).

### How to style — two layers

**1. Style the components through their props, never by overriding their classes.**
The variant/size/tone props carry the design language. Most important:

- `Button` (and `BrandButton`) — `variant`: `"dark"` is the **primary CTA on cream
  surfaces (solid black)**; `"primary"` is brand-purple and is reserved for dark/photo
  surfaces; also `"outline" | "secondary" | "ghost" | "destructive" | "acid" | "link"`.
  `size`: `"sm" | "default" | "md" | "lg" | "icon"`; `fullWidth`, `leadingIcon`,
  `trailingIcon`, `asChild` (compose a router Link via Radix Slot).
- Read each component's `<Name>.d.ts` for its real prop union before composing — don't
  guess prop values.

**2. Style your own layout glue with the CSS custom properties** (these are guaranteed
present in the shipped CSS — use them via inline `style` or your own CSS; do NOT invent
Tailwind classes like `bg-autara-surface`, which are not compiled in):

| Concern | Tokens (real `var(--*)` names) |
|---|---|
| Surfaces | `--surface-warm` (warm cream `#FBFAF6`, the page bg), `--surface`, `--surface-elevated`, `--background`, `--foreground` |
| Text | `--text-strong`, `--text-muted`, `--text-subtle` |
| Borders | `--border-subtle` (the hairline — primary depth signal), `--border-hover` |
| Brand accents | `--color-autara-purple`, `--color-autara-purple-dark`, `--color-autara-lime-drive`, `--color-autara-lime-bright`, `--color-autara-sky-aqua`, `--color-autara-success`, `--color-autara-warning`, `--color-autara-error` |
| Radius | `--radius-sm` `--radius-md` `--radius-lg` `--radius-xl` `--radius-2xl` |
| Type | `--font-brand` (Satoshi; weights 400/500/700 only — never 300/600/800/900) |

A handful of **named editorial classes are also in the shipped CSS** and may be reused
directly: `.field-input` / `.field-textarea` (the signature 4px purple focus halo),
`.glass-card`, `.service-card`, `.editorial-eyebrow` (uppercase 11px eyebrow with a
hairline tick), `.hairline-grid`, `.nav-glass`, `.section-lime`.

### The non-negotiable look

Warm cream surfaces, **hairline borders (never drop shadows — all `--shadow-*` resolve
to `none`)**, brand purple as an **accent only** (focus rings, rating stars, brand
badges, link underlines — primary CTAs are solid black via `Button variant="dark"`).
Lift comes from `--border-hover`, not elevation.

### Where the truth lives

Before styling, read `styles.css` (and the `_ds_bundle.css` it imports) for the exact
tokens, and each component's `components/<group>/<Name>/<Name>.prompt.md` (worked
examples) + `<Name>.d.ts` (types). The real files beat any summary.

### Idiomatic snippet

```jsx
const { Card, Button, RatingStars, MetaChip } = window.AugmaraAutaraUi
function ProDetailCTA() {
  return (
    <Card style={{ background: "var(--surface)", borderRadius: "var(--radius-lg)",
                   border: "1px solid var(--border-subtle)", padding: 20,
                   fontFamily: "var(--font-brand)" }}>
      <div className="editorial-eyebrow">Top rated nearby</div>
      <h3 style={{ color: "var(--text-strong)", margin: "8px 0 4px" }}>Pristine Auto Detail</h3>
      <RatingStars rating={4.9} showHalf />
      <p style={{ color: "var(--text-muted)", margin: "8px 0 16px" }}>184 reviews · From $180 · Surry Hills</p>
      <Button variant="dark" fullWidth>Book now</Button>{/* solid-black primary CTA */}
    </Card>
  )
}
```
