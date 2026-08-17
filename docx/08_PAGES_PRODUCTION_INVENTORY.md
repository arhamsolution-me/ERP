# MEGA PROMPT 08 — PAGE DETAIL: PRODUCTION & INVENTORY MODULES
## NexERP — Element-Level UI Specification

**Role for AI Agent:** Build each page below exactly as specified. For every page: implement every listed element with the exact behavior described — no element is decorative-only unless explicitly marked so. Roles noted control visibility/editability per Prompt 03 RBAC rules.

---

## 17. Production Dashboard
**Purpose:** Mill Manager/Owner's single-glance view of everything happening on the production floor right now.
**Roles:** Mill Manager, Owner, General Manager (view), Production Supervisor (view own shift)

| Element | Function |
|---|---|
| Active Batches counter card | Shows count of batches currently in-progress; click → filters Batches List to `status=in_progress` |
| Stage Distribution donut chart | Visualizes how many batches are in each stage (spinning/weaving/dyeing/finishing/qc); click a slice → filtered batch list |
| Machine Status grid (mini) | Color-coded tiles per machine (green=running, yellow=idle, red=down); click tile → Machine Detail page |
| Today's Wastage % stat | Aggregated wastage vs. planned output today; red flag if above tenant-configured threshold |
| QC Pass Rate (7-day) sparkline | Trend line of quality pass rate; hover shows daily value |
| "New Batch" button (top-right) | Primary CTA → opens New Batch creation flow (page 20) |
| Recent Downtime alerts list | Last 5 machine downtime events with duration; click → Machine Detail |
| Date range selector | Filters all dashboard widgets to selected period (Today/7d/30d/Custom) |

---

## 18. Batches List
**Purpose:** Searchable, filterable log of every production batch.
**Roles:** Mill Manager, Production Supervisor, Owner, General Manager

