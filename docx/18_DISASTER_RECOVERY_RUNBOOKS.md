# MEGA PROMPT 18 — DETAILED DISASTER RECOVERY RUNBOOKS
## NexERP — Step-by-Step Incident Playbooks

**Role for AI Agent:** Prompt 06 (Section 9) established DR *targets* (RTO ≤ 1hr, RPO ≤ 5min) at a high level. This prompt builds the actual **executable runbooks** — the specific steps an on-call engineer follows during a real incident, with no ambiguity about what to do next. Every runbook must be tested in a quarterly game-day/tabletop exercise (Section 9) — an untested runbook is not a real runbook.

---

## 1. Incident Severity Classification (governs which runbook applies + response urgency)

| Severity | Definition | Examples | Response Target |
|---|---|---|---|
| **SEV-1** | Platform down for all/most tenants, or confirmed cross-tenant data exposure | Full region outage, DB primary unreachable, RLS bypass discovered | Page immediately, 24/7, all-hands |
| **SEV-2** | Single tenant or subset of tenants degraded/down; core feature broken platform-wide | One AZ down affecting a subset, POS sync broken platform-wide, payment gateway integration down | Page immediately, business-critical response |
| **SEV-3** | Degraded performance, non-critical feature broken, isolated bug | Slow dashboard loads, one report broken, minor UI bug | Ticketed, next business day |
| **SEV-4** | Cosmetic, no functional impact | Typo, misaligned button | Backlog |

Every runbook below assumes SEV-1/SEV-2 — these are the scenarios that justify a full DR runbook rather than standard bug-fix process.

---

## 2. Incident Command Structure (who does what during an active incident)

| Role | Responsibility |
|---|---|
| **Incident Commander (IC)** | Owns the incident end-to-end — coordinates responders, makes the call to execute a runbook, decides when to declare "resolved," runs the post-mortem. Not necessarily the most senior engineer — whoever is designated IC for that on-call rotation. |
| **Technical Lead** | Executes the actual runbook steps (DB restore, failover, etc.) |
| **Communications Lead** | Owns status page updates (Prompt 06/10 page 97) and tenant notifications — IC should never be doing status-page updates mid-firefight, that's a dedicated role |
| **Scribe** | Timestamps every action taken in a shared incident doc, in real time — this becomes the raw material for the post-mortem, and prevents "what did we actually do and when" confusion afterward |

- On-call rotation (PagerDuty/Opsgenie, per Prompt 06) always has a primary + secondary — secondary escalates automatically if primary doesn't acknowledge within a defined window (e.g., 5 minutes).
- A standing "who can be IC" list, not always the same person — prevents single-person bottleneck/burnout and ensures the runbooks are usable by more than one individual (a critical resilience property in itself).

---

## 3. RUNBOOK A — Database Primary Failure

**Trigger:** Health checks show Postgres primary unreachable; write requests failing platform-wide.

