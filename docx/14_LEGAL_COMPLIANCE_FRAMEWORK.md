# MEGA PROMPT 14 — LEGAL & COMPLIANCE FRAMEWORK
## NexERP — Terms of Service, Privacy, SLA & Regulatory Compliance

**Role for AI Agent:** You are acting as a technical compliance advisor working alongside legal counsel — this prompt defines what the ENGINEERING team must build to support legal compliance, plus the structure of the legal documents themselves. **The actual legal documents (ToS, Privacy Policy) must be reviewed and finalized by a licensed lawyer before publishing** — this prompt produces first-draft structure and the technical implementation checklist, not a substitute for legal review.

---

## 1. Governing Documents Required (structure only — lawyer must finalize language)

| Document | Purpose | Where Linked |
|---|---|---|
| Terms of Service (ToS) | Contract between Devnexes and tenant businesses | Footer of marketing site, checkbox at Tenant Onboarding (Prompt 10, page 93) |
| Privacy Policy | How personal data (employee PII, biometric data, customer data) is collected/used/protected | Footer, Invite Accept page, Employee onboarding form |
| Data Processing Agreement (DPA) | Required for enterprise/international clients — defines Devnexes as data processor, tenant as data controller | Sent during enterprise sales/onboarding, not a self-serve web page |
| Service Level Agreement (SLA) | Uptime commitment, support response times, remedies for breach | Attached to paid subscription plans (Prompt 10, page 87) |
| Acceptable Use Policy | Prohibited uses of the platform | Linked from ToS |
| Sub-processor List | Third parties who touch tenant data (hosting provider, payment gateway, SMS provider) | Public page, updated when sub-processors change |

