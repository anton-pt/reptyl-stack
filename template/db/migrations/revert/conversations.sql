-- Revert reptyl-stack:conversations from pg

BEGIN;

DROP INDEX IF EXISTS reptyl_stack.idx_conversations_created_at;

DROP INDEX IF EXISTS reptyl_stack.idx_conversations_updated_at;

DROP TABLE IF EXISTS reptyl_stack.conversations;

COMMIT;