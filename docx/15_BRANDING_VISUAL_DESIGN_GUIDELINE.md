# MEGA PROMPT 15 — BRANDING & VISUAL DESIGN GUIDELINE
## NexERP — Visual Identity System (Logo, Color, Typography, Component Style)

**Role for AI Agent:** You are a Brand & Product Design Lead. This prompt defines the visual identity layer that sits ABOVE the technical design tokens from Prompt 05 — it tells you *why* the tokens should be what they are, and how every visual element should look/feel across marketing site, dashboard, and POS surfaces. Where a specific hex/font isn't dictated by Devnexes' existing brand assets, this prompt gives a recommended direction the AI agent should propose and get confirmed before locking in — do not silently invent brand colors with no rationale.

---

## 1. Brand Positioning (drives every visual decision below)

NexERP is built by **Devnexes Digital Solutions** — tagline *"We Don't Just Build — We Solve."* The product serves two very different end-users under one brand:
- **Factory-floor / mill staff** — need clarity, high contrast, large touch targets, low visual noise (industrial, functional environment).
- **Office/management/finance staff** — need density, precision, data-forward design (professional SaaS environment).

The visual identity must read as **serious, trustworthy, and international-grade** (this product is sold to UAE/UK/USA clients too, not just local SMEs) — avoid anything that looks like a generic bootstrap-templated local dev shop product. Reference-quality peers to study for tone (not to copy): Linear (precision/restraint), SAP Fiori (enterprise density done well), Odoo (approachable but still enterprise).

---

## 2. Logo System

- **Primary logo:** full Devnexes/NexERP lockup — used on marketing site header, login page, exported PDF documents (invoices, payslips, reports).
- **Icon-only mark:** used in the dashboard sidebar (collapsed state), browser favicon, POS terminal header (space-constrained), mobile app icon.
- **Clear space rule:** minimum clear space around the logo equal to the height of the icon mark itself — never let UI chrome, text, or other elements crowd it.
- **Minimum size:** define a minimum px size below which only the icon mark is used, never the full lockup (full lockups become illegible below ~24px height).
- **Do NOT:**
  - Stretch, skew, or recolor the logo outside the approved color variants (full-color, all-white for dark backgrounds, all-black for light single-color contexts).
  - Place the logo on a busy photographic background without a solid-color safe-zone behind it.
  - Recreate the logo in a different font/weight anywhere in the product — it is always used as a locked asset (SVG), never retyped.
- **Variants needed:** full-color (primary), monochrome white (dark backgrounds/dark mode), monochrome black (print/single-color contexts), icon-only (all size variants above).
- **Co-branding rule (white-label tenants):** since NexERP is positioned as a white-label-ready SaaS (per memory of the BizPilot/tourism-app pattern), define how a tenant's own logo appears alongside/instead of NexERP branding — e.g., tenant logo in the app header, "Powered by NexERP" small-print in the footer, never the reverse unless a specific enterprise contract removes it entirely.

---

## 3. Color System (extends Prompt 05's token file with actual rationale + values)

### Primary Palette (proposed — confirm against actual Devnexes brand assets before locking)
| Role | Suggested Direction | Rationale |
|---|---|---|
| Primary brand color | Deep blue or indigo (e.g., `#1E3A8A`–`#1E40AF` range) | Conveys trust/enterprise-grade, reads well internationally, distinguishes from Odoo's purple and SAP's blue without being identical |
| Secondary/accent | A warm accent (amber/teal) used sparingly for CTAs and highlights | Prevents an all-blue, monotonous enterprise look; used for primary buttons and key data highlights only, not decoratively |
| Success | Standard green (`#16A34A` range) | Universal convention — don't reinvent semantic colors |
| Warning | Amber (`#D97706` range) | Used for low-stock, pending-approval states |
| Danger/Destructive | Red (`#DC2626` range) | Used for errors, destructive actions, overdue/critical alerts |
| Neutral/grayscale | A full 10-step gray scale, slightly cool-toned (not pure gray) | Backbone of all text, borders, backgrounds — most of the UI's surface area |