| Element | Function |
|---|---|
| Search bar | Filters by batch number (debounced, server-side search) |
| Stage filter chips | Multi-select filter: spinning/weaving/dyeing/finishing/qc/completed |
| Status filter dropdown | All / In Progress / Completed / On Hold |
| Sortable columns (Batch #, Product Type, Stage, Planned Qty, Actual Qty, Started, Status) | Click header toggles sort direction |
| Row click | Navigates to Batch Detail (page 19) |
| "New Batch" button | → New Batch flow (page 20) |
| Bulk export button | Exports filtered list to CSV/Excel |
| Pagination controls | Server-paginated, 25/50/100 per page selector |

---

## 19. Batch Detail
**Purpose:** Full lifecycle view and control center for one production batch.
**Roles:** Mill Manager (full edit), Production Supervisor (stage updates only), Owner/GM (view + approve)

| Element | Function |
|---|---|
| Batch header (number, product type, status badge) | Static identity info, status badge color-coded |
| Stage progress bar (5 steps) | Visual current-stage indicator; each completed step shows timestamp + who completed it |
| "Advance Stage" button | Moves batch to next stage — opens confirmation modal requiring supervisor sign-off + optional notes; disabled if current stage's QC checkpoint hasn't passed |
| Material Consumption table | Lists raw material lots consumed, quantity, cost; "Add Consumption" row-add button (Mill Manager only) |
| Wastage input field (per stage) | Numeric entry, auto-calculates wastage % against planned quantity, flags red if over threshold |
| Machine assignment dropdown | Assigns/reassigns which machine is running this batch |
| QC Checkpoints sub-list | Each checkpoint shows pass/fail/rework result; click → QC Inspection Detail (page 29) |
| Activity/audit timeline | Chronological log of every change to this batch (who, what, when) — read-only, pulled from audit_logs |
| "Put On Hold" / "Resume" toggle | Owner/GM-only override to pause a batch (e.g., machine breakdown) with required reason field |

---

## 20. New Batch (Create Flow)
**Purpose:** Guided multi-step form to start a new production batch.
**Roles:** Mill Manager

| Element | Function |
|---|---|
| Step 1: Product & Quantity | Product type dropdown, planned quantity input, target completion date picker |
| Step 2: Raw Material Allocation | Multi-select material lots with quantity-to-allocate per lot; live-validates against `quantity_remaining`, blocks over-allocation |
| Step 3: Assign Mill/Machine/Supervisor | Dropdowns scoped to tenant's mills/machines/eligible supervisor users |
| Step 4: Review & Confirm | Summary of all entered data; "Create Batch" button submits (idempotent request) |
| Progress stepper (top) | Shows current step of 4, allows back-navigation without losing entered data |
| "Save as Draft" link | Persists partial form for later completion without creating a live batch |

---

## 21. Stage Tracker (Kanban View)
**Purpose:** Visual drag-style overview of all active batches across production stages.
**Roles:** Mill Manager, Production Supervisor

| Element | Function |
|---|---|
| 5 columns (Spinning/Weaving/Dyeing/Finishing/QC) | Each holds cards for batches currently in that stage |
| Batch card | Shows batch #, product type, days-in-stage (color-warns if stuck too long); click → Batch Detail |
| Drag card to next column | Triggers same "Advance Stage" confirmation modal as page 19 — no silent drag-commit |
| Column count badge | Number of batches currently in that stage |
| Filter by mill/machine | Narrows the board to a specific facility |

---

## 22. Raw Materials List
**Purpose:** Master catalog of all raw material types tracked.
**Roles:** Mill Manager, Owner

| Element | Function |
|---|---|
| Materials table (Name, Category, Unit, Current Total Stock, Reorder Threshold) | Sortable/searchable |
| Stock level bar (inline per row) | Visual bar showing stock vs. reorder threshold, red if below |
| "Add Material" button | Opens create-material modal (name, category, unit, reorder threshold fields) |
| Row click | Expands to show lot-level breakdown for that material |

---

## 23. Material Lot Receiving
**Purpose:** Log incoming raw material shipments from suppliers.
**Roles:** Mill Manager, Production Supervisor

| Element | Function |
|---|---|
| Material selector dropdown | Choose which raw material this lot is for |
| Supplier field (autocomplete) | Links to supplier record or free-text if new |
| Lot number field | Manually entered or auto-generated (tenant setting) |
| Quantity received input | Numeric, with unit label matching material's defined unit |
| Unit cost input | For costing/wastage-value calculations downstream |
| "Generate Barcode" toggle | If on, creates a printable lot barcode label on save |
| "Receive Lot" submit button | Creates `material_lots` record, increments material's total stock (idempotent) |

---

## 24. Dyeing Recipes List
**Purpose:** Library of standardized color/chemical formulas.
**Roles:** Mill Manager, Production Supervisor (view)

| Element | Function |
|---|---|
| Recipe cards (color swatch, name, code) | Visual color swatch rendered from stored color_code |
| Search by color code/name | Filters list |
| "New Recipe" button | → Recipe creation form |
| Card click | → Dyeing Recipe Detail (page 25) |

## 25. Dyeing Recipe Detail
| Element | Function |
|---|---|
| Chemical composition table | Chemical name, quantity ratio, editable (Mill Manager only) |
| Used-in-batches list | Read-only list of batches that used this recipe, for traceability |
| "Duplicate Recipe" button | Clones recipe as a new editable draft (common for slight color variations) |

---

## 26. Machines List
**Purpose:** Equipment inventory and live status.
**Roles:** Mill Manager, Production Supervisor

| Element | Function |
|---|---|
| Status filter tabs | All / Running / Idle / Maintenance / Down |
| Machine cards (name, type, current batch if running, uptime %) | Click → Machine Detail |
| "Add Machine" button | Registers new equipment |

## 27. Machine Detail / Downtime Log
| Element | Function |
|---|---|
| Current status toggle | Manually set Running/Idle/Maintenance/Down (also auto-updates from batch assignment) |
| Downtime history table | Reason, start time, resolved time, duration; "Log Downtime" button opens form (reason dropdown + free-text notes) |
| Maintenance schedule field | Next scheduled maintenance date, triggers reminder notification |
| Uptime chart (30-day) | Visual bar chart of daily uptime percentage |

---

## 28. Quality Control Queue
**Purpose:** Inspector's worklist of pending QC checks.
**Roles:** Production Supervisor, QC Inspector-tagged users

| Element | Function |
|---|---|
| Pending inspections list | Batches awaiting a QC checkpoint at current stage |
| Priority sort | Oldest-waiting first by default |
| Row click | → QC Inspection Detail (page 29) |

## 29. QC Inspection Detail (with AI Defect Scan)
| Element | Function |
|---|---|
| Image upload/capture zone | Upload or camera-capture fabric image |
| "Run AI Scan" button | Sends image to AI defect-detection service, shows loading state, returns confidence score + flagged defect regions overlaid on image |
| AI confidence score display | Numeric % with color coding (high confidence pass = green, flagged = red) |
| Manual override result selector | Inspector chooses Pass/Fail/Rework — AI result is advisory, human has final say, both stored |
| Defect type dropdown | If Fail/Rework, categorize the defect type |
| Notes field | Free text for inspector observations |
| "Submit Inspection" button | Records `quality_checks` entry, triggers stage-advance eligibility if Pass |

---

## 30. Wastage Report
**Purpose:** Cost-impact analysis of material wastage across production.
**Roles:** Mill Manager, Owner, Accountant

| Element | Function |
|---|---|
| Date range filter | Standard period selector |
| Wastage by stage bar chart | Which production stage generates most wastage |
| Wastage cost total stat | Wastage quantity × unit cost, aggregated |
| Batch-level drill-down table | Sortable by highest wastage % |
| Export button | CSV/Excel export for finance reporting |

---

## 31. Inventory Dashboard
**Purpose:** Cross-warehouse stock health overview.
**Roles:** Owner, GM, Retail Manager, Mill Manager

| Element | Function |
|---|---|
| Total SKUs / Total Stock Value stat cards | Aggregated across all warehouses (or scoped to user's branch) |
| Low-stock alert count | Click → Low-Stock Alerts page (page 40) |
| Warehouse stock comparison chart | Bar chart comparing stock value per location |
| Recent stock movements feed | Last 10 movements (inbound/outbound/transfer) with timestamps |

## 32. Warehouses List / 33. Warehouse Detail
| Element | Function |
|---|---|
| Warehouse cards (name, type, address) | Click → Warehouse Detail |
| Warehouse Detail: stock table | All variants stored there with quantity on hand/reserved |
| "Initiate Transfer" button | Pre-fills Stock Transfer form with this warehouse as source |

## 34. Products Catalog / 35. Product Detail & Variants
| Element | Function |
|---|---|
| Product grid/list toggle | Visual grid (with image) or dense list view |
| Filter by category | Standard filter |
| "Add Product" button | Opens product creation form (name, SKU, category, unit, HSN code) |
| Variant management (within Product Detail) | Add size/color combinations, each generates own barcode |
| "Generate Barcodes" button | Bulk-creates printable labels for all variants |

## 36. Stock Levels (by Warehouse)
| Element | Function |
|---|---|
| Warehouse selector | Switches the table's scope |
| Stock table (Variant, On Hand, Reserved, Available, Reorder Point) | Available = On Hand − Reserved, computed live |
| "Adjust Stock" row action | → Stock Adjustment Form (page 37) pre-filled |
| Reorder flag icon | Shown inline when On Hand < Reorder Point |

## 37. Stock Adjustment Form
| Element | Function |
|---|---|
| Adjustment type selector | Damage / Recount / Correction / Other |
| Quantity delta input | Positive or negative adjustment |
| Reason/notes field (required) | Mandatory justification, stored in audit trail |
| "Submit Adjustment" button | Idempotent, creates `stock_movements` record type=adjustment |

## 38. Stock Transfers List / 39. Stock Transfer Detail
| Element | Function |
|---|---|
| Status filter (Pending/In Transit/Received/Disputed) | Standard filter tabs |
| "New Transfer" button | → form: source warehouse, destination warehouse, variants + quantities |
| Transfer Detail: "Mark Received" button | Destination-side confirmation; quantity mismatch triggers Disputed status + alert |

## 40. Low-Stock Alerts
| Element | Function |
|---|---|
| Alert list (Variant, Warehouse, Current Qty, Reorder Point) | Sorted by most-critical (largest deficit) first |
| "Create Purchase/Transfer" quick action | Pre-fills a transfer or purchase request from this alert |
| Dismiss/snooze action | Temporarily hides an alert (e.g., known incoming shipment) |

## 41. Barcode/QR Label Generator
| Element | Function |
|---|---|
| Variant multi-select | Choose which SKUs to print labels for |
| Label size template dropdown | Match to physical label printer stock |
| Quantity-per-SKU input | How many copies to print |
| "Generate PDF" button | Produces print-ready label sheet |

---

Proceed to `09_PAGES_POS_SALES_FINANCE.md`.
