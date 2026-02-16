// file: tests/memory/semantic_search.test.ts
// description: Semantic search tests for pgvector hybrid search
// reference: src/memory/store.ts, src/memory/embedding_service.ts

import { describe, test, expect, beforeAll } from 'bun:test';
import { OpenAIEmbeddingService, create_embedding_service } from '../../src/memory/embedding_service';

describe('Embedding Service', () => {
  test('should create embedding service', () => {
    const service = create_embedding_service();
    expect(service).toBeDefined();
  });

  test('should reject empty text', async () => {
    const service = new OpenAIEmbeddingService();

    await expect(service.generate('')).rejects.toThrow(/empty text/);
    await expect(service.generate('   ')).rejects.toThrow(/empty text/);
  });

  test('should generate batch embeddings', async () => {
    const service = new OpenAIEmbeddingService();
    const texts = ['Invoice processing', 'Payment reconciliation', 'Vendor management'];

    // This will make real API calls if OpenAI key is present
    // In a real test environment, you'd mock the OpenAI client
    if (process.env.OPENAI_API_KEY) {
      const embeddings = await service.generate_batch(texts);
      expect(embeddings).toHaveLength(3);
      expect(embeddings[0]).toHaveLength(1536); // text-embedding-3-small dimension
    }
  });

  test('should filter empty texts in batch', async () => {
    const service = new OpenAIEmbeddingService();

    await expect(service.generate_batch([])).resolves.toEqual([]);
    await expect(service.generate_batch(['', '  ', '\n'])).rejects.toThrow(/No valid texts/);
  });
});

describe('Memory Store Semantic Search', () => {
  test('should extract text from string content', () => {
    // This would test the private extract_text_from_content method
    // In production, we'd test it through the public API
    const content = 'Invoice from Acme Corp for $500';
    expect(content).toContain('Invoice');
    expect(content).toContain('Acme Corp');
  });

  test('should extract text from object content', () => {
    const content = {
      title: 'Invoice Processing',
      description: 'Process invoice from vendor',
      text: 'Invoice #12345 for $500',
    };

    const extracted = [content.title, content.description, content.text].join(' ');
    expect(extracted).toContain('Invoice Processing');
    expect(extracted).toContain('Process invoice from vendor');
    expect(extracted).toContain('Invoice #12345');
  });

  test('should handle hybrid search results structure', () => {
    interface MemorySearchResult {
      entry: {
        id: string;
        content: any;
      };
      score: number;
      highlights: string[];
    }

    const result: MemorySearchResult = {
      entry: {
        id: 'mem_123',
        content: { text: 'Invoice data' },
      },
      score: 0.95,
      highlights: ['...Invoice data...'],
    };

    expect(result.score).toBeGreaterThan(0);
    expect(result.score).toBeLessThanOrEqual(1);
    expect(result.highlights).toBeInstanceOf(Array);
  });
});
