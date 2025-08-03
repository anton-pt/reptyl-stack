-- Verify reptyl-stack:conversations on pg

BEGIN;

SELECT id, created_at, updated_at, title
FROM reptyl_stack.conversations
WHERE
    FALSE;

SELECT 1 / COUNT(*)
FROM pg_indexes
WHERE
    tablename = 'conversations'
    AND indexname = 'idx_conversations_created_at';

SELECT 1 / COUNT(*)
FROM pg_indexes
WHERE
    tablename = 'conversations'
    AND indexname = 'idx_conversations_updated_at';

ROLLBACK;