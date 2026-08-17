# MEGA PROMPT 12 — EXTRA DETAILING: STATES, VALIDATION, MICRO-INTERACTIONS & EDGE CASES
## NexERP — Cross-Cutting UI/UX Polish Layer (applies to ALL 97 pages from Prompts 07–11)

**Role for AI Agent:** This prompt defines the behavior that must exist on EVERY page/component but wasn't repeated per-page in Prompts 08–11 to avoid redundancy. Treat every rule below as mandatory unless a specific page explicitly overrides it. A page is NOT considered complete/production-ready until it satisfies every applicable rule in this file.

---

## 1. Loading States (every data-fetching element)

- **Never a blank white screen.** Every page shows a skeleton loader matching the actual layout it will render (skeleton cards for card grids, skeleton rows for tables) — not a generic spinner, except for sub-200ms micro-actions (button clicks).
- **Buttons that trigger async actions** (Submit, Charge, Save, Approve, etc.): on click, button enters a disabled+spinner state immediately, label changes to a progress verb ("Saving...", "Charging...", "Submitting..."), and re-enables only on response — this prevents double-submission, which is a critical requirement for POS/financial actions in addition to the idempotency-key backend protection (Prompt 03).
- **Dashboards with multiple independent widgets:** each widget loads independently with its own skeleton — one slow chart must never block the rest of the dashboard from rendering.
- **Long-running actions** (report generation, bulk export, data export request — page 88): show a progress toast/notification that persists across navigation, with a "processing" status the user can check later rather than a blocking spinner.

---

## 2. Empty States (every list/table page)

Every list, table, dashboard widget, and search result MUST have a designed empty state — never just a blank table with headers. Each empty state includes: an icon/illustration, a one-line explanation of why it's empty, and where applicable a primary action to resolve it.

| Context | Empty State Message Pattern | Primary Action |
|---|---|---|
| Batches List, no batches yet | "No production batches yet" | "Create your first batch" button |
| Inventory, zero stock | "No stock recorded for this warehouse" | "Receive stock" or "Adjust stock" button |
| POS Transaction History, new terminal | "No sales recorded yet today" | (no action — informational) |
| Search returns zero results | "No results for '{query}'" | "Clear search" link |
| Leave Requests, none pending | "No pending leave requests" | (informational, positive tone) |
| Audit Log, filtered to nothing | "No activity matches these filters" | "Reset filters" link |

Never show a generic "No data" with no context — always name the entity and, where actionable, give the user the next step.

---

## 3. Error States

- **Field-level validation errors:** inline, directly below the field, red text + red border on the field itself, appears on blur (not on every keystroke — that's disruptive) and re-validates live once an error is showing (so it clears the moment it's fixed).
- **Form-level submission errors** (e.g., server rejected the request): a banner at the top of the form, not a browser alert() — specific message when available ("This SKU already exists"), generic fallback ("Something went wrong, please try again") when the server error isn't user-safe to expose.
- **Network/offline errors** (non-POS pages, since POS has its own offline-first design in Prompt 05): a persistent but non-blocking banner: "Connection lost — changes may not be saved" with automatic retry and a manual "Retry now" link.
- **403/permission-denied:** never a raw error page — a clear "You don't have access to this" state with a link back to the user's home dashboard, since the sidebar itself won't have shown a link to a restricted page, this only fires from stale bookmarks/deep links.
- **404 (entity not found)**: "This {batch/invoice/employee/etc.} doesn't exist or has been removed" with a link back to that entity's list page.
- **500/unexpected server error:** friendly fallback page, includes a reference/correlation ID (from the request tracing in Prompt 06) the user can quote to support — never a raw stack trace in production.

---

## 4. Form Validation Rules (applies to every form across all modules)

- **Required field indication:** asterisk + `aria-required`, never color-only (accessibility).
- **Real-time format validation:** email format, phone format (Pakistani + international patterns), numeric fields reject non-numeric input at the keystroke level (not just on submit).
- **Quantity/money fields:** never allow negative values unless the field is explicitly a signed adjustment (e.g., Stock Adjustment delta); enforce max decimal places matching the unit (e.g., currency = 2 decimals, kg = 3 decimals).
- **Date range fields:** end date picker disables dates before the selected start date; block submission if range is logically invalid.
- **Duplicate prevention:** SKU, barcode, invoice number, employee code fields validate uniqueness against the tenant's data via debounced async check, showing a spinner-then-checkmark/error inline as the user types.
- **Destructive actions require explicit confirmation:** Suspend User, Delete Product, Reject Leave Request, Suspend Tenant — all open a confirmation modal restating exactly what will happen, never a single-click destructive action.
- **Multi-step forms (New Batch, New Tenant Onboarding, etc.):** preserve entered data across steps (including back-navigation), and warn on browser-close/navigate-away if the form has unsaved changes ("beforeunload" prompt).

---

## 5. Micro-Interactions & Feedback

