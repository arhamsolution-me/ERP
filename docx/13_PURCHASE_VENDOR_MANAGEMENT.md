# MEGA PROMPT 13 — PURCHASE & VENDOR MANAGEMENT MODULE
## NexERP — Full Module Spec (Database + Routes + Pages)

**Role for AI Agent:** This module was missing from the original spec — it covers the *buying side* that feeds Material Lot Receiving (Prompt 08, page 23). Without it, raw material only enters the system after arrival, with no upstream purchase order, approval, or vendor accountability trail. Build this as an extension of the Production/Inventory modules, following all conventions from Prompts 01–06.

---

## 1. Database Schema (extends Prompt 02)

```sql
vendors (id, tenant_id, name, contact_person, phone, email, address,
         vendor_type ENUM('raw_material','equipment','services','other'),
         payment_terms_days, tax_id, rating DECIMAL(2,1), status ENUM('active','blacklisted'),
         created_at, updated_at, deleted_at)

vendor_bank_details (id, tenant_id, vendor_id, bank_name, account_number_encrypted, iban)

purchase_requisitions (id, tenant_id, requested_by, branch_id, status
                        ENUM('draft','submitted','approved','rejected','converted'),
                        justification, needed_by_date, approved_by, approved_at)

purchase_requisition_items (id, tenant_id, requisition_id, material_id, quantity, estimated_unit_cost)

purchase_orders (id, tenant_id, po_number UNIQUE, vendor_id, requisition_id NULL,
                  status ENUM('draft','sent','confirmed','partially_received','received','cancelled'),
                  currency, total_amount, expected_delivery_date, created_by, approved_by, created_at)

purchase_order_items (id, tenant_id, po_id, material_id, quantity_ordered,
                       quantity_received, unit_cost, line_total)

goods_receipt_notes (id, tenant_id, po_id, received_by, received_at, notes)
-- links to material_lots (Prompt 02) — each GRN line creates/updates a material_lot record

vendor_payments (id, tenant_id, vendor_id, po_id, amount, method,
                  status ENUM('pending','paid','overdue'), due_date, paid_at)

vendor_evaluations (id, tenant_id, vendor_id, po_id, on_time_delivery BOOLEAN,
                     quality_rating INT, notes, evaluated_by, evaluated_at)
```

**RLS + tenant isolation rules from Prompt 02 apply identically to every table above.**

---

## 2. Approval Workflow Logic

```
Requisition (Supervisor requests) 
   → Approval (Mill Manager/Owner approves, based on tenant-configured spend threshold)
   → Purchase Order (auto-generated from approved requisition, or created directly by Mill Manager for routine reorders)
   → Sent to Vendor
   → Goods Receipt (partial or full — creates material_lots entries, Prompt 02)
   → Vendor Payment (tied to payment_terms_days from vendor record, feeds Finance module, Prompt 09)
```

- Spend-threshold rule: requisitions above a tenant-configured amount (`settings.po_approval_threshold`) require Owner-level approval, not just Mill Manager — configurable per tenant in Settings (Prompt 10, extend page 78 with a "Procurement" tab).
- Partial receipt handling: a PO can be received in multiple GRNs; PO status auto-transitions to `partially_received` until `quantity_received` across all GRN lines equals `quantity_ordered` for every line item, then auto-transitions to `received`.

---

## 3. API Routes (extends Prompt 04)

```
GET    /procurement/vendors                    perm: procurement.vendor.read
POST   /procurement/vendors                    perm: procurement.vendor.create
PATCH  /procurement/vendors/:id                perm: procurement.vendor.update
POST   /procurement/vendors/:id/blacklist      perm: procurement.vendor.blacklist

POST   /procurement/requisitions               perm: procurement.requisition.create   [idempotent]
GET    /procurement/requisitions                perm: procurement.requisition.read
PATCH  /procurement/requisitions/:id/approve   perm: procurement.requisition.approve
PATCH  /procurement/requisitions/:id/reject    perm: procurement.requisition.approve

POST   /procurement/purchase-orders             perm: procurement.po.create   [idempotent]
GET    /procurement/purchase-orders             perm: procurement.po.read
PATCH  /procurement/purchase-orders/:id/send    perm: procurement.po.send
POST   /procurement/purchase-orders/:id/receive perm: procurement.po.receive  [idempotent]  (creates GRN + material_lots)
PATCH  /procurement/purchase-orders/:id/cancel  perm: procurement.po.cancel

POST   /procurement/vendor-payments             perm: procurement.payment.create  [idempotent]
GET    /procurement/vendor-payments             perm: procurement.payment.read

POST   /procurement/vendors/:id/evaluate        perm: procurement.vendor.evaluate
```

