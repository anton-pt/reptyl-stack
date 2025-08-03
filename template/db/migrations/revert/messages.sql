-- Revert reptyl-stack:messages from pg

BEGIN;

DROP INDEX IF EXISTS reptyl_stack.idx_messages_conversation_id;

DROP INDEX IF EXISTS reptyl_stack.idx_messages_order_number;

DROP TABLE IF EXISTS reptyl_stack.messages;

COMMIT;