-- Phase 6: Advanced Search & Filtering
-- Manual Migration SQL Script
-- Run this if automatic Prisma migration fails

-- ============================================
-- Table: search_logs
-- Purpose: Track all search queries for analytics
-- ============================================

CREATE TABLE IF NOT EXISTS "search_logs" (
    "id" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "userId" TEXT,
    "resultCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "search_logs_pkey" PRIMARY KEY ("id")
);

-- Indexes for search_logs
CREATE INDEX IF NOT EXISTS "search_logs_query_idx" ON "search_logs"("query");
CREATE INDEX IF NOT EXISTS "search_logs_userId_idx" ON "search_logs"("userId");
CREATE INDEX IF NOT EXISTS "search_logs_createdAt_idx" ON "search_logs"("createdAt");

-- ============================================
-- Table: saved_searches
-- Purpose: Store user's frequently used searches
-- ============================================

CREATE TABLE IF NOT EXISTS "saved_searches" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "query" TEXT,
    "filters" JSONB NOT NULL,
    "notifyOnNewResults" BOOLEAN NOT NULL DEFAULT false,
    "lastNotifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saved_searches_pkey" PRIMARY KEY ("id")
);

-- Indexes for saved_searches
CREATE INDEX IF NOT EXISTS "saved_searches_userId_idx" ON "saved_searches"("userId");
CREATE INDEX IF NOT EXISTS "saved_searches_createdAt_idx" ON "saved_searches"("createdAt");

-- ============================================
-- Verification Queries
-- ============================================

-- Verify tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('search_logs', 'saved_searches')
ORDER BY table_name;

-- Verify indexes were created
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename IN ('search_logs', 'saved_searches')
ORDER BY tablename, indexname;

-- Check table structure
\d search_logs
\d saved_searches

-- ============================================
-- Rollback Script (if needed)
-- ============================================

-- Uncomment and run these if you need to rollback the migration

-- DROP TABLE IF EXISTS "search_logs" CASCADE;
-- DROP TABLE IF EXISTS "saved_searches" CASCADE;

-- ============================================
-- Notes
-- ============================================

-- 1. This script is idempotent - safe to run multiple times
-- 2. Uses "IF NOT EXISTS" to prevent errors if tables already exist
-- 3. JSONB type is used for flexible filter storage
-- 4. All timestamps use TIMESTAMP(3) for millisecond precision
-- 5. Indexes are created for common query patterns
-- 6. TEXT type is used for IDs (UUID format from Prisma)

-- ============================================
-- Usage Instructions
-- ============================================

-- Option 1: Using psql command-line
-- psql -U agrimarket_user -d agrimarket_db -f manual-migration-phase6.sql

-- Option 2: Using Docker
-- docker exec -i $(docker ps -qf "name=postgres") psql -U agrimarket_user -d agrimarket_db < manual-migration-phase6.sql

-- Option 3: Using Adminer (via Docker Compose)
-- 1. Open http://localhost:8080
-- 2. Login with credentials from docker-compose.yml
-- 3. Go to SQL command tab
-- 4. Copy and paste this script
-- 5. Execute

-- ============================================
-- Testing After Migration
-- ============================================

-- Test insert into search_logs
INSERT INTO "search_logs" ("id", "query", "userId", "resultCount", "createdAt")
VALUES (gen_random_uuid(), 'test search', NULL, 5, NOW());

-- Test insert into saved_searches
INSERT INTO "saved_searches" ("id", "userId", "name", "query", "filters", "notifyOnNewResults", "createdAt", "updatedAt")
VALUES (
    gen_random_uuid(), 
    'test-user-id', 
    'Test Search', 
    'test', 
    '{"minPrice": 100}', 
    false, 
    NOW(), 
    NOW()
);

-- Verify inserts worked
SELECT * FROM "search_logs" WHERE "query" = 'test search';
SELECT * FROM "saved_searches" WHERE "name" = 'Test Search';

-- Clean up test data
DELETE FROM "search_logs" WHERE "query" = 'test search';
DELETE FROM "saved_searches" WHERE "name" = 'Test Search';

-- ============================================
-- End of Migration Script
-- ============================================
