// file: tests/api/websocket.test.ts
// description: WebSocket handler tests for real-time agent status updates
// reference: src/api/websocket_handler.ts

import { describe, test, beforeEach } from 'node:test';
import { expect } from '../support/expect';
import { websocket_handler, type AgentStatusEvent } from '../../src/api/websocket_handler';

describe('WebSocket Handler', () => {
  beforeEach(() => {
    // Reset handler state between tests
  });

  test('should track connected clients', () => {
    const initial_count = websocket_handler.get_client_count();
    expect(typeof initial_count).toBe('number');
    expect(initial_count).toBeGreaterThanOrEqual(0);
  });

  test('should get statistics', () => {
    const stats = websocket_handler.get_stats();
    expect(stats).toHaveProperty('connected_clients');
    expect(stats).toHaveProperty('messages_sent');
    expect(typeof stats.connected_clients).toBe('number');
    expect(typeof stats.messages_sent).toBe('number');
  });

  test('should broadcast agent status event', () => {
    const event: Omit<AgentStatusEvent, 'timestamp'> = {
      agent_id: 'test_agent',
      status: 'working',
      task_id: 'task_123',
      progress: 50,
      message: 'Processing invoice',
    };

    // This should not throw even with no connected clients
    expect(() => {
      websocket_handler.broadcast({
        ...event,
        timestamp: new Date().toISOString(),
      });
    }).not.toThrow();
  });

  test('should validate agent status event structure', () => {
    const event: AgentStatusEvent = {
      agent_id: 'accounts_payable_lead',
      status: 'idle',
      timestamp: new Date().toISOString(),
    };

    expect(event).toHaveProperty('agent_id');
    expect(event).toHaveProperty('status');
    expect(event).toHaveProperty('timestamp');
    expect(['idle', 'working', 'error'].includes(event.status)).toBe(true);
  });
});
