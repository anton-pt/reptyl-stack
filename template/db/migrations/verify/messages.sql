-- Verify reptyl-stack:messages on pg

BEGIN;

SELECT
    id,
    conversation_id,
    created_at,
    updated_at,
    content,
    order_number,
    role
FROM reptyl_stack.messages
WHERE
    FALSE;

SELECT 1 / COUNT(*)
FROM pg_constraint
WHERE
    conname = 'messages_conversation_id_fkey'
    AND conrelid = 'reptyl_stack.messages'::regclass
    AND confrelid = 'reptyl_stack.conversations'::regclass;

SELECT 1 / COUNT(*)
FROM pg_indexes
WHERE
    tablename = 'messages'
    AND indexname = 'idx_messages_conversation_id';

SELECT 1 / COUNT(*)
FROM pg_indexes
WHERE
    tablename = 'messages'
    AND indexname = 'idx_messages_order_number';

ROLLBACK;