# ClawKeeper v1.5 Implementation Scope

ClawKeeper v1.5 should mature the repository in four practical layers: an OpenClaw-native agent control plane, deterministic financial safety policy, executable tests, and release-grade documentation. This scope deliberately avoids a large rewrite. It strengthens the existing TypeScript backend and makes Python optional rather than central.

| Layer | v1.5 Deliverable | Acceptance Standard |
|---|---|---|
| OpenClaw agent infrastructure | Add an `openclaw` agent manifest, runtime adapter types, and a control-plane module that describes how ClawKeeper agents run under OpenClaw. | The repo can explain and validate which agents, capabilities, approvals, and financial tools are allowed before execution. |
| Agent security guardrails | Add deterministic task-policy evaluation for tenant isolation, prompt injection, PII handling, financial risk, approval requirements, and capability allowlists. | Tests prove high-risk finance actions require approval and unsafe commands are rejected before agent execution. |
| Backend maturity | Wire policy evaluation into agent execution and orchestration routes without breaking existing dashboard flows. | Existing APIs still compile while agent commands return structured policy decisions and audit metadata. |
| Testing and quality | Add Vitest-based unit tests for policy, guardrails, runtime manifest, and route-safe helpers; wire scripts for typecheck/test. | `pnpm test` and `pnpm typecheck` become meaningful release gates for v1.5. |
| README and release docs | Rewrite README as a polished OpenClaw-native SMB finance agent platform and add security/release notes. | The main page matches the repo’s ambition without claiming unsupported production payment execution. |

The primary code change should be a new policy/control-plane layer rather than more canned worker handlers. ClawKeeper can credibly position itself as “an SMB finance department operated by OpenClaw agents” when every agent run has a manifest, capability boundary, approval policy, audit envelope, and tests.