1. **Detect & Confirm (target: <2 min)** — On-call paged by automated alert (Prometheus rule on DB connection failures). Confirm it's not a transient network blip: attempt manual connection from a bastion host.
2. **Declare Incident** — IC declares SEV-1, opens incident channel/doc, pages Technical Lead + Communications Lead.
3. **Communications Lead** posts initial status page update within 5 minutes: "We are investigating an issue affecting platform availability" — vague but honest, avoid speculation before root cause is known.
4. **Technical Lead — Promote Read Replica:**
   - Confirm replica lag at time of primary failure (check last known replication lag metric) — this determines actual data-loss exposure (should be seconds given continuous WAL streaming, per Prompt 01's architecture).
   - Execute replica promotion (managed DB provider's promote-to-primary action, or manual `pg_ctl promote` if self-managed).
   - Update PgBouncer/connection string config to point at the newly-promoted primary — this is the step most likely to require a coordinated app-tier restart/config-reload, document the EXACT command/deployment action for your specific infra (Terraform apply, k8s ConfigMap update + rolling restart, etc.) here once infra is finalized.
5. **Verify:** Run a smoke-test suite against the promoted primary (basic read + write on a non-critical table) before declaring recovery.
6. **Communications Lead** updates status page: "Service restored, we are monitoring."
7. **Provision New Replica:** the promoted primary now has no replica — provision a fresh read replica immediately (system is running exposed/single-point-of-failure until this completes).
8. **Post-Incident:** Scribe's timeline feeds the post-mortem (Section 8). Calculate actual RPO/RTO achieved vs. the ≤5min/≤1hr targets — if missed, the post-mortem must identify why and what closes the gap.

---

## 4. RUNBOOK B — Accidental/Malicious Data Deletion

**Trigger:** A tenant reports missing data, or an internal alert flags an anomalous bulk-delete pattern in the audit log.

1. **Do NOT immediately restore from backup platform-wide** — this is a targeted problem, a platform-wide restore would roll back legitimate data for every other tenant. This is the single most common DR runbook mistake to avoid.
2. **Scope the damage:** query `audit_logs` (Prompt 02) filtered by the affected `tenant_id` and approximate time window to identify exactly which records were deleted, by whom (or by what — API key, automated job bug), and when.
3. **Determine deletion type:**
   - If soft-deleted (`deleted_at` populated, per Prompt 02's convention) — this is the easy case: simply clear `deleted_at` on the affected rows. No backup restore needed at all. **This is why soft-delete is mandatory platform convention** (Prompt 02) — it turns most "accidental deletion" incidents into a 5-minute fix instead of a DR event.
   - If hard-deleted (should be rare/impossible per platform convention, but account for it: a buggy migration, a direct DB access mistake) — proceed to point-in-time recovery, scoped narrowly.
4. **Scoped Point-in-Time Recovery (hard-delete case only):**
   - Restore a COPY of the database to a point in time just before the deletion (never restore over the live production database directly).
   - Extract only the specific affected tenant's specific affected records from the restored copy.
   - Manually/scripted re-insert those records into production, with a clear audit-log entry documenting the recovery action itself.
5. **Root cause the deletion mechanism** — if it was a bug (not malicious/user error), this becomes a SEV-1/2 code-fix priority in addition to the data-recovery action, since it could recur for other tenants before it's fixed.
6. **Tenant Notification:** Communications Lead informs the affected tenant's Owner directly (not just a public status page, since this may be tenant-specific) with a clear explanation and confirmation of what was recovered.

---

## 5. RUNBOOK C — Confirmed or Suspected Cross-Tenant Data Exposure

**Trigger:** A bug report, security research disclosure, or internal audit reveals that Tenant A's data was visible to Tenant B (an RLS bypass, a caching key collision, a logic bug in tenant-scoping middleware).

**This is always SEV-1, regardless of how small the exposure appears.**

1. **Immediate Containment:** if the exposure is actively ongoing (e.g., a live bug in a just-deployed release), roll back the deployment immediately — don't debug in production while the exposure is live.
2. **Scope the Blast Radius:** using `audit_logs` and request logs (Prompt 06's observability stack, correlated by `request_id`/`tenant_id`), determine:
   - Which tenant(s)' data was exposed
   - Which tenant(s) could have seen it
   - What specific data fields were involved (this matters enormously for notification obligations — PII/financial data exposure has different legal weight than, say, exposed product-name strings)
3. **Engage Legal/Compliance immediately** (ties to Prompt 14) — cross-tenant exposure very likely triggers breach-notification obligations under GDPR (UK clients), UAE data law, or other applicable regimes depending on which tenants/data were involved. Do NOT let engineering alone decide notification timing/language — this is a joint eng+legal decision, and Prompt 14's jurisdiction notes apply directly here.
4. **Fix the Root Cause:** patch the specific bypass (missing RLS policy, a query missing its `tenant_id` filter, a cache key collision) — write a regression test that would have caught it, per Prompt 03's "defense in depth" (3-layer tenant isolation) design intent: if this happened, identify which of the 3 layers failed and whether the other layers should have caught it but didn't.
5. **Notify Affected Tenants** — per legal guidance from step 3, but as a default engineering posture: proactive, clear, honest disclosure to affected tenant Owners, even for small-seeming exposures — trust, once lost on a multi-tenant data-isolation failure, is very difficult to rebuild for an ERP handling financial/production data.
6. **Post-Incident:** mandatory full post-mortem (Section 8), plus an update to the pentest scope (Prompt 03/17) to specifically probe for this class of bug going forward.

---

## 6. RUNBOOK D — Full Region/Availability-Zone Outage

**Trigger:** Cloud provider reports a regional/AZ outage; platform health checks show widespread failure not attributable to NexERP's own code/deploy.

1. **Confirm via provider status page** — distinguishes "our bug" from "their outage," which changes the response entirely (nothing to roll back, focus shifts to failover/wait).
2. **If single-AZ outage (multi-AZ deployment, per Prompt 01/06):** Kubernetes/load balancer should already be routing around the failed AZ automatically — confirm auto-recovery is working, no manual runbook action needed beyond monitoring. This is the entire point of the multi-AZ baseline architecture — verify it's actually working as designed, don't assume.
3. **If full-region outage (rare, but the reason DR planning exists):**
   - Confirm the cross-region read replica (Prompt 01, Section 3) is available and current.
   - Execute cross-region failover: promote the cross-region replica, redirect DNS/load-balancer traffic to the standby region's app-tier deployment (this assumes a warm-standby app-tier exists in the secondary region — if it doesn't yet, that's a gap to close BEFORE this runbook is ever needed for real, not discovered during the actual incident).
   - This is the highest-RTO scenario in the whole DR plan — communicate an honest, longer estimated recovery time on the status page rather than repeatedly promising imminent recovery and missing it.
4. **Post-Incident:** since this scenario is outside NexERP's direct control, the post-mortem focuses on "did our failover process work as designed" rather than root-causing the cloud provider's outage itself.

---

## 7. RUNBOOK E — Compromised Credentials / Security Breach

**Trigger:** Leaked API key detected (Prompt 17, Section 10's scanning), suspicious admin account activity, or an external security researcher report.

1. **Immediate Revocation:** revoke the specific compromised credential (API key, user session family, or platform admin account) instantly — this is a single-click action by design (Prompt 03/17), execute it first, investigate second.
2. **Scope Access:** review `audit_logs`/API request logs for everything that credential touched during the suspected compromise window.
3. **Assess Damage:** did the compromised access read data, write/modify data, or both? Financial-mutation and inventory-mutation actions (Prompt 04's idempotency-tracked endpoints) are the highest-priority to audit first, since they have real-world consequences (money, stock) beyond data confidentiality.
4. **Rotate Related Secrets:** if a platform-level secret was involved (not just a single tenant's API key) — e.g., a leaked database credential or signing key — rotate it platform-wide per Prompt 03, Section 5's rotation process, coordinated to avoid a self-inflicted outage during rotation.
5. **Notify:** the specific tenant if their key/account was the compromised credential; broader platform notification only if the compromise indicates a platform-level vulnerability affecting others.
6. **Post-Incident:** feed findings into the quarterly access-review process (Prompt 03, Section 8) and the pentest scope.

---

## 8. Post-Mortem Process (mandatory after every SEV-1/SEV-2)

- **Blameless by design** — the post-mortem document format explicitly frames every contributing factor as a system/process gap, never an individual's fault; punishing honest incident reporting guarantees future incidents get hidden or reported late, which is strictly worse for the platform.
- **Required sections:** timeline (from the Scribe's real-time log), root cause, what went well, what went poorly, action items (each with an owner and due date — an action item with no owner doesn't happen).
- **Published internally** (and to affected tenants in appropriately-scoped form for SEV-1s per Runbook C/E's notification steps) within 5 business days of resolution — timeliness matters, a post-mortem written a month later has already lost most of its value and urgency.
- **Action item tracking:** every post-mortem's action items get logged as tracked engineering tickets, reviewed at a monthly reliability review — a post-mortem whose action items are never actually completed is a wasted exercise; this closing-the-loop step is where most organizations' DR processes quietly fail.

---

## 9. Testing & Validation (a runbook nobody has practiced is not a real runbook)

- **Quarterly Game Day:** simulate one of the above scenarios in staging (never blindly in production) — actually execute Runbook A's replica-promotion steps, actually practice Runbook C's tenant-notification communication draft, with the real on-call rotation participating, not just a tabletop discussion.
- **Backup Restore Drill (monthly, per Prompt 06):** actually restore a backup to a scratch environment and verify data integrity — an untested backup is not a backup, only an assumption.
- **Runbook Currency Check:** every runbook in this document reviewed and updated whenever the underlying infrastructure changes (e.g., a database provider migration, a new region added) — a runbook referencing infrastructure that no longer exists is actively dangerous during a real incident (wastes precious minutes on wrong instructions).
- **New On-Call Engineer Onboarding:** every engineer joining the on-call rotation walks through each runbook at least once in a training/shadow capacity before their first solo on-call shift.

---

## 10. Deliverable Expectations for AI Agent

1. This document itself, kept in the repo (`/docs/RUNBOOKS.md` or equivalent) alongside the infrastructure code it references — versioned together, not in a separate wiki that drifts out of sync with actual infra.
2. Automated Prometheus/alerting rules (extends Prompt 06, Section 7) that map directly to the trigger conditions in each runbook (A–E) — an alert should name which runbook to open, not leave the on-call engineer guessing.
3. A pre-drafted status-page template library (per severity/scenario) for the Communications Lead role — drafting communication copy live during an active SEV-1 wastes precious minutes; having "region outage," "investigating," "resolved" templates ready to fill in and post saves real time.
4. Incident-channel bootstrap tooling (e.g., a ChatOps command that auto-creates the incident doc, pages the right people, and links the relevant runbook) so Section 2's Incident Command structure activates in seconds, not minutes, when a SEV-1 fires.
5. The quarterly Game Day schedule and post-mortem template, checked into the same docs location.

This prompt (`18`) extends the NexERP specification suite. Full suite is now `00`–`18`, 19 files total.
