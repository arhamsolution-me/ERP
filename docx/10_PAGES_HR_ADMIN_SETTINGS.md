# MEGA PROMPT 10 — PAGE DETAIL: HR, ADMIN/SETTINGS & PLATFORM ADMIN MODULES
## NexERP — Element-Level UI Specification

**Role for AI Agent:** Build each page below exactly as specified, element by element.

---

## 65. HR Dashboard
**Roles:** HR Manager, Owner

| Element | Function |
|---|---|
| Headcount stat card (by role type) | Factory workers vs retail staff vs management breakdown |
| Attendance rate today (%) | Live count of checked-in vs total scheduled |
| Pending leave requests count | Click → Leave Requests List (page 74) |
| Upcoming payroll run date | Countdown/reminder widget |

## 66. Employees List / 67. Employee Detail / Onboarding
| Element | Function |
|---|---|
| Role type filter (Factory/Retail/Management) | Standard filter |
| Search by name/employee code | Quick lookup |
| "Add Employee" button | Onboarding form: personal details, role type, pay type (piece-rate/fixed), base rate, branch assignment, biometric enrollment trigger |
| Employee Detail: pay type & rate fields | Editable by HR Manager only |
| Employee Detail: attendance summary tab | Recent check-in/out history for this employee |
| Employee Detail: "Deactivate" button | Soft-deactivates (terminates) with required effective date + reason |

## 68. Attendance Log (Biometric Feed) / 69. Attendance Manual Entry
| Element | Function |
|---|---|
| Live feed table (Employee, Check-in, Check-out, Source) | Auto-populated from biometric device integration |
| Source badge | Biometric / Manual / Mobile — visually distinguishes entry origin |
| Manual Entry form | Employee selector, date, check-in/out time pickers, required reason field (for correction transparency) |
| Discrepancy flag | Auto-flags entries missing a check-out after X hours for supervisor follow-up |

## 70. Shift Scheduling
**Roles:** Retail Manager, HR Manager

| Element | Function |
|---|---|
| Weekly calendar grid | Employees as rows, days as columns |
| Drag-to-assign shift blocks | Click-drag to assign a shift slot to an employee/day |
| Shift template dropdown | Predefined shift patterns (Morning/Evening/Full-day) for quick assignment |
| Conflict warning | Flags double-booking or exceeding max weekly hours |
| "Publish Schedule" button | Notifies all affected employees (SMS/app notification) |

## 71. Payroll Runs List / 72. Payroll Run Detail / Approval
| Element | Function |
|---|---|
| "New Payroll Run" button | Select period start/end, auto-calculates from attendance + pay_type rules |
| Payroll Run Detail: line-item table (Employee, Gross, Deductions, Net) | Editable deductions field per employee (Accountant/HR) before approval |
| "Approve" button | Locks the run, status → approved, required for payment processing |
| "Mark Paid" button | Records disbursement, links to Finance payment records |
| Export to bank-transfer-file button | Generates bulk disbursement file format for bank upload |

## 73. Payslip View
**Roles:** Employee (self, via portal), HR Manager

| Element | Function |
|---|---|
| Payslip breakdown | Gross, itemized deductions, net pay, period covered |
| Download PDF button | Generates formatted payslip document |

## 74. Leave Requests List / 75. Leave Request Detail / Approval
| Element | Function |
|---|---|
| Status filter (Pending/Approved/Rejected) | Standard filter tabs |
| New Request form (employee self-service) | Leave type dropdown, date range picker, reason field |
| Approval Detail: "Approve"/"Reject" buttons | Supervisor/HR action, required comment field on rejection |
| Leave balance display | Remaining leave days shown alongside request for context |

## 76. HR Reports
| Element | Function |
|---|---|
| Report type selector | Attendance summary / Payroll cost trend / Turnover rate |
| Date range + branch/mill filter | Standard filtering |
| Export button | CSV/Excel/PDF |

---

## 77. Settings Home
**Roles:** Owner, GM (view-limited)

| Element | Function |
|---|---|
| Settings category cards (Company, Branches, Users, Roles, Notifications, Integrations, Billing, Data, API) | Each links to its dedicated settings page |

## 78. Company Profile Settings
| Element | Function |
|---|---|
| Business name, logo upload, address fields | Editable core tenant info |
| Default currency/timezone/locale selectors | Drives formatting across the whole tenant (Prompt 05, Section 6) |
| Business type toggle (Textile/Retail/Hybrid) | Controls which sidebar modules are visible tenant-wide |

## 79. Branches Management
| Element | Function |
|---|---|
| Branch/mill list (name, type, address) | Maps to `warehouses` table entries flagged as operational locations |
| "Add Branch" button | Creates new location, auto-provisions a default warehouse record |
| Branch Detail: assigned staff list | Cross-reference to Employees filtered by branch |

