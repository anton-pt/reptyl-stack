-- Deploy reptyl-stack:conversations to pg
-- requires: appschema

BEGIN;

CREATE TABLE reptyl_stack.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    title TEXT NOT NULL
);

CREATE INDEX idx_conversations_created_at ON reptyl_stack.conversations (created_at);

CREATE INDEX idx_conversations_updated_at ON reptyl_stack.conversations (updated_at);

COMMIT;