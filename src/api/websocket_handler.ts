// file: src/api/websocket_handler.ts
// description: WebSocket handler for real-time agent status updates
// reference: src/api/server.ts, Bun WebSocket API

import type { ServerWebSocket } from 'bun';

export interface AgentStatusEvent {
  agent_id: string;
  status: 'idle' | 'working' | 'error';
  task_id?: string;
  progress?: number;
  message?: string;
  timestamp: string;
}

interface WebSocketData {
  tenant_id?: string;
  user_id?: string;
  connected_at: string;
}

class WebSocketHandler {
  private clients: Set<ServerWebSocket<WebSocketData>> = new Set();
  private message_count = 0;

  /**
   * Handle new WebSocket connection
   */
  open(ws: ServerWebSocket<WebSocketData>): void {
    this.clients.add(ws);
    const count = this.clients.size;
    
    console.log(`[WebSocket] Client connected (total: ${count})`);
    
    // Send welcome message
    ws.send(JSON.stringify({
      type: 'connected',
      message: 'Connected to ClawKeeper agent status stream',
      timestamp: new Date().toISOString(),
    }));
  }

  /**
   * Handle incoming WebSocket message
   */
  message(ws: ServerWebSocket<WebSocketData>, message: string | Buffer): void {
    try {
      const data = typeof message === 'string' ? JSON.parse(message) : JSON.parse(message.toString());
      
      // Handle ping/pong for connection keepalive
      if (data.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
        return;
      }

      // Handle subscription to specific agents (future enhancement)
      if (data.type === 'subscribe' && data.agent_ids) {
        ws.send(JSON.stringify({
          type: 'subscribed',
          agent_ids: data.agent_ids,
          timestamp: new Date().toISOString(),
        }));
        return;
      }

      console.log('[WebSocket] Received message:', data);
    } catch (err) {
      console.error('[WebSocket] Failed to parse message:', err);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Invalid message format',
        timestamp: new Date().toISOString(),
      }));
    }
  }

  /**
   * Handle WebSocket close
   */
  close(ws: ServerWebSocket<WebSocketData>): void {
    this.clients.delete(ws);
    console.log(`[WebSocket] Client disconnected (remaining: ${this.clients.size})`);
  }

  /**
   * Handle WebSocket error
   */
  error(ws: ServerWebSocket<WebSocketData>, error: Error): void {
    console.error('[WebSocket] Error:', error);
    this.clients.delete(ws);
  }

  /**
   * Broadcast agent status event to all connected clients
   */
  broadcast(event: AgentStatusEvent): void {
    const message = JSON.stringify({
      type: 'agent_status',
      ...event,
    });

    this.message_count++;
    let sent = 0;
    
    for (const client of this.clients) {
      try {
        client.send(message);
        sent++;
      } catch (err) {
        console.error('[WebSocket] Failed to send to client:', err);
        this.clients.delete(client);
      }
    }

    if (sent > 0) {
      console.log(`[WebSocket] Broadcast to ${sent} clients: ${event.agent_id} → ${event.status}`);
    }
  }

  /**
   * Send event to specific client (by tenant filtering in future)
   */
  send_to_client(ws: ServerWebSocket<WebSocketData>, event: AgentStatusEvent): void {
    try {
      ws.send(JSON.stringify({
        type: 'agent_status',
        ...event,
      }));
    } catch (err) {
      console.error('[WebSocket] Failed to send to client:', err);
      this.clients.delete(ws);
    }
  }

  /**
   * Get count of connected clients
   */
  get_client_count(): number {
    return this.clients.size;
  }

  /**
   * Get statistics
   */
  get_stats() {
    return {
      connected_clients: this.clients.size,
      messages_sent: this.message_count,
    };
  }
}

// Singleton instance
export const websocket_handler = new WebSocketHandler();

/**
 * Helper to emit agent status updates from anywhere in the application
 */
export function emit_agent_status(event: Omit<AgentStatusEvent, 'timestamp'>): void {
  websocket_handler.broadcast({
    ...event,
    timestamp: new Date().toISOString(),
  });
}