### Contextual Color Rules
- **Factory-floor surfaces** (Batch Detail, Stage Tracker, Machine status): use HIGH-CONTRAST variants of the semantic colors (status = running/idle/maintenance/down) — these are viewed on tablets in variable factory lighting, subtlety is a liability here, not a virtue.
- **Office/dashboard surfaces:** semantic colors used more sparingly, mostly for status badges/alerts against a calm neutral background — data density matters more than color emphasis.
- **Dark mode:** if supported, define a full dark-mode mapping of every token (not just inverting — deep navy/charcoal backgrounds, not pure black, with adjusted (usually desaturated) accent colors for reduced eye strain in office use).
- **Never use color as the only signal** — every status/semantic color pairs with an icon or text label (accessibility, and factory-floor users may include colorblind workers).

---

## 4. Typography

- **Primary typeface:** a highly-legible, international (Latin + Urdu-compatible where possible) sans-serif — e.g., Inter, IBM Plex Sans, or similar geometric/grotesque sans. Must support Urdu script cleanly if Roman Urdu/Urdu UI ships (per Prompt 05's i18n scaffolding) — verify font has proper Arabic-script glyph coverage before locking in, or pair with a dedicated Urdu-script font for that locale.
- **Type scale:** define a modular scale (e.g., 12/14/16/18/24/32/40px) used consistently — dashboard body text defaults to 14px (data density), marketing site body text defaults to 16-18px (readability/conversion-focused).
- **Weight usage:** Regular (400) for body text, Medium (500) for UI labels/buttons, Semibold (600) for headings/emphasis — avoid Bold (700+) except sparingly for hero marketing headlines; overuse of heavy weights reads as unpolished.
- **Numeric tables (Finance, Inventory, Payroll):** use tabular/monospaced-numeral figures (a font feature, most modern sans-serifs support `font-variant-numeric: tabular-nums`) so columns of numbers align vertically — critical for financial data scannability.
- **Line height:** generous line-height (1.5+) on marketing/reading content, tighter (1.3-1.4) on dense dashboard tables where vertical space is at a premium.

---

## 5. Iconography

- Single icon library used platform-wide (e.g., Lucide, matching the `lucide-react` library already available per the artifact tooling) — never mix icon styles/weights from multiple sets.
- Stroke width consistent across all icons (typically 1.5-2px at standard sizes).
- Factory-floor/POS icons sized larger (24-28px) than office-dashboard icons (16-20px) per the same high-contrast/large-target logic as Section 3.
- Every icon used alone (no adjacent text label) must have an accessible label (`aria-label`/tooltip) — icons are never the sole means of conveying meaning without a fallback.

---

## 6. Component Visual Style (beyond tokens — the actual "feel")

- **Corner radius:** define one consistent radius scale (e.g., 6px for buttons/inputs, 10-12px for cards, 16px+ for modals) — a single arbitrary radius value used everywhere except where a specific reason exists to deviate (e.g., POS tap-tiles slightly more rounded for a friendlier, larger-target feel than dense office data tables).
- **Elevation/shadow system:** subtle, restrained shadows (avoid heavy drop-shadows that read as dated skeuomorphism) — define 3 elevation levels: resting (cards), raised (dropdowns/popovers), overlay (modals) — each with a specific, reused shadow value, not ad-hoc per component.
- **Borders vs. shadows for separation:** dense data tables (Inventory, Finance) favor thin border-based row separation over shadow-based card separation — reserves shadow emphasis for genuinely elevated UI (modals, dropdowns), keeping tables calm and scannable.
- **Buttons:**
  - Primary: filled, brand/accent color, used once per view for the single most important action (never multiple competing primary buttons on one screen).
  - Secondary: outlined or subtle-filled, for secondary actions.
  - Destructive: red, always paired with a confirmation step (per Prompt 12).
  - Disabled state: visibly muted (reduced opacity + no pointer cursor), never just non-functional-looking-identical-to-active.
- **Form inputs:** consistent height across all input types (text, select, date) within the same form — visual misalignment between input types is a common polish failure to avoid.
- **Status badges:** consistent pill-shaped component, color per Section 3's semantic palette, used identically across every module (a "Pending" badge looks the same in HR Leave Requests as it does in Finance Invoices).
- **Data visualization (charts):** consistent color sequence across all charts platform-wide (don't let each chart library default to its own random palette) — derive chart colors from the same token system, semantic colors reserved for their semantic meaning even in charts (red segments = something bad, not just "the 3rd item in the legend").

---

## 7. Surface-Specific Visual Treatment

| Surface | Visual Character |
|---|---|
| Marketing site | More visual flourish allowed — gradients, illustration, motion on scroll — this is the one surface where personality/warmth is prioritized over density |
| Office dashboard | Calm, dense, data-forward — minimal decoration, generous use of neutral grays, color reserved for meaning (status/alerts) not decoration |
| Factory-floor tablets | High-contrast, large components, minimal text — approaches an industrial-HMI visual language more than a typical SaaS dashboard |
| POS terminal | Friendly, fast, touch-optimized — larger rounded tap-targets, immediate visual feedback on every tap, closer in feel to a modern payment app than an enterprise dashboard |

Do not apply one single visual treatment uniformly across all four — the persona and physical context differ enough that a single "one-size" dashboard skin would fail at least two of these contexts.

---

## 8. Motion & Animation Principles

- Motion is **functional, not decorative** — used to communicate state change (loading, success, error per Prompt 12), never gratuitous animation on marketing/dashboard alike.
- Standard duration/easing tokens: fast (100-150ms, ease-out) for hover/press feedback, medium (200-300ms, ease-in-out) for panel/modal transitions, avoid anything slower than ~400ms in the dashboard (factory/office users doing repetitive tasks all day will find slow animation actively fatiguing over time).
- Respect `prefers-reduced-motion` — disable non-essential transitions for users with that OS-level preference set.

---

## 9. Accessibility & Brand Interplay

- Every brand color combination (text-on-background, button-on-surface) must pass WCAG AA contrast (4.5:1 normal text, 3:1 large text/UI components) — verify the proposed primary/accent colors from Section 3 against this before finalizing, adjust saturation/lightness rather than abandoning the brand hue if a specific pairing fails.
- Brand identity should never come at the cost of the accessibility requirements already defined in Prompt 05, Section 5.

---

## 10. Asset & Documentation Deliverables

1. Logo asset package: SVG source files for every variant in Section 2, exported PNG/ICO for favicon/app-icon use cases.
2. A living `packages/ui/tokens.ts` (per Prompt 05) populated with the finalized values from Sections 3-4 once confirmed against actual Devnexes brand assets.
3. A Figma (or equivalent) brand/component reference file — single source of truth for designers and the AI agent alike, referenced before building any new component so visual drift doesn't creep in module-by-module.
4. A `BRAND_GUIDELINES.md` (human-readable version of this prompt) linked in onboarding material for any new designer/developer joining the project.

---

## Important Note Before Implementation

Section 2 (logo) and Section 3 (color palette) contain **proposed/placeholder directions**, not confirmed Devnexes brand assets. Before building the actual logo files or locking the token values into code, confirm against Devnexes' existing brand materials (if the tagline "We Don't Just Build — We Solve" already has an established visual identity from earlier branding work) — this prompt should guide a design review conversation, not silently override existing brand decisions.

This prompt (`15`) extends the NexERP specification suite. Combined with `13` (Procurement) and `14` (Legal/Compliance), the full suite is now `00`–`15`, 16 files total.
