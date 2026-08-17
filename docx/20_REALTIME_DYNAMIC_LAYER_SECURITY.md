# MEGA PROMPT 20 — REAL-TIME / DYNAMIC DATA LAYER & ITS SECURITY
## NexERP — Live Updates, WebSocket Architecture, and Securing Every Dynamic Call

**Role for AI Agent:** Every prior prompt assumed request/response HTTP for most interactions. This prompt defines everywhere the platform needs **live, dynamic, push-based data** instead of the user manually refreshing — and, critically, how every one of those real-time channels is secured with the same rigor as the REST API (Prompt 03/04), since a WebSocket connection is just as much an attack surface as an HTTP endpoint, often more overlooked.

---

## 1. Where Dynamic/Real-Time Behavior Is Actually Needed (don't over-build — be deliberate)

| Feature | Why It Needs to Be Live, Not Poll-on-Refresh |
|---|---|
| Machine status grid (Prompt 08, page 26/27) | Mill Manager walking the floor needs current status without manual refresh |
| Stage Tracker Kanban (Prompt 08, page 21) | Multiple supervisors may update batches simultaneously — everyone's board must reflect reality live |
| POS Sync Status / Offline Queue Monitor (Prompt 09, page 54) | Store Supervisor needs to see sync conflicts the moment they occur, not on next page load |
| Low-Stock Alerts (Prompt 08, page 40) + Notification Center (Prompt 12, Section 8) | An alert firing at 2am should be visible the instant a manager opens the app, and ideally push-notified |
| Stock Levels (Prompt 08, page 36) during active transfers | Two branches transferring stock need to see quantities update without a race-condition-inducing stale view |
| Sales Dashboard (Prompt 09, page 52) during business hours | Owner watching live sales roll in — a genuinely valuable "live number ticking up" UX moment |
| Audit Log Viewer (Prompt 10, page 84) for active investigation | Security/compliance review during an active incident (Prompt 18) benefits from live tailing |
| System Health Console (Prompt 10, page 97) | Platform Admin monitoring during an incident needs live, not 30-seconds-stale, health data |
| QC Inspection AI Scan (Prompt 08, page 29) | The "Run AI Scan" result should stream back progressively (uploading → analyzing → result) rather than a single long blocking wait |

**Deliberately NOT real-time** (standard request/response is correct and simpler): Finance reports, HR/Payroll pages, Settings pages, all Marketing pages, most historical/list views — real-time infrastructure adds genuine complexity and attack surface, so it's reserved for pages where staleness has a real cost, per the table above, not applied blanket-wide out of technical enthusiasm.

---

## 2. Transport Architecture

