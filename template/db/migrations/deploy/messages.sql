-- Deploy reptyl-stack:messages to pg
-- requires: conversations

BEGIN;

CREATE TABLE reptyl_stack.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    conversation_id UUID NOT NULL REFERENCES reptyl_stack.conversations (id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    content TEXT NOT NULL,
    order_number INTEGER NOT NULL,
    role TEXT NOT NULL CHECK (
        role IN ('user', 'assistant', 'system')
    )
);

CREATE INDEX idx_messages_conversation_id ON reptyl_stack.messages (conversation_id);

CREATE INDEX idx_messages_order_number ON reptyl_stack.messages (order_number);

COMMIT;