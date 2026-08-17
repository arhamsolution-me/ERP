# MEGA PROMPT 09 — PAGE DETAIL: POS, SALES & FINANCE MODULES
## NexERP — Element-Level UI Specification

**Role for AI Agent:** Build each page below exactly as specified, element by element. The POS pages must remain fully functional with zero network connectivity (see Prompt 05, Section 4) — every action described below must work against the local IndexedDB queue first.

---

## 42. POS Terminal (Checkout Screen)
**Purpose:** Cashier's primary sale-entry screen — optimized for speed, touch, and offline reliability.
**Roles:** Cashier, Store Supervisor

| Element | Function |
|---|---|
| Product search/barcode scan input | Auto-focused on load; scanning a barcode or typing SKU adds item to cart instantly |
| Product grid (favorites/frequently sold) | Large touch tiles for quick-add without searching |
| Cart panel (right side) | Live list of added items, quantity steppers, per-line subtotal |
| Quantity stepper (+/−) per cart line | Adjusts quantity; removing to 0 removes the line |
| Discount button (per-line and cart-level) | Opens discount entry (% or fixed), requires Store Supervisor PIN override if beyond tenant's max-discount policy |
| Customer lookup field | Optional — search/add customer for wholesale credit or loyalty tracking |
| Sync status indicator (top bar) | Green dot = online/synced, yellow = offline queueing, red = sync conflict needing attention |
| "Charge" button (primary, large) | Proceeds to POS Cart & Payment (page 43) |
| "Hold Sale" button | Parks current cart for later resume (e.g., customer stepped away) |

---

## 43. POS Cart & Payment
**Purpose:** Payment collection and receipt completion.
**Roles:** Cashier

| Element | Function |
|---|---|
| Order summary (read-only) | Subtotal, tax, discount, total — final confirmation before payment |
| Payment method tabs | Cash / Card / JazzCash / Easypaisa / Credit (wholesale customers only) |
| Cash tendered input + change calculator | Auto-computes change due when cash amount entered |
| "Confirm Payment" button | Writes transaction to local queue immediately (idempotency key generated client-side), UI confirms instantly regardless of network state |
| Receipt preview | Print / SMS / WhatsApp / Skip options after confirmation |
| "New Sale" button | Clears screen, returns to POS Terminal for next customer |

---

## 44. POS Transaction History
**Purpose:** Cashier/Supervisor lookup of past sales.
**Roles:** Cashier (own transactions only), Store Supervisor (full branch)

| Element | Function |
|---|---|
| Date range filter | Standard period selector |
| Search by transaction ID/customer | Quick lookup |
| Transaction rows (time, cashier, total, payment method, sync status) | Click → detail view (line items, receipt reprint option) |
| "Refund" action (row-level) | Visible only if within refund policy window → Refund Flow (page 45) |

## 45. POS Refund Flow
| Element | Function |
|---|---|
| Original transaction line items | Select which items are being returned |
| Refund reason dropdown | Required field (defective/wrong item/customer changed mind/other) |
| Refund method | Matches original payment method by default, overridable by Supervisor |
| Store Supervisor PIN confirmation | Required for all refunds above tenant-configured threshold |
| "Process Refund" button | Idempotent, reverses stock movement, creates linked refund record |

## 46. POS Shift Open/Close
| Element | Function |
|---|---|
| Opening cash count input | Cashier enters starting cash drawer amount at shift start |
| Live shift sales summary | Running total of sales during current shift |
| Closing cash count input | End-of-shift count entry |
| Variance display | Auto-calculated expected vs. actual, flags discrepancy for Supervisor review |
| "Close Shift" button | Locks the shift record, generates shift report |

---

## 47. Customers List / 48. Customer Detail
**Roles:** Store Supervisor, Retail Manager, Accountant

| Element | Function |
|---|---|
| Customer type filter (Retail/Wholesale) | Standard filter |
| Search by name/phone | Quick lookup |
| "Add Customer" button | Form: name, phone, email, type, credit limit (wholesale only) |
| Customer Detail: purchase history tab | All past transactions/orders linked to this customer |
| Customer Detail: credit balance display | For wholesale — outstanding balance vs. credit_limit, color-warns near limit |

---

## 49. Wholesale Orders List / 50. Wholesale Order Detail / 51. New Wholesale Order
**Roles:** Retail Manager, Store Supervisor (create), Accountant (view)

| Element | Function |
|---|---|
| Status filter (Draft/Confirmed/Fulfilled/Invoiced) | Standard filter tabs |
| New Order: customer selector | Search/select existing wholesale customer |
| New Order: product/variant line-item builder | Add rows with quantity + negotiated unit price |
| New Order: total calculator (live) | Updates as line items change |
| "Save Draft" / "Confirm Order" buttons | Draft = editable, Confirm = locks pricing and triggers stock reservation |
| Order Detail: "Mark Fulfilled" button | Store Supervisor confirms physical dispatch, triggers stock deduction |
| Order Detail: "Generate Invoice" button | → creates linked Finance invoice record |

---

## 52. Sales Dashboard
**Purpose:** Owner/Retail Manager's revenue and performance overview.
**Roles:** Owner, GM, Retail Manager

| Element | Function |
|---|---|
| Revenue stat card (with vs. previous period %) | Total sales for selected date range |
| Sales trend line chart | Daily/weekly sales over time |
| Top-selling products table | Ranked by quantity or revenue, toggle switch between the two |
| Payment method breakdown pie chart | Cash vs Card vs JazzCash vs Easypaisa vs Credit split |
| Branch performance mini-table | Quick comparison, click → Branch Sales Comparison (page 53) |

## 53. Branch Sales Comparison
| Element | Function |
|---|---|
| Multi-branch selector | Choose which branches to compare (checkboxes) |
| Comparative bar chart | Revenue per branch side-by-side |
| Ranking table | Branches ranked by revenue, growth %, average transaction value |

## 54. Sync Status / Offline Queue Monitor
**Roles:** Store Supervisor, Retail Manager, IT/Owner

| Element | Function |
|---|---|
| Per-terminal sync status list | Each POS terminal's last-synced timestamp and pending-transaction count |
| Conflict list | Transactions flagged sync_status=conflict, with details of the stock/pricing mismatch |
| "Resolve Conflict" action | Opens reconciliation modal — manager chooses which version wins, or manually adjusts |
| Force-sync button | Manually triggers a sync attempt for a specific terminal |

---

## 55. Finance Dashboard
**Purpose:** Owner/Accountant's financial health overview.
**Roles:** Owner, Accountant

| Element | Function |
|---|---|
| Revenue/Expenses/Net Profit stat cards | Period-scoped summary |
| Cash flow trend chart | Inflow vs outflow over time |
| Outstanding invoices stat | Total unpaid, with overdue count highlighted red |
| Reconciliation status widget | % of bank transactions matched, click → Bank Reconciliation (page 60) |

## 56. Invoices List / 57. Invoice Detail / Create
| Element | Function |
|---|---|
| Status filter (Draft/Sent/Paid/Overdue) | Standard filter tabs |
| "New Invoice" button | Form: entity type (sale/purchase/export), linked reference, line items, due date |
| Invoice Detail: "Send" button | Marks as sent, triggers email/notification to customer |
| Invoice Detail: "Record Payment" button | → opens Payments quick-add linked to this invoice |
| PDF preview/download | Rendered invoice document matching tenant's branding |

## 58. Payments List
| Element | Function |
|---|---|
| Payment method filter | Standard filter |
| Reconciled/Unreconciled toggle | Filters by reconciliation status |
| Row click | Shows linked invoice and transaction reference |

## 59. Bank Accounts / 60. Bank Reconciliation
| Element | Function |
|---|---|
| Bank Accounts: account list | Name, bank, masked account number, current balance |
| Reconciliation: statement upload | Import bank statement (CSV/API feed) |
| Reconciliation: matching table | System-suggested matches between statement lines and internal payments, side-by-side |
| "Confirm Match" / "Flag Discrepancy" buttons | Per-row actions; confirmed matches lock, discrepancies route to Accountant review queue |

## 61. Export Documents List / 62. Export Document Detail
**Roles:** Accountant, Owner (for textile export clients)

| Element | Function |
|---|---|
| Document type filter (LC/Invoice/Packing List) | Standard filter |
| "New Document" button | Form varies by type — LC number/bank details, invoice line items, or packing list contents |
| Linked batch reference | Every export document ties back to a production batch for traceability |
| File attachment upload | Scanned original documents stored alongside structured data |

## 63. P&L Report
| Element | Function |
|---|---|
| Period comparison selector | This month vs last month vs last year |
| Revenue/COGS/Expenses breakdown table | Line-item financial statement |
| Branch/mill filter | Scope report to specific location or view consolidated |
| Export to PDF/Excel button | For sharing with stakeholders/auditors |

## 64. Tax / FBR Report
| Element | Function |
|---|---|
| Tax period selector | Monthly/quarterly per FBR filing requirements |
| Sales tax collected summary | Auto-aggregated from POS transactions |
| "Generate FBR Filing Export" button | Produces the structured file format required for submission |

---

Proceed to `10_PAGES_HR_ADMIN_SETTINGS.md`.
