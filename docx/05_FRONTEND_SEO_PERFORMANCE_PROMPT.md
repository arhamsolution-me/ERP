# MEGA PROMPT 05 — FRONTEND, SEO & PERFORMANCE
## NexERP — Global Multi-Tenant Textile-to-Retail ERP

**Role for AI Agent:** You are a Principal Frontend Engineer building a Next.js application that serves two very different surfaces from one codebase: (1) a public marketing/SEO site for lead generation, and (2) a dense, role-based ERP dashboard + offline-capable POS. Optimize each surface differently — do not apply dashboard patterns to the marketing site or vice versa.

---

## 1. Application Structure

```
/apps/web
  /app
    /(marketing)          → public, SEO-critical, SSG/ISR
      /page.tsx            → landing page
      /pricing/page.tsx
      /industries/textile/page.tsx
      /industries/retail/page.tsx
      /blog/[slug]/page.tsx
    /(auth)                → login, invite-accept, MFA — SSR, no-index
    /(dashboard)           → authenticated app shell, CSR-heavy, role-gated
      /production/...
      /inventory/...
      /pos/...             → also has a dedicated PWA shell
      /finance/...
      /hr/...
      /settings/...
```

Marketing routes and dashboard routes must NOT share heavy client bundles — use route groups so the dashboard's chart libraries, table libraries, etc. never load on the public marketing pages.

---

## 2. SEO Requirements (Marketing Surface Only)

- **Rendering:** Static Site Generation (SSG) for landing/pricing/industry pages, Incremental Static Regeneration for blog content (revalidate every 1 hour), NOT client-side rendered — search engines and social crawlers must get fully rendered HTML on first response.
- **Metadata:** use Next.js Metadata API for per-page `<title>`, `<meta description>`, canonical URL, Open Graph + Twitter Card tags. Every marketing page has unique, hand-written metadata — never a generic site-wide template repeated.
- **Structured Data (JSON-LD):** `Organization` schema on the homepage, `SoftwareApplication` schema on pricing, `Article` schema on blog posts, `BreadcrumbList` on all nested pages.
- **Sitemap & robots:** dynamically generated `sitemap.xml` (Next.js `app/sitemap.ts`) covering all marketing + blog routes; `robots.txt` explicitly disallowing `/dashboard`, `/api`, `/auth` from indexing.
- **Multi-tenant SEO trap avoidance:** tenant subdomains (`{tenant}.nexerp.com`) must NEVER be indexed — `noindex` header on all tenant-subdomain traffic; only the root marketing domain is SEO-targeted.
- **International SEO:** `hreflang` tags once multi-language ships; URL structure `/en/`, `/ur/` per locale, not query-param based.
- **Core Web Vitals as a hard gate:** LCP < 2.5s, INP < 200ms, CLS < 0.1 on marketing pages, measured in CI via Lighthouse CI on every PR — fail the build if a marketing page regresses below "Good" threshold.
- **Semantic HTML:** proper heading hierarchy (single `h1` per page), descriptive link text (never "click here"), alt text on every image sourced from a CMS field, not hardcoded generic text.

---

## 3. Dashboard/App Surface — Performance Requirements

- **Rendering strategy:** Server Components by default for data-heavy dashboard pages (fetch on server, stream to client), Client Components only for interactive islands (forms, charts, real-time POS UI) — minimizes JS shipped to the browser.
- **Code-splitting:** every module (Production, Inventory, POS, Finance, HR) is its own route-based chunk — a Cashier logging in never downloads the Finance module's bundle.
- **Data fetching:** use React Query (TanStack Query) on the client for anything that needs revalidation/polling (live stock levels, POS sync status), with stale-while-revalidate caching to keep dashboards feeling instant on repeat navigation.
- **Virtualization:** any table/list that can exceed ~200 rows (inventory lists, transaction history) MUST use a virtualized list (TanStack Virtual) — never render thousands of DOM rows.
- **Bundle budget:** enforce a max initial JS bundle size per route (e.g., 180KB gzipped for dashboard shell) via CI bundle-analyzer check; block merge on regression.
- **Images:** `next/image` everywhere, with tenant-uploaded product/fabric images served through an image CDN with on-the-fly resizing — never ship full-resolution uploads to a list view thumbnail.

---

## 4. Offline-First POS (PWA)

- POS routes registered as a Progressive Web App: service worker caches the app shell + last-known product/price catalog, so the POS is usable with zero connectivity.
- Local transaction queue (IndexedDB via Dexie.js) — every sale writes locally first, UI confirms instantly, background sync pushes to `/pos/transactions/sync-batch` (Prompt 04) when online, using the idempotency key generated at time of local creation.
- Visual sync-status indicator always visible to the cashier (Synced / Pending / Conflict) — never a silent failure state.
- Conflict resolution UI: if a sync-batch response flags a stock conflict, surface it to the Store Supervisor role for manual reconciliation, don't auto-resolve silently.

---

## 5. Accessibility (WCAG 2.1 AA minimum, both surfaces)

- Full keyboard navigability across the dashboard, including data tables and modals (focus trap in modals, escape-to-close).
- Color contrast checked programmatically in CI (axe-core) — critical for factory-floor tablet use in variable lighting.
- All form inputs have associated `<label>`, error messages announced via `aria-live` regions (important for the POS — cashiers need immediate non-visual feedback in a noisy retail environment).
- Large tap targets (min 44x44px) on POS/mobile factory-floor UI — these are used on shop-floor tablets and gloved hands, not precision mouse input.

---

## 6. Internationalization & Multi-Currency (build-in from day one)

- All UI strings routed through an i18n library (`next-intl`), even if only English + Urdu ship in v1 — retrofitting i18n later is expensive, scaffold it now.
- Currency/number/date formatting via `Intl` APIs, driven by `tenant.default_currency` / `tenant.default_timezone` from the DB (Prompt 02) — never hardcoded "Rs." or DD/MM/YYYY assumptions.
- RTL layout support scaffolded in the CSS architecture (logical properties `margin-inline-start` instead of `margin-left`, etc.) even though Urdu/English are both roughly LTR in this UI — future markets (Arabic) will need it.

---

## 7. Design System

- Build on Tailwind CSS with a shared design token file (`packages/ui/tokens.ts`) for color, spacing, typography — role-based theming allowed (e.g., factory-floor UI uses larger text/higher contrast than office dashboard) but tokens stay centralized, not duplicated per module.
- Component library (shadcn/ui as base) shared between marketing and dashboard, but marketing pulls only the subset it needs — no dead component code in the marketing bundle.

---

## 8. Deliverable Expectations for AI Agent

1. Next.js app scaffold with the route-group structure in Section 1.
2. Lighthouse CI config with the Core Web Vitals thresholds from Section 2 as merge-blocking checks.
3. PWA manifest + service worker implementation for the POS surface.
4. A component storybook (Storybook) documenting the shared design system.

Proceed to `06_DEVOPS_SCALABILITY_PROMPT.md`.
