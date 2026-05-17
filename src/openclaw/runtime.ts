// file: src/openclaw/runtime.ts
// description: Runtime adapter for running ClawKeeper finance agents through an OpenClaw control plane boundary

import type { LedgerCapability, LedgerTaskStar } from '../core/types';
import type { TenantContext, TaskResult } from '../agents/base';
import { CLAWKEEPER_OPENCLAW_MANIFEST, get_openclaw_agent_definition } from './manifest';
import { evaluate_agent_policy, assert_agent_policy_allows } from './policy';

export interface OpenClawRuntimeHealth {
  status: 'ready' | 'degraded';
  gateway_url_configured: boolean;
  manifest_version: string;
  registered_agents: number;
  trust_model: string;
}

export interface OpenClawRunnableAgent {
  get_id(): string;
  get_capabilities(): LedgerCapability[];
  execute_task(task: LedgerTaskStar, tenant_context: TenantContext): Promise<TaskResult>;
}

export class OpenClawRuntimeAdapter {
  constructor(private readonly gateway_url: string | undefined = process.env.OPENCLAW_GATEWAY_URL) {}

  health(): OpenClawRuntimeHealth {
    return {
      status: this.gateway_url ? 'ready' : 'degraded',
      gateway_url_configured: Boolean(this.gateway_url),
      manifest_version: CLAWKEEPER_OPENCLAW_MANIFEST.version,
      registered_agents: CLAWKEEPER_OPENCLAW_MANIFEST.agents.length,
      trust_model: CLAWKEEPER_OPENCLAW_MANIFEST.runtime.trust_model,
    };
  }

  describe_agent(agent_id: string) {
    return get_openclaw_agent_definition(agent_id);
  }

  async run(agent: OpenClawRunnableAgent, task: LedgerTaskStar, tenant_context: TenantContext): Promise<TaskResult> {
    const decision = evaluate_agent_policy({
      task,
      tenant_context,
      agent_capabilities: agent.get_capabilities(),
      approval_id: typeof task.parameters?.approval_id === 'string' ? task.parameters.approval_id : null,
      request_id: typeof task.parameters?.request_id === 'string' ? task.parameters.request_id : null,
    });

    assert_agent_policy_allows(decision);
    return agent.execute_task(task, tenant_context);
  }
}

export const openclaw_runtime_adapter = new OpenClawRuntimeAdapter();
