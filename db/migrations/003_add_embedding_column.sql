-- file: db/migrations/003_add_embedding_column.sql
-- description: Add pgvector embedding column to memories table for semantic search
-- reference: db/schema.sql, pgvector extension

-- Ensure pgvector extension is installed
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column (1536 dimensions for OpenAI text-embedding-3-small)
ALTER TABLE memories
ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- Create index for cosine similarity search
CREATE INDEX IF NOT EXISTS memories_embedding_idx
ON memories
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Add comment
COMMENT ON COLUMN memories.embedding IS 'Vector embedding for semantic search (1536-dim, text-embedding-3-small)';

-- Migration complete
-- To rollback: DROP INDEX IF EXISTS memories_embedding_idx; ALTER TABLE memories DROP COLUMN IF EXISTS embedding;