- **Success confirmation:** every successful create/update/delete shows a toast notification (auto-dismiss 4-5s, but pauses on hover) — "Batch created successfully," "Stock adjusted," etc. Never rely on the user noticing a page just... changed.
- **Optimistic UI where safe:** e.g., checking off a QC checkpoint, toggling a notification setting — UI updates instantly, rolls back with an error toast if the server rejects it. NOT used for anything financial/inventory-affecting (those wait for server confirmation per the idempotency design).
- **Hover/focus states:** every interactive element (button, row, card) has a visible hover state (desktop) and focus ring (keyboard nav) — no element should look identical whether interactive or static.
- **Undo affordance where feasible:** e.g., after archiving/deactivating a non-critical record, a toast with an "Undo" action for ~8 seconds before the action is finalized.
- **Copy-to-clipboard buttons** (API keys, invite links, transaction IDs): show a brief "Copied!" tooltip/state change on click.

---

## 6. Responsive & Cross-Device Behavior

- **Dashboard/office pages** (Finance, HR, Settings, Reports): responsive down to tablet width (768px); below that, show a "best viewed on a larger screen" notice for the densest reporting pages (P&L, Reconciliation) rather than cramming an unusable table onto a phone.
- **Factory-floor pages** (Batch Detail, Stage Tracker, QC Inspection, Machine Detail): must be fully usable on tablets (10") held by a supervisor walking the floor — larger tap targets, simplified single-column layouts at tablet breakpoints.
- **POS pages:** designed mobile/tablet-first (most POS hardware is a tablet), desktop is the secondary consideration.
- **Tables on small screens:** collapse to card-per-row layout below tablet breakpoint rather than horizontal-scrolling a dense table — each card shows the 2-3 most important columns with a "view details" expand for the rest.
- **Sidebar navigation:** collapses to a hamburger/bottom-nav pattern below tablet width across all authenticated app surfaces.

---

## 7. Permission-Aware UI Rendering (beyond just route-blocking)

- Elements the current role can't act on are either **hidden** (not just disabled) when the role would never plausibly need to see them (e.g., Cashier never sees a "Delete Product" button anywhere), or **disabled with a tooltip explaining why** when seeing-but-not-doing has value (e.g., Store Supervisor sees a "Approve Payroll" button disabled with tooltip "Only Accountant or Owner can approve payroll" so they understand the process even if they can't act).
- Cost/margin data (`unit_cost`, wholesale negotiated pricing) is never present in the DOM/API response for roles without permission to see it — not just CSS-hidden (a client-side hide is not a security boundary, per Prompt 03's field-level restriction rule).

---

## 8. Notification & Alert Behavior (in-app)

- **Toast notifications** for immediate action feedback (Section 5) — transient, don't require dismissal.
- **Persistent notification center** (bell icon, all authenticated pages) for things requiring awareness but not immediate interruption: low-stock alerts, pending approvals assigned to you, sync conflicts, leave requests awaiting your decision. Badge count shows unread total.
- **Critical alerts** (machine down, POS sync conflict on active shift, payroll approval deadline) escalate beyond the notification center to a dismissible banner at the top of the relevant module's pages until resolved.

---

## 9. Data Table Standard Behavior (applies to every list/table page in Prompts 08–11)

- Column sort (click header, toggles asc/desc/none), persisted in the URL query string so a shared/bookmarked link preserves the view.
- Filters persist in URL query params (shareable, survives refresh/back-button).
- Bulk selection (checkbox column) where bulk actions make sense (bulk export, bulk status update) — a selected-count bar appears above the table with available bulk actions.
- Sticky table header on scroll for long lists.
- Row density toggle (comfortable/compact) on data-dense pages (Inventory Stock Levels, Audit Log) for power users.

---

## 10. Currency, Number & Date Formatting Consistency

- All monetary values rendered via the tenant's `Intl.NumberFormat` currency setting (Prompt 05, Section 6) — never a hardcoded "Rs." prefix string anywhere in component code.
- Relative timestamps ("2 hours ago") on activity feeds/audit logs, with the exact timestamp available on hover/tooltip — never only relative (ambiguous for audit purposes) and never only absolute (harder to scan for recency).
- Large numbers (stock counts, revenue figures) use locale-aware thousand separators.

---

## 11. Print & Export Consistency

- Every "Export" button offers at minimum CSV + PDF where the data is tabular; receipts/invoices/payslips/labels are PDF-only (fixed layout documents).
- Print stylesheets for receipt (page 43), invoice (page 57), payslip (page 73), and barcode labels (page 41) are dedicated print-optimized layouts, not "print the whole webpage" — hide navigation/sidebar/buttons entirely in print media queries.

---

## 12. Deliverable Expectations for AI Agent

1. A shared component library implementing Sections 1–3 (Loading/Empty/Error state components) as reusable primitives — every page from Prompts 08–11 consumes these, never reimplements them per-page.
2. A form-validation utility layer (schema-driven, tied to the same Zod schemas used server-side per Prompt 03/04) so client and server validation rules never drift out of sync.
3. A `UI_STATES_CHECKLIST.md` — for every one of the 97 pages, a checklist confirming loading/empty/error/permission states have been implemented, used as a QA gate before a page is marked done.

This prompt (`12`) completes the NexERP specification suite (`00`–`12`, 13 files total) — architecture, database, security, API routes, frontend/SEO, DevOps, page sitemap, per-module page details, and this cross-cutting polish layer.
