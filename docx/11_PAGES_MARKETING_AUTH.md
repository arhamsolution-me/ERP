# MEGA PROMPT 11 — PAGE DETAIL: MARKETING & AUTH PAGES
## NexERP — Element-Level UI Specification

**Role for AI Agent:** Build each page below exactly as specified. Marketing pages follow the SEO/SSG rules in Prompt 05; Auth pages follow the session/security rules in Prompt 03.

---

## 1. Homepage
| Element | Function |
|---|---|
| Hero section (headline, subheadline, CTA buttons) | "Book a Demo" primary CTA → Contact page; "See Pricing" secondary CTA |
| Industry toggle (Textile / Retail) | Switches hero visuals + copy to show relevant use case |
| Feature highlight cards (3-6) | Each links to Features Overview anchor section |
| Social proof strip | Client logos/testimonials (only real, named clients with permission) |
| Footer with sitemap links | Full navigation to all marketing pages + legal pages |

## 2. Pricing
| Element | Function |
|---|---|
| Plan comparison table | Tiers with feature checklists, user/branch limits |
| Billing toggle (Monthly/Annual) | Recalculates displayed prices with annual discount |
| "Start Trial" / "Book a Demo" CTAs per plan | Routes to signup-request or Contact form (no self-serve signup — invite-only per Prompt 03) |
| FAQ accordion | Common pricing/billing questions |

## 3. Industries — Textile / 4. Industries — Retail
| Element | Function |
|---|---|
| Use-case narrative sections | Problem → NexERP solution framing per industry |
| Relevant module callouts | Textile page highlights Production module; Retail page highlights POS module |
| Industry-specific CTA | "See it for Textile Mills" / "See it for Retail Chains" → Contact form pre-tagged |

## 5. Features Overview
| Element | Function |
|---|---|
| Module tabs (Production/Inventory/POS/Finance/HR/AI) | Each tab reveals feature list + screenshot for that module |
| "Try it" anchor CTAs | Route to Contact/demo booking |

## 6. Blog Index / 7. Blog Post
| Element | Function |
|---|---|
| Blog Index: post grid with category filter | Paginated, ISR-rendered |
| Blog Post: article body, author byline, publish date | Structured with JSON-LD `Article` schema (Prompt 05) |
| Related posts section | Bottom of article, same-category suggestions |
| Newsletter signup inline block | Email capture, non-blocking |

## 8. About / Company
| Element | Function |
|---|---|
| Company story section | Devnexes background, mission |
| Team section (optional) | Founder/team bios |

## 9. Contact / Book a Demo
| Element | Function |
|---|---|
| Form fields (Name, Business Name, Email, Phone, Industry dropdown, Message) | Validated client + server-side |
| "Submit" button | Sends to CRM/notification pipeline, shows success confirmation state |
| Calendar embed (optional) | Direct demo-slot booking widget |

---

## 10. Login
| Element | Function |
|---|---|
| Tenant identification | Auto-resolved from subdomain, or a "Find your workspace" link if user lands on root domain |
| **Google Login Button** | Primary SSO option managed via **Clerk.com** |
| Email/phone + password fields | Managed via Clerk.com if standard credentials are used |
| "Forgot Password" link | Handled via Clerk's native flow |
| "Login" button | Redirects to MFA Verification (Clerk) if enabled, else to role-appropriate dashboard landing |
| Error state | Handled securely by Clerk UI components |

## 11. MFA Verification
| Element | Function |
|---|---|
| 6-digit TOTP code input | Auto-advances/submits on 6th digit entered |
| "Resend" / "Use backup code" links | Fallback options |
| Countdown/expiry indicator | Shows code validity window |

## 12. Invite Accept / Set Password
| Element | Function |
|---|---|
| Invite details display (read-only) | Shows the role/branch they're being invited to, for context |
| New password field + strength meter | Enforces the 12-char + breach-check policy (Prompt 03) |
| Confirm password field | Must match |
| "Activate Account" button | Consumes the single-use invite token, creates active user |

## 13. Forgot Password / 14. Reset Password
| Element | Function |
|---|---|
| Email/phone input | Triggers reset link if account exists (same generic confirmation message regardless, to prevent enumeration) |
| Reset Password: new password + confirm fields | Token-validated, single-use link |
| "Reset Password" button | Invalidates all existing sessions for that user upon success (forces re-login everywhere) |

## 15. My Profile
| Element | Function |
|---|---|
| Personal info fields (name, phone, avatar) | Self-editable |
| "Change Password" section | Requires current password confirmation |
| MFA enrollment status + manage button | Enroll/disable/regenerate backup codes |
| Language/notification preference toggles | Personal-level overrides where tenant settings allow |

## 16. My Sessions & Devices
| Element | Function |
|---|---|
| Active sessions list (device, location/IP, last active) | Per Prompt 03's session model |
| "Revoke" button per session | Kills that specific session immediately |
| "Log out of all devices" button | Full session-family revocation |

---

## Suite Complete

Files `07`–`11` together specify all 97 pages across Marketing, Auth, Production, Inventory, POS/Sales, Finance, HR, Admin/Settings, and Platform Admin with full element-level detail — combined with `00`–`06` this is the complete NexERP build specification (11 files total).
