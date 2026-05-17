# ClawKeeper v1.5.0 Release Notes

ClawKeeper v1.5.0 is the repository maturity release that moves the project from an AI bookkeeping dashboard toward an **OpenClaw-native SMB finance agent platform**. The release focuses on backend agent infrastructure, deterministic safety policy, test coverage, repository quality gates, and documentation that accurately describes how the system should be operated.

> **Release theme:** ClawKeeper is now framed and implemented as an OpenClaw finance-agent application: a small-business financial operation run by agents, with policy gates around money movement, books-of-record changes, tenant boundaries, and auditability.

## What changed

| Area | v1.5.0 implementation |
|---|---|
| **OpenClaw application contract** | Added `src/openclaw/manifest.ts`, defining ClawKeeper’s OpenClaw-native app identity, finance agents, capabilities, runtime metadata, approval policy, and observability stream. |
| **Deterministic policy engine** | Added `src/openclaw/policy.ts`, evaluating tenant context, user role, capabilities, prompt-safety findings, amount boundaries, and approval metadata before execution. |
| **Runtime adapter** | Added `src/openclaw/runtime.ts`, giving the backend an explicit OpenClaw gateway adapter boundary while preserving the existing TypeScript runtime path. |
| **Agent execution guardrail** | Updated `src/agents/base.ts` so every agent task is policy-evaluated before work starts and audited with redacted metadata. |
| **Control-plane API** | Extended `src/api/routes/agents.ts` with OpenClaw manifest inspection and dry-run policy evaluation endpoints. |
| **Security model** | Added `docs/SECURITY_MODEL.md`, documenting the OpenClaw boundary, approval gates, prompt-injection handling, tenant isolation, and audit strategy. |
| **Testing** | Added focused tests for manifest integrity, runtime health, approval-required actions, tenant isolation denial, missing capability denial, prompt-injection denial, and redaction. |
| **Quality gates** | Updated scripts and CI so `npm run quality` performs TypeScript checking, ESLint, and tests; CI also runs `npm audit`. |
| **Repository narrative** | Rewrote `README.md` around the OpenClaw-native SMB finance-agent platform positioning. |

## Backend agent infrastructure

The core backend maturity improvement is the new `src/openclaw` module. It gives ClawKeeper an explicit control-plane layer instead of relying only on dashboard routes and agent classes. The manifest declares what ClawKeeper is, which finance agents exist, which capabilities they can request, what risk tier each capability belongs to, and when a human approval gate is mandatory.

The policy engine is intentionally deterministic. It does not delegate security decisions to a prompt or a model. It evaluates structured task context and returns one of three execution outcomes: **allowed**, **requires_approval**, or **denied**. High-risk finance capabilities such as payment processing, accounting-system writeback, tax workflows, and destructive actions cannot proceed without approval evidence.

## Security guardrails

ClawKeeper v1.5 adds guardrails at the agent execution boundary. This is the most important placement because it protects every agent, regardless of whether the request originates from the dashboard, an API client, or a future scheduler.

| Guardrail | Enforcement point |
|---|---|
| **Tenant isolation** | `evaluate_agent_policy` denies cross-tenant execution unless policy allows a platform context. |
| **Capability checks** | Requested capabilities must exist in the user/tenant context before execution. |
| **Approval gates** | High-risk capabilities and amount-threshold breaches require approval metadata. |
| **Prompt-injection denial** | Guardrail-bypass language is denied before the agent executes the task. |
| **Audit redaction** | Policy audit payloads redact email addresses, phone numbers, SSNs, credit-card-like values, and secret-like fields. |
| **BaseAgent integration** | `BaseAgent.execute_task` evaluates and audits policy decisions before invoking agent work. |

## Tests and quality gates

The release adds a focused TypeScript test suite under `test/` and Node-compatible commands so contributors can validate the backend without relying on dashboard behavior.

```bash
npm run typecheck
npm run lint
npm test
npm run quality
```

The local v1.5 quality gate completed with **0 errors** and **11 passing tests**. ESLint currently reports warnings for legacy unused symbols in the broader repository, but it does not block the gate. Those warnings are retained as visible cleanup opportunities rather than hidden.

| Test file | Coverage |
|---|---|
| `test/openclaw.manifest.test.ts` | Application identity, OpenClaw-native runtime metadata, finance agent registration, high-risk capability policy, and runtime adapter health. |
| `test/openclaw.policy.test.ts` | Autonomous low-risk reporting, approval-required finance actions, approved high-risk execution, tenant isolation denial, missing capability denial, prompt-injection denial, and audit redaction. |

## Operator-facing implications

ClawKeeper v1.5 should be described as an **OpenClaw-native financial operations control plane for SMBs**. The dashboard remains the operator interface, but the release makes clear that the product’s deeper value is the agent infrastructure: a finance department represented as agents, constrained by deterministic policy, observable through audit events, and prepared for human-in-the-loop approvals where risk requires it.

## Recommended follow-up milestones

| Milestone | Recommended focus |
|---|---|
| **v1.6 Approval Workbench** | Build the dashboard approval queue for high-risk policy decisions, including reviewer identity, comments, timestamps, and immutable evidence. |
| **v1.7 Integration Contract Tests** | Add mocked contract tests for Plaid, Stripe, QuickBooks, Xero, and document-processing clients. |
| **v1.8 Runtime Expansion** | Deepen OpenClaw gateway execution, tool sandboxing, distributed scheduling, execution replay, and trace inspection. |
| **v2.0 Finance Autopilot** | Deliver policy-backed end-to-end workflows for reconciliation, reporting, invoice approvals, and accounting-system writeback. |
