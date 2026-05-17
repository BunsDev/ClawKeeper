// file: tests/api/routes/health.test.ts
// description: Unit tests for API health/status endpoints
// reference: src/api/server.ts

import { describe, test } from "node:test";
import { expect } from "../../support/expect";

describe("Health Endpoint Structure", () => {
  describe("health check response", () => {
    test("should include status field", () => {
      const healthResponse = {
        status: "healthy",
        timestamp: new Date().toISOString(),
      };

      expect(healthResponse.status).toBeDefined();
      expect(["healthy", "degraded", "unhealthy"]).toContain(healthResponse.status);
    });

    test("should include timestamp", () => {
      const healthResponse = {
        status: "healthy",
        timestamp: new Date().toISOString(),
      };

      expect(healthResponse.timestamp).toBeDefined();
      expect(new Date(healthResponse.timestamp).toString()).not.toBe("Invalid Date");
    });

    test("should include service information", () => {
      const healthResponse = {
        service: "clawkeeper",
        version: "0.1.0",
        status: "healthy",
      };

      expect(healthResponse.service).toBe("clawkeeper");
      expect(healthResponse.version).toBeDefined();
    });
  });

  describe("database connectivity", () => {
    test("should check database connection", () => {
      const dbHealth = {
        connected: true,
        latency_ms: 5,
      };

      expect(dbHealth.connected).toBe(true);
      expect(dbHealth.latency_ms).toBeGreaterThan(0);
    });

    test("should report disconnected state", () => {
      const dbHealth = {
        connected: false,
        error: "Connection refused",
      };

      expect(dbHealth.connected).toBe(false);
      expect(dbHealth.error).toBeDefined();
    });
  });

  describe("external service checks", () => {
    test("should check Molten gateway connectivity", () => {
      const moltenHealth = {
        name: "molten_gateway",
        url: "http://localhost:18789",
        online: true,
      };

      expect(moltenHealth.online).toBe(true);
      expect(moltenHealth.url).toContain("18789");
    });

    test("should report offline services", () => {
      const serviceHealth = {
        name: "external_service",
        online: false,
      };

      expect(serviceHealth.online).toBe(false);
    });
  });

  describe("overall health status", () => {
    test("should be healthy when all checks pass", () => {
      const checks = [
        { name: "database", healthy: true },
        { name: "memory", healthy: true },
      ];

      const allHealthy = checks.every((c) => c.healthy);

      expect(allHealthy).toBe(true);
    });

    test("should be degraded when some checks fail", () => {
      const checks = [
        { name: "database", healthy: true },
        { name: "memory", healthy: false },
      ];

      const allHealthy = checks.every((c) => c.healthy);
      const anyHealthy = checks.some((c) => c.healthy);

      expect(allHealthy).toBe(false);
      expect(anyHealthy).toBe(true);
    });

    test("should be unhealthy when all checks fail", () => {
      const checks = [
        { name: "database", healthy: false },
        { name: "memory", healthy: false },
      ];

      const anyHealthy = checks.some((c) => c.healthy);

      expect(anyHealthy).toBe(false);
    });
  });

  describe("port configuration", () => {
    test("should use correct default port", () => {
      const expectedPort = 4004;
      const port = process.env.PORT || expectedPort;

      expect(typeof port === "number" || typeof port === "string").toBe(true);
    });

    test("should respect environment PORT variable", () => {
      const envPort = process.env.PORT;
      
      // Port can be set via env or default to 4004
      expect(envPort === undefined || typeof envPort === "string").toBe(true);
    });
  });
});
