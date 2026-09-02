# design-sync NOTES — autara-ui (@augmara/autara-ui)

Storybook shape. 46 components, 266 stories. Project: "Autara UI" (pinned).
Atomic upload path (project pinned before run). Reference oracle: `.design-sync/sb-reference`.

## Build / config facts

- [GENERAL] **CSS ships via storybook scrape.** Package build is `tsc` only — it emits
  no CSS sidecar. The converter scrapes the compiled Tailwind CSS out of
  `sb-reference` (`[CSS_FROM_STORYBOOK]` → `iframe-*.css`, ~79 KB). This is expected
  and is the catch-all; do NOT try to set `cfg.cssEntry` to a dist file (there isn't one).
- [GENERAL] **titleMap renames two components to their exports.** Storybook titles
  `Atoms/Radio` and `Atoms/Toast` don't match a package export, so `cfg.titleMap`
  maps `Radio→RadioGroup`, `Toast→ToastProvider`. The component CARDS are therefore
  named **RadioGroup** and **ToastProvider** (reference those in `compare --components`,
  not Radio/Toast).
- **11 components flagged `[GRID_OVERFLOW] wide`** → `cfg.overrides.<X>.cardMode: "column"`
  (presentation-only, grades carry): BrandButton, Button, DropdownMenu, SearchInput,
  ImageCropDialog, Logo, TrustItem, ListSection, StatsStrip, FilterChipRow, InfoRow.
- [GENERAL] **No preview decorators / no cfg.provider needed.** `.storybook/preview.ts`
  declares no decorators. Components are self-contained: styling via CSS tokens/classes,
  and ToastProvider IS the provider component (rendered by its own stories). Solo phase
  confirmed no "must be inside Provider" errors. If a future component needs context,
  it'll surface as a cell error — set `cfg.provider` then.
- **Fonts:** Satoshi (.otf) is bundled in the package and copied to `fonts/`. No
  `[FONT_MISSING]`. (Reference storybook ships Nunito Sans for its own chrome — irrelevant.)
- **Remote images:** MerchantCard + ServiceCard stories load `images.unsplash.com`.
  Capture needs egress (verified working). If a future run blanks card images on BOTH
  panels, that's `[ASSETS_BLOCKED]` — re-run compare from a shell with egress.

## Component-specific

- **ImageCropDialog** — `[RENDER_THIN]` warn is **ACCEPTED/benign, do NOT chase it**.
  Its two stories (Profile Picture, Cover Banner) use one closed-dialog Demo that renders
  the same trigger; the aspect/crop-shape differences are dialog-internal, so the two
  stories are *supposed* to be statically identical and the storybook reference shows
  them identically too. An owned preview would render identically anyway. validate still
  exits 0. Graded match (interaction-gated).
- **PWAInstallBanner** — do NOT set `cardMode: "single"` (tried 2026-06-18, reverted):
  it makes the product CARD render near-blank `[RENDER_BLANK]` because the position:fixed
  banner falls outside the single-card capture frame. Default grid card renders fine and
  was never flagged. Component grades match. cardMode does NOT affect the compare oracle
  framing (the reference is from sb-reference) — the storybook-side clip is just a
  fullscreen-iframe artifact and needs no fix.
- **NavSearchPill** — root is `hidden lg:flex` (NavSearchPill.tsx:89): `display:none`
  below 1024px, so at the default capture viewport BOTH panels render empty (sb-error,
  not a preview defect). Fix applied: `cfg.overrides.NavSearchPill.viewport: "1280x400"`
  so the desktop pill actually renders and can be graded. (CompactSearchPill is the
  mobile counterpart and renders fine at default width.)
- **StepCard** — `LimeBandComposition` ("How it works" in-context section) grades
  **close**, accepted: storybook's narrow canvas stacks the `lg:grid-cols-3` grid to
  1-col while the wider preview capture activates 3-col and the fixed height crops below
  card 01. Component itself is faithful (Single + Interactive stories match); owning the
  `.tsx` can't fix a capture-framing/responsive-column difference. Re-sync risk: if the
  capture viewport changes this story may re-grade.
- **RatingStars** — ships **amber/orange** stars (not brand-purple). Preview matches the
  oracle exactly incl. half-star fill. The "purple stars" assumption is wrong; don't
  "fix" it.

## [GENERAL] Responsive min-width-gated components

A component whose root is hidden below a Tailwind breakpoint (`hidden lg:flex`,
`hidden xl:block`, …) renders EMPTY in both panels when the capture viewport is below
that breakpoint — it presents as `sb-error` "no storybook root content", NOT a preview
mismatch. Remedy is config-level: `cfg.overrides.<Name>.viewport: "1280x400"` (or skip),
never a `.tsx` edit. Hit by NavSearchPill; scan other desktop-nav primitives if they
sb-error the same way.

## [GENERAL] Interaction-gated overlays render trigger-only statically

Dialog and ToastProvider stories render only their TRIGGER button/UI in BOTH the
storybook reference and the preview (the overlay/toast opens on click / fires via the
`toast()` singleton). Both panels match → graded `match` on what renders. The overlay
CONTENT itself is not statically verified — this is faithful to the oracle (storybook
shows the same), and the real component ships in the bundle for the design agent.
**Expect the same for: Sheet, Tooltip, DropdownMenu, Select, MultiSelect, ImageCropDialog.**
When a batch hits one, grade the trigger match and note "interaction-gated"; do NOT
neutralize the story to force content — that destroys the fidelity being verified.

## Solo phase results (all match)

- Button (6/16 captured, cap), MerchantCard (6/9, asset canary OK), Dialog (3/3, gated),
  ToastProvider (6/7, gated). No global issues found.

## Re-sync risks (watch-list for the next run)

- titleMap-renamed cards (RadioGroup, ToastProvider) — if storybook titles change, re-map.
- Story caps: Button (16 stories, 6 graded), MerchantCard (9/6), ToastProvider (7/6).
  Tail stories verified-by-upload only.
- Gated overlays: trigger-only verification (see above) — content fidelity unchecked.
- No owned previews authored — all 46 components matched their generated previews
  (`.design-sync/previews/` is empty). If upstream story APIs change, generated previews
  re-derive automatically.
- StepCard `Lime Band Composition` accepted as `close` (responsive crop) — a capture
  viewport change will re-grade it.