## 80. Users List / 81. User Detail / Role Assignment
| Element | Function |
|---|---|
| Status filter (Active/Invited/Suspended) | Standard filter tabs |
| User Detail: role assignment multi-select | Assign one or more roles, each optionally scoped to a specific branch |
| "Suspend User" button | Immediately revokes all active sessions (Prompt 03) |
| "Reset MFA" button | Owner/Admin can force MFA re-enrollment if device lost |

## 82. Invite New User
| Element | Function |
|---|---|
| Email/phone input | Recipient contact |
| Role selector | Assign role(s) at invite time |
| Branch scope selector | Optional — limits role to specific branch |
| "Send Invite" button | Triggers invite email/SMS with secure token link |

## 83. Roles & Permissions Manager
**Roles:** Owner only

| Element | Function |
|---|---|
| System roles list (read-only badges) | The 11 default roles, cannot be deleted |
| Custom role creation | "New Role" button → name + permission checklist grouped by module |
| Permission matrix view | Grid of roles × permission codes, checkbox toggles per cell |
| "Save Changes" button | Applies immediately — active sessions re-check permissions within 60s (Prompt 03) |

## 84. Audit Log Viewer
**Roles:** Owner, Accountant (finance-scoped), Platform Admin

| Element | Function |
|---|---|
| Filter by user/entity type/date range | Narrows the immutable audit trail |
| Log row (Action, Entity, User, Before/After diff, IP) | Click expands to show full before/after JSON diff |
| Export button | For compliance/audit purposes |

## 85. Notification Settings
| Element | Function |
|---|---|
| Channel toggles (Email/SMS/In-app/WhatsApp) | Per notification-category on/off switches |
| Alert threshold inputs | E.g., low-stock alert sensitivity, wastage % threshold |

## 86. Integrations
| Element | Function |
|---|---|
| Payment gateway cards (JazzCash/Easypaisa) | "Connect" button opens credential entry, status badge shows Connected/Error |
| FBR integration card | Tax authority API credential setup, test-connection button |
| Biometric device card | Device pairing/IP configuration for attendance hardware |

## 87. Subscription & Billing
| Element | Function |
|---|---|
| Current plan display | Plan name, user/branch limits, renewal date |
| Usage bars | Current usage vs plan limits (users, branches, storage) |
| "Upgrade Plan" button | → plan comparison + payment flow |
| Invoice history | Past subscription invoices, downloadable |

## 88. Data Export / Backup Settings
| Element | Function |
|---|---|
| "Request Full Data Export" button | Queues an async job producing a downloadable archive of tenant's data |
| Scheduled backup status | Shows last automated backup timestamp (informational, ops-managed) |

## 89. API Keys & Webhooks
**Roles:** Owner (technical integrations)

| Element | Function |
|---|---|
| API key list | Masked keys, "Generate New Key" button, revoke action per key |
| Webhook endpoints list | URL, subscribed events (checkboxes), test-ping button, delivery-log link |

---

## 90–97. Platform Admin Pages (Devnexes-only, separate auth realm)

## 90. Platform Dashboard
| Element | Function |
|---|---|
| Total tenants / active users stat cards | Platform-wide aggregates |
| MRR (Monthly Recurring Revenue) chart | Subscription revenue trend |
| System health summary widget | Links to System Health Console (page 97) |

## 91. Tenants List / 92. Tenant Detail / 93. New Tenant Onboarding
| Element | Function |
|---|---|
| Tenant list (Name, Plan, Status, Users, Created) | Searchable/filterable |
| Tenant Detail: usage metrics tab | API calls, storage, active users vs plan limits |
| Tenant Detail: "Suspend Tenant" button | Emergency access revocation (billing failure, ToS violation) |
| New Tenant Onboarding wizard | Business info → plan selection → initial Owner invite → subdomain provisioning |

## 94. Subscription Plans Management
| Element | Function |
|---|---|
| Plans table | Name, price, limits, feature flags |
| "Edit Plan" | Adjust pricing/limits, versioned (existing subscribers unaffected until renewal) |

## 95. Platform Usage Analytics
| Element | Function |
|---|---|
| Cross-tenant usage charts | API request volume, storage growth, feature adoption rates |
| Cost-per-tenant estimate table | Infra cost attribution (Prompt 06, Section 8) |

## 96. Platform Audit Log
| Element | Function |
|---|---|
| Platform-admin action log | Separate from tenant audit logs — tracks Devnexes staff actions on tenant accounts |

## 97. System Health / Incident Console
| Element | Function |
|---|---|
| Service status grid | API/Worker/AI-service/DB/Redis health indicators, pulled from Prometheus |
| Active incidents list | Linked to on-call/alerting system (Prompt 06, Section 7) |
| Status page publish control | Push updates to the public status page during incidents |

---

## Suite Complete — Full Page Specification

Files `07` through `10` together specify all 97 pages of NexERP with element-level detail. Combined with the architecture/database/security/routes/frontend/devops mega-prompts (`01`–`06`), this is the complete build specification.