### ToS — Required Sections (draft structure)
1. Definitions (Tenant, User, Content, Subscription)
2. Account & Invite-Only Access terms
3. Subscription, Billing, Renewal, Cancellation
4. Acceptable Use & Prohibited Conduct
5. Data Ownership (tenant owns their business data; Devnexes owns the platform)
6. Intellectual Property
7. Limitation of Liability
8. Termination (by either party, data export window post-termination)
9. Governing Law & Jurisdiction (Pakistan law for local clients; specify separately for UAE/UK/US clients per Devnexes' actual contracting entity)
10. Dispute Resolution

### Privacy Policy — Required Sections (draft structure)
1. What data is collected (account info, employee PII, biometric templates, customer data, usage/analytics data)
2. Legal basis for processing (contract necessity, legitimate interest, consent where applicable)
3. How data is used (service delivery, not sold to third parties — state explicitly)
4. Data retention periods (tie directly to Section 4 below)
5. Data subject rights (access, correction, deletion/erasure, portability)
6. International data transfers (if hosting infra is outside the client's country — disclose)
7. Security measures (high-level, reference Prompt 03 without exposing exploitable detail)
8. Cookie policy (marketing site analytics/tracking disclosure)
9. Contact for privacy inquiries (dedicated email, e.g., privacy@devnexes.site)

---

## 2. Technical Implementation Checklist (Engineering must build these — not optional)

### Consent & Disclosure
- [ ] ToS + Privacy Policy checkbox (unchecked by default, cannot be pre-ticked) at Tenant Onboarding (Prompt 10, page 93) — timestamp + version number of the accepted document stored against the tenant record.
- [ ] Biometric data collection (Prompt 10, Employee Onboarding page 67) requires a separate, explicit consent checkbox from the employee/HR — biometric data is treated as sensitive/special-category data requiring distinct consent from general ToS acceptance.
- [ ] Version tracking: every time ToS/Privacy Policy text changes materially, tenants must be prompted to re-accept on next login (banner, non-blocking for 14 days, then blocking) — store `accepted_version` + `accepted_at` per tenant/user.

### Data Subject Rights (build as actual product features, not just policy promises)
- [ ] **Right to access:** the "Request Full Data Export" feature (Prompt 10, page 88) satisfies data-portability requests — must produce a complete, human-readable export of an individual's data on request, not just bulk business data.
- [ ] **Right to erasure:** a documented hard-delete job (Prompt 03, Section 6) for terminated employee biometric/PII data after the legally required retention window — build the scheduled job, don't leave it as a manual DBA task.
- [ ] **Right to correction:** standard edit capability on Employee Detail, Customer Detail, User Profile pages already satisfies this — verify no PII field is read-only without a correction path.
- [ ] Data Subject Request intake: a simple internal ticket/workflow (can be a lightweight admin page or routed to support email initially) for individuals to request access/correction/erasure, with a tracked response-time SLA (commonly 30 days under most privacy regimes — confirm exact number with legal counsel per jurisdiction).

### Data Retention Enforcement
- [ ] Define retention periods per data category in a config table (`data_retention_policies: category, retention_days, action ENUM('archive','delete')`), enforced by scheduled jobs (Prompt 06) — don't hardcode retention logic scattered across modules.
- [ ] Audit logs: define retention (commonly 1-7 years depending on financial record requirements in the client's jurisdiction) — after which they move to cold storage archive (Prompt 02, Section 12), not indefinite hot-table growth.
- [ ] Terminated employee biometric templates: shortest reasonable retention post-termination, per Section 1's Privacy Policy commitment — this is the most sensitive data category in the system and needs the most conservative retention.

### Data Residency & Cross-Border Transfer
- [ ] Document which cloud region hosts each tenant's data (Prompt 06's infra) — for international clients (UAE/UK/US), confirm whether their jurisdiction requires in-country or regional data residency, and whether the current single-region architecture (Prompt 01, Section 3) needs a regional deployment for that client tier before onboarding them.
- [ ] Sub-processor list (Section 1) must be kept in sync with actual infra vendors (cloud host, payment gateways, SMS/WhatsApp provider, biometric device vendor if cloud-connected) — flag this as a living document requiring a review step whenever a new third-party service is integrated (ties to Prompt 10, page 86 Integrations).

### Security Compliance Alignment
- [ ] Cross-reference every control in Prompt 03 (Security/Auth) against whichever compliance framework the sales team is targeting for enterprise deals (commonly SOC 2 Type II for international B2B SaaS) — encryption at rest/transit, access logging, MFA, incident response runbook (Prompt 06, Section 9) are all SOC 2-relevant controls already specified; this is a mapping exercise, not new engineering work, but must be documented as a formal control matrix for auditors.
- [ ] Payment data: never store raw card numbers — payment gateway integrations (JazzCash/Easypaisa/card processors) must be tokenized, PCI-DSS scope minimized by never letting card data touch NexERP's own servers.

---

## 3. Service Level Agreement (SLA) — Technical Commitments

These figures must be derived from what Prompt 06's infrastructure can actually deliver — do not publish an SLA target the architecture hasn't been load-tested to meet.

| Metric | Suggested Target (validate against Prompt 06 load tests before publishing) |
|---|---|
| Platform uptime | 99.9% monthly (≈43 min downtime/month) for paid tiers |
| Scheduled maintenance windows | Announced 72 hours in advance, outside client's stated business hours where known |
| Critical support response (Sev-1: platform down) | 1 hour, 24/7 for enterprise tier |
| Standard support response (Sev-2/3) | Business hours next-day for standard tier, 4-hour for enterprise |
| Data backup frequency / recovery | Matches Prompt 06 Section 9: RPO ≤ 5 min, RTO ≤ 1 hour |
| Uptime credit remedy | Define a service-credit schedule (e.g., 10% monthly fee credit per 0.1% below target) — a legal/commercial decision, not engineering's to set unilaterally |

- [ ] Build the public Status Page (Prompt 06, Section 7 / Prompt 10, page 97) as the source of truth for uptime SLA reporting — historical uptime percentage must be auto-calculated from real incident data, not manually asserted.

---

## 4. Terms Acceptance & Legal Document Delivery (Product Requirements)

| Element | Function |
|---|---|
| Footer links (marketing site, all pages) | ToS, Privacy Policy, Cookie Policy — always accessible, never buried |
| Onboarding consent checkbox (Prompt 10, page 93) | Links to current version of ToS/Privacy Policy in a new tab; submission blocked until checked |
| "Legal" section in Settings (extend Prompt 10, page 77) | Tenant Owner can view accepted document versions + dates, download PDF copies |
| Cookie consent banner (marketing site only, not authenticated app) | Standard accept/reject/manage-preferences pattern if analytics/marketing cookies are used |

---

## 5. Jurisdiction-Specific Notes for Devnexes' Target Markets

Since Devnexes targets Pakistan (local) plus UAE, UK, and USA (international):
- **Pakistan:** align with the Personal Data Protection Bill framework as it stands (confirm current status with legal counsel — Pakistani data protection legislation has been evolving) and standard Pakistani commercial contract law for the ToS.
- **UAE:** UAE's data protection law (Federal Decree-Law No. 45 of 2021) has specific requirements if serving UAE-based tenants — data residency and consent requirements differ from Pakistan.
- **UK:** UK GDPR applies if handling UK residents' personal data — stricter consent, breach-notification (72-hour), and data subject rights timelines than may be assumed by default.
- **USA:** varies by state (e.g., CCPA/CPRA if California-based clients) — no single federal standard, so the client's specific state matters.

**This section is informational context for engineering awareness only — every jurisdiction-specific claim above must be verified with actual legal counsel licensed in that jurisdiction before Devnexes represents compliance to a client.** Do not present this document, or any AI-generated legal analysis, as a substitute for professional legal advice.

---

## 6. Deliverable Expectations for AI Agent

1. Draft ToS and Privacy Policy documents following the section structures in Section 1 (clearly marked "DRAFT — PENDING LEGAL REVIEW" in the document itself and anywhere it's referenced in code/comments).
2. The `data_retention_policies` table and its enforcement worker job.
3. Version-tracking implementation for consent acceptance (ToS/Privacy Policy versioning + re-consent flow).
4. A `COMPLIANCE_CONTROL_MATRIX.md` mapping each Prompt 03 security control to the compliance framework(s) it satisfies, for use in enterprise sales/audits.
5. Sub-processor list page, kept as a living document tied to actual third-party integrations.

This prompt (`14`) extends the NexERP specification suite. Combined with `13` (Purchase/Vendor Management), the full suite is now `00`–`14`, 15 files total.
