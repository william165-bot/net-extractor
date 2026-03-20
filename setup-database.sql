-- ─────────────────────────────────────────────────────────────────────────────
-- FCT CBT Database Setup for Neon Postgres
-- Run this SQL ONCE in your Neon dashboard SQL editor before deploying
-- ─────────────────────────────────────────────────────────────────────────────

-- Single key-value table that stores all app data as JSON
-- This keeps things simple while using the full power of Postgres
CREATE TABLE IF NOT EXISTS kv_store (
  store       TEXT NOT NULL,
  key         TEXT NOT NULL,
  data        TEXT NOT NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (store, key)
);

-- Index for fast prefix searches (used for listing users, keys, etc.)
CREATE INDEX IF NOT EXISTS idx_kv_store_prefix ON kv_store (store, key text_pattern_ops);

-- Done! Your database is ready.
-- Now set DATABASE_URL in Vercel environment variables and deploy.
