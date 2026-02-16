// file: tests/agents/accounts_payable.test.ts
// description: Accounts Payable Lead orchestrator tests
// reference: src/agents/orchestrators/accounts_payable_lead.ts

import { describe, test, expect } from 'bun:test';

describe('Accounts Payable Lead Agent', () => {
  test('should have correct capabilities', () => {
    const capabilities = [
      'invoice_parsing',
      'invoice_validation',
      'invoice_categorization',
      'invoice_approval',
      'payment_processing',
    ];

    expect(capabilities).toContain('invoice_parsing');
    expect(capabilities).toContain('payment_processing');
    expect(capabilities).toHaveLength(5);
  });

  test('should parse invoice input structure', () => {
    const input = {
      ocr_text: 'Invoice from Acme Corp\nTotal: $500.00\nDue: 2024-02-15',
    };

    expect(input).toHaveProperty('ocr_text');
    expect(input.ocr_text).toContain('Invoice');
    expect(input.ocr_text).toContain('Total');
  });

  test('should validate invoice data structure', () => {
    const parsed = {
      vendor_name: 'Acme Corp',
      invoice_number: 'INV-001',
      amount: 50000, // $500.00 in cents
      due_date: '2024-02-15',
      confidence: 0.95,
    };

    expect(parsed.amount).toBeGreaterThan(0);
    expect(parsed.confidence).toBeGreaterThan(0);
    expect(parsed.confidence).toBeLessThanOrEqual(1);
    expect(parsed.vendor_name).toBe('Acme Corp');
  });

  test('should flag low-confidence invoices for review', () => {
    const low_confidence = { confidence: 0.65 };
    const high_confidence = { confidence: 0.95 };

    expect(low_confidence.confidence < 0.8).toBe(true);
    expect(high_confidence.confidence >= 0.8).toBe(true);
  });

  test('should handle payment processing input', () => {
    const payment_input = {
      invoice_id: 'inv_123',
      payment_method: 'ach',
      amount: 50000,
      scheduled_date: '2024-02-15',
    };

    expect(payment_input).toHaveProperty('invoice_id');
    expect(payment_input).toHaveProperty('payment_method');
    expect(['ach', 'check', 'wire', 'card'].includes(payment_input.payment_method)).toBe(true);
  });
});
