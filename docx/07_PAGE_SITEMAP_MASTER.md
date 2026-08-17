# MEGA PROMPT 07 — MASTER PAGE SITEMAP
## NexERP — Complete Page Inventory (Total Page Count + Module Breakdown)

**Role for AI Agent:** This is the authoritative page inventory for NexERP. Every page listed here MUST exist; do not invent extra pages or skip any. Detailed element-by-element specs for each page group are in prompts 08–11.

---

## Total Page Count: **97 Pages**

| Module | Page Count | Detail File |
|---|---|---|
| Marketing / Public Site | 9 | `11_PAGES_MARKETING_AUTH.md` |
| Auth & Account | 7 | `11_PAGES_MARKETING_AUTH.md` |
| Production (Textile) | 14 | `08_PAGES_PRODUCTION_INVENTORY.md` |
| Inventory & Warehouse | 11 | `08_PAGES_PRODUCTION_INVENTORY.md` |
| POS / Sales / Wholesale | 13 | `09_PAGES_POS_SALES_FINANCE.md` |
| Finance | 10 | `09_PAGES_POS_SALES_FINANCE.md` |
| HR & Payroll | 12 | `10_PAGES_HR_ADMIN_SETTINGS.md` |
| Admin / Settings / RBAC | 13 | `10_PAGES_HR_ADMIN_SETTINGS.md` |
| Platform Admin (Devnexes-only) | 8 | `10_PAGES_HR_ADMIN_SETTINGS.md` |

---

## Full Page List (grouped)

### A. Marketing / Public (9)
1. Homepage
2. Pricing
3. Industries — Textile
4. Industries — Retail
5. Features Overview
6. Blog Index
7. Blog Post (dynamic)
8. About / Company
9. Contact / Book a Demo

### B. Auth & Account (7)
10. Login
11. MFA Verification
12. Invite Accept / Set Password
13. Forgot Password
14. Reset Password
15. My Profile
16. My Sessions & Devices

### C. Production (14)
17. Production Dashboard (overview)
18. Batches List
19. Batch Detail
20. New Batch (create flow)
21. Stage Tracker (Kanban view)
22. Raw Materials List
23. Material Lot Receiving
24. Dyeing Recipes List
25. Dyeing Recipe Detail
26. Machines List
27. Machine Detail / Downtime Log
28. Quality Control Queue
29. QC Inspection Detail (with AI defect scan)
30. Wastage Report

### D. Inventory & Warehouse (11)
31. Inventory Dashboard
32. Warehouses List
33. Warehouse Detail
34. Products Catalog
35. Product Detail / Variants
36. Stock Levels (by warehouse)
37. Stock Adjustment Form
38. Stock Transfers List
39. Stock Transfer Detail
40. Low-Stock Alerts
41. Barcode/QR Label Generator

### E. POS / Sales / Wholesale (13)
42. POS Terminal (checkout screen)
43. POS Cart & Payment
44. POS Transaction History
45. POS Refund Flow
46. POS Shift Open/Close
47. Customers List
48. Customer Detail
49. Wholesale Orders List
50. Wholesale Order Detail
51. New Wholesale Order (create flow)
52. Sales Dashboard
53. Branch Sales Comparison
54. Sync Status / Offline Queue Monitor

### F. Finance (10)
55. Finance Dashboard
56. Invoices List
57. Invoice Detail / Create
58. Payments List
59. Bank Accounts
60. Bank Reconciliation
61. Export Documents List
62. Export Document Detail (LC/Invoice/Packing List)
63. P&L Report
64. Tax / FBR Report

### G. HR & Payroll (12)
65. HR Dashboard
66. Employees List
67. Employee Detail / Onboarding
68. Attendance Log (biometric feed)
69. Attendance Manual Entry
70. Shift Scheduling
71. Payroll Runs List
72. Payroll Run Detail / Approval
73. Payslip View
74. Leave Requests List
75. Leave Request Detail / Approval
76. HR Reports

### H. Admin / Settings / RBAC (13)
77. Settings Home
78. Company Profile Settings
79. Branches Management
80. Users List
81. User Detail / Role Assignment
82. Invite New User
83. Roles & Permissions Manager
84. Audit Log Viewer
85. Notification Settings
86. Integrations (Payment Gateways, FBR, Biometric)
87. Subscription & Billing
88. Data Export / Backup Settings
89. API Keys & Webhooks

### I. Platform Admin — Devnexes-only (8)
90. Platform Dashboard (all tenants overview)
91. Tenants List
92. Tenant Detail
93. New Tenant Onboarding
94. Subscription Plans Management
95. Platform Usage Analytics
96. Platform Audit Log
97. System Health / Incident Console

---

## Navigation Architecture Rule

Every role sees only the sidebar sections its permissions unlock (Prompt 03/04). Sidebar structure:

```
[Dashboard/Home]  ← role-specific landing, different widgets per role
[Production]      ← hidden for pure-retail tenants
[Inventory]
[Sales/POS]        ← hidden for pure-textile tenants
[Finance]
[HR]
[Settings]         ← visible items vary drastically by role
```

Proceed to detail files `08` through `11` for per-page element breakdowns.
