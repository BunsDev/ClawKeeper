// file: src/api/routes/admin.ts
// description: Admin and integration status routes (Molten sync, etc.)
// reference: src/integrations/molten_bridge.ts

import { Hono } from 'hono';
import { MOLTEN_SYNC_ENABLED } from '../../integrations/molten_bridge';
import type { AppEnv } from '../../types/hono';

export function admin_routes() {
  const app = new Hono<AppEnv>();

  app.get('/molten-sync', (c) => {
    return c.json({ enabled: MOLTEN_SYNC_ENABLED });
  });

  return app;
}
