// file: tests/support/expect.ts
// description: Minimal Jest/Bun-style expect helper for Node's built-in test runner
// reference: tests/**/*.test.ts

import assert from 'node:assert/strict';

type PromiseLikeValue = Promise<unknown>;
type Constructor = new (...args: unknown[]) => unknown;

function buildAssertions(actual: unknown, negated = false) {
  const check = (condition: boolean, message: string): void => {
    if (negated) {
      assert.ok(!condition, `Expected negated assertion to pass: ${message}`);
      return;
    }
    assert.ok(condition, message);
  };

  const assertions = {
    get not() {
      return buildAssertions(actual, !negated);
    },
    toBe(expected: unknown): void {
      if (negated) assert.notEqual(actual, expected);
      else assert.equal(actual, expected);
    },
    toEqual(expected: unknown): void {
      if (negated) assert.notDeepEqual(actual, expected);
      else assert.deepEqual(actual, expected);
    },
    toContain(expected: unknown): void {
      if (typeof actual === 'string') {
        check(actual.includes(String(expected)), `Expected ${actual} to contain ${String(expected)}`);
        return;
      }
      check(Array.isArray(actual) && actual.includes(expected), 'Expected array to contain value');
    },
    toBeDefined(): void {
      check(actual !== undefined, 'Expected value to be defined');
    },
    toBeGreaterThan(expected: number): void {
      check(Number(actual) > expected, `Expected ${String(actual)} to be greater than ${expected}`);
    },
    toBeGreaterThanOrEqual(expected: number): void {
      check(Number(actual) >= expected, `Expected ${String(actual)} to be greater than or equal to ${expected}`);
    },
    toBeLessThan(expected: number): void {
      check(Number(actual) < expected, `Expected ${String(actual)} to be less than ${expected}`);
    },
    toBeLessThanOrEqual(expected: number): void {
      check(Number(actual) <= expected, `Expected ${String(actual)} to be less than or equal to ${expected}`);
    },
    toBeInstanceOf(expected: Constructor): void {
      check(actual instanceof expected, 'Expected value to be instance of constructor');
    },
    toHaveLength(expected: number): void {
      const length = (actual as { length?: unknown })?.length;
      check(length === expected, `Expected length ${String(length)} to equal ${expected}`);
    },
    toHaveProperty(property: string): void {
      check(actual !== null && typeof actual === 'object' && property in actual, `Expected object to have property ${property}`);
    },
    toThrow(expected?: RegExp | string): void {
      assert.equal(typeof actual, 'function');
      if (negated) assert.doesNotThrow(actual as () => unknown);
      else assert.throws(actual as () => unknown, expected as RegExp | undefined);
    },
    resolves: {
      async toEqual(expected: unknown): Promise<void> {
        const value = await (actual as PromiseLikeValue);
        if (negated) assert.notDeepEqual(value, expected);
        else assert.deepEqual(value, expected);
      },
    },
    rejects: {
      async toThrow(expected?: RegExp | string): Promise<void> {
        if (negated) await assert.doesNotReject(actual as PromiseLikeValue);
        else await assert.rejects(actual as PromiseLikeValue, expected as RegExp | undefined);
      },
    },
  };

  return assertions;
}

export function expect(actual: unknown) {
  return buildAssertions(actual);
}