- **WebSocket gateway** (a dedicated service, e.g., built on Socket.IO or a raw `ws` + Redis pub/sub pattern) sitting alongside the core API from Prompt 01 — NOT bolted directly into the stateless API pods, since WebSocket connections are inherently stateful (a connected client) and need their own scaling/connection-affinity handling distinct from the request/response API tier.
- **Redis Pub/Sub as the fan-out backbone:** when any API mutation happens that other connected clients care about (e.g., a batch stage advances), the API publishes an event to a Redis channel; the WebSocket gateway pods (which can be horizontally scaled independently, per Prompt 01's autoscaling principles) subscribe and push to their connected clients — this decouples "something happened" from "who needs to know," and lets the WebSocket tier scale independently of the API tier.
- **Fallback to polling:** for clients/networks where WebSocket connections are unreliable (some corporate/factory networks block persistent connections), implement automatic fallback to short-interval polling (e.g., every 5-10s) using the same underlying event data — the feature must degrade gracefully to "slightly less live" rather than break entirely, consistent with Prompt 19's graceful-degradation principle.
- **Channel/room model:** every real-time subscription is scoped to a specific "room" (e.g., `tenant:{id}:mill:{millId}:machines`, `tenant:{id}:pos:{branchId}:sync-status`) — a client only ever subscribes to rooms it's authorized for (Section 4), never a global firehose.

---

## 3. Authentication for Dynamic Connections

- **WebSocket connections authenticate using the same short-lived access token (JWT) as the REST API** (Prompt 03) — passed during the initial connection handshake (as a query param over TLS, or preferably in a connection-initiation message rather than a persistently-logged URL query string), never a separate/weaker auth mechanism just because it's "just a live feed."
- **Token expiry mid-connection:** since WebSocket connections are long-lived but access tokens expire in 15 minutes (Prompt 03), the connection must re-authenticate (silently, using the refresh flow) before the token expires — an expired-token connection is forcibly disconnected, requiring the client to reconnect with a fresh token, rather than allowing a connection to persist indefinitely past its token's validity (that would create a real security gap: a revoked/suspended user could otherwise keep receiving live data through an already-open socket forever).
- **Session revocation propagates to live connections:** when a session is revoked (Prompt 03 — "log out all devices," account suspension, Prompt 18's Runbook E credential compromise response), the WebSocket gateway must actively terminate any open connection tied to that session, not just block future reconnection attempts — check revocation status on a short interval (e.g., every 60s) against the same Redis-cached session-validity check the REST API uses, so a "log out everywhere" action from Prompt 10's My Sessions page (page 16) genuinely kills a live dashboard feed within a bounded window, not just future logins.

---

## 4. Authorization for Dynamic Channels (same RBAC rigor as Prompt 03/04, applied to rooms not routes)

- Every room subscription request is checked against the connecting user's permissions and branch-scope, identically to how Prompt 04's routes declare required permission codes — e.g., a Cashier can subscribe to their OWN branch's POS sync-status room, never another branch's, and never a Finance or HR room regardless of what room name they might guess/construct client-side.
- **Server-side room authorization, never client-trusted:** the client never decides which room it's "supposed" to see — it requests a subscription, and the gateway independently verifies against current DB/cache-backed permission state before allowing it, exactly mirroring the REST API's server-side permission re-verification principle (Prompt 03, Section 3) rather than trusting a role claim embedded in the connection token alone.
- **Tenant isolation at the transport layer:** room names are always prefixed `tenant:{tenant_id}:...` and the gateway enforces that a connection's authenticated tenant context matches the room's tenant prefix before allowing subscription — this is the real-time-layer equivalent of Prompt 02's three-layer tenant isolation (app/DB/cache), extended to be a FOURTH enforced layer specifically for the live-data transport, since a bug here would be a cross-tenant data leak exactly as serious as the ones covered in Prompt 18's Runbook C.

---

## 5. Rate Limiting & Abuse Prevention for Dynamic Connections

- **Connection-level limits:** max concurrent WebSocket connections per user (e.g., 5 — covers multiple tabs/devices legitimately, blocks connection-flooding abuse) and per tenant (scaled to their subscription plan, mirroring Prompt 17's API rate-limit tiering philosophy).
- **Message-rate limits:** even authenticated, authorized connections are rate-limited on how many subscription/action messages they can send per second — prevents a buggy or malicious client from hammering the gateway with rapid subscribe/unsubscribe cycles or excessive client-originated events.
- **Payload size limits:** every message (both directions) has a maximum size — prevents a malformed or malicious oversized payload from being used as a resource-exhaustion vector against the gateway.
- **Idle connection cleanup:** connections with no activity/heartbeat beyond a timeout window are proactively closed — prevents slow accumulation of zombie connections consuming gateway memory (ties directly to Prompt 19, Section 5's resource-leak-prevention principle, applied specifically to this stateful service).

---

## 6. Data Integrity on Dynamic Channels

- **Real-time is a notification, not a source of truth:** a WebSocket push tells the client "something changed, here's the new state" — but the client's UI logic must be built so that if a push is missed (brief disconnect, gateway restart), the client reconciles via a normal authenticated REST fetch on reconnect, never assuming the live feed alone is a complete/reliable record. This directly matters for financial/inventory-affecting UI (Stock Levels, Sales Dashboard) — a missed WebSocket event must never leave a manager's screen silently showing stale/wrong stock or revenue numbers with no correction mechanism.
- **No write-path via WebSocket for critical mutations:** consistent with Prompt 17's Section 8 boundary decisions — POS transactions, financial mutations, and inventory adjustments are ALWAYS submitted via the authenticated, idempotency-key-protected REST API (Prompt 04), never as a WebSocket-originated write, even though the connection is authenticated — this keeps the audit trail, idempotency guarantees, and RLS enforcement all flowing through the one hardened write path rather than duplicating that rigor (and its risk of drifting out of sync) into a second write mechanism. WebSocket connections are strictly read/subscribe channels for this platform; the one exception (QC AI Scan streaming, Section 1's table) streams PROGRESS of an action that was itself initiated via REST, not the mutation itself.
- **Ordering guarantees:** events within a single room are delivered in the order they were published (Redis pub/sub preserves per-channel ordering) — critical for something like the Stage Tracker, where an "advance to dyeing" event arriving before an earlier "advance to weaving" event (due to network reordering) would render an incorrect board state; sequence numbers included in each event payload so the client can detect and request a re-sync if it ever observes an out-of-order delivery.

---

## 7. Observability for the Dynamic Layer

- Extends Prompt 06/19's observability stack: connection count, subscription count per room-type, message throughput, and reconnection rate are all monitored metrics specific to the WebSocket gateway — a spike in reconnection rate is itself an early-warning signal (network issue, or a bug causing forced disconnects) worth alerting on before it becomes a user-visible complaint.
- Every WebSocket connection and subscription event logged with the same `request_id`/`tenant_id`/`user_id` correlation fields as REST requests (Prompt 06, Section 7) — so a security investigation (Prompt 18's runbooks) can trace exactly which live-data rooms a specific compromised session was subscribed to, not just which REST endpoints it called.

---

## 8. Deployment & Scaling Specifics for the Gateway Tier

- The WebSocket gateway is its own deployable unit in Kubernetes (extends Prompt 01's component list), with its own HPA rules based on active-connection-count (a more meaningful scaling signal for this tier than CPU alone, since a WebSocket gateway can be connection-bound before it's CPU-bound).
- **Sticky sessions / connection affinity** required at the load balancer for WebSocket traffic (a client's persistent connection must keep routing to the same gateway pod for its lifetime) — this is a meaningfully different load-balancing configuration than the stateless REST API tier's round-robin approach, and must be explicitly configured, not assumed to "just work" the same way.
- **Graceful pod shutdown:** when a gateway pod is being terminated (deploy, scale-down, node drain), it must signal connected clients to reconnect (to a different pod) BEFORE the connection is forcibly dropped — prevents every rolling deploy from being a mini-outage for every live-connected user, directly supporting Prompt 06's zero-downtime-deploy principle for this specific stateful tier.

---

## 9. Deliverable Expectations for AI Agent

1. WebSocket gateway service scaffold (Socket.IO or equivalent) with the Redis pub/sub fan-out pattern from Section 2.
2. Auth middleware for the WebSocket handshake reusing the same JWT verification logic as the REST API (Prompt 03) — not a reimplementation, a shared library.
3. Room-authorization middleware enforcing Section 4's tenant/RBAC/branch-scope rules on every subscription request.
4. Rate-limiting and idle-connection-cleanup implementation per Section 5.
5. Client-side reconnection + reconciliation logic (Section 6) as a shared hook/utility (e.g., a `useRealtimeChannel` React hook) so every page listed in Section 1's table implements the same reliable pattern rather than each engineer reinventing "what happens on disconnect" per feature.
6. Kubernetes deployment config for the gateway tier with sticky-session load balancing and graceful-shutdown handling (Section 8).
7. A `REALTIME_SECURITY_CHECKLIST.md` mirroring the REST API's security checklist (Prompt 03) but specific to WebSocket/dynamic-channel concerns — used as a review gate before any new real-time feature (beyond the initial set in Section 1) is added.

This prompt (`20`) extends the NexERP specification suite. Full suite is now `00`–`20`, 21 files total.