---

## 4. New Roles/Permissions to Add (extends Prompt 03 RBAC table)

| Permission Code | Default Roles |
|---|---|
| `procurement.vendor.read/create/update` | Mill Manager, Owner, Accountant |
| `procurement.requisition.create` | Production Supervisor, Mill Manager |
| `procurement.requisition.approve` | Mill Manager (below threshold), Owner (above threshold) |
| `procurement.po.create/send` | Mill Manager, Owner |
| `procurement.po.receive` | Production Supervisor, Mill Manager |
| `procurement.payment.create` | Accountant, Owner |
| `procurement.vendor.evaluate` | Mill Manager |

---

## 5. Pages (extends Prompt 08's Production/Inventory page group — insert as pages 22a–22h)

### Vendors List / Vendor Detail
| Element | Function |
|---|---|
| Vendor cards/table (Name, Type, Rating, Status) | Blacklisted vendors visually flagged red, excluded from new PO vendor-selector by default |
| "Add Vendor" button | Form: contact info, payment terms, tax ID, bank details |
| Vendor Detail: order history tab | All past POs with this vendor, on-time delivery rate |
| Vendor Detail: evaluation history | Star ratings + notes from past receipts |
| "Blacklist Vendor" button | Requires reason, hides from future PO creation, doesn't affect historical records |

### Purchase Requisitions List / New Requisition
| Element | Function |
|---|---|
| Status filter tabs | Draft/Submitted/Approved/Rejected/Converted |
| New Requisition form | Material + quantity line items, justification text, needed-by date picker |
| "Submit for Approval" button | Routes to Mill Manager/Owner queue based on estimated total vs threshold |
| Approval Detail: "Approve"/"Reject" buttons | Reject requires reason field |
| "Convert to PO" button | Visible once approved — pre-fills a new Purchase Order with requisition's line items |

### Purchase Orders List / PO Detail
| Element | Function |
|---|---|
| Status filter tabs | Draft/Sent/Confirmed/Partially Received/Received/Cancelled |
| New PO form | Vendor selector, line items (material + qty + unit cost), expected delivery date, auto-calculated total |
| "Send to Vendor" button | Marks sent, triggers vendor-facing email/PDF with PO details |
| PO Detail: "Receive Goods" button | Opens Goods Receipt form — select which line items/quantities arrived (supports partial), auto-creates `material_lots` entries with lot numbers |
| PO Detail: receipt history | Every GRN logged against this PO, with received-by and timestamp |
| "Cancel PO" button | Requires reason, only allowed before any goods received |

### Vendor Payments List
| Element | Function |
|---|---|
| Status filter (Pending/Paid/Overdue) | Overdue auto-flagged based on `due_date` vs `payment_terms_days` |
| "Record Payment" button | Links to a PO, amount, method — feeds into Finance module's payment records (Prompt 09) |
| Aging summary widget | 0-30/31-60/61-90/90+ days outstanding breakdown |

---

## 6. Extra Detailing (applies rules from Prompt 12)

- Empty state for Vendors List (new tenant): "No vendors added yet" → "Add your first vendor" CTA.
- Destructive-action confirmation modal required for: Blacklist Vendor, Cancel PO.
- Duplicate-prevention async validation on `po_number` (if manually entered) and vendor tax ID.
- Optimistic UI NOT used for PO status transitions or goods receipt (financial/inventory-affecting, per Prompt 12 Section 5 rule) — always wait for server confirmation.

---

## 7. Integration Points with Existing Modules

- **Inventory (Prompt 08):** Goods Receipt directly creates `material_lots` records — reuse the exact logic from page 23 (Material Lot Receiving), just triggered from the PO flow instead of standalone entry. Standalone Material Lot Receiving should remain available for informal/non-PO purchases (small local vendors, cash-and-carry) but flag such lots as `source: 'direct_receipt'` vs `source: 'purchase_order'` for audit clarity.
- **Finance (Prompt 09):** Vendor Payments feed the same `payments` table structure — a vendor payment is `entity_type = 'purchase'` on the shared `invoices`/`payments` schema, not a parallel financial system.
- **Low-Stock Alerts (Prompt 08, page 40):** add a "Create Requisition" quick-action alongside the existing "Create Purchase/Transfer" action, pre-filled from the alert.
