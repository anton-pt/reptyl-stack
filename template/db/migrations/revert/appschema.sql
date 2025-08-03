-- Revert reptyl-stack:appschema from pg

BEGIN;

DROP SCHEMA reptyl_stack;

COMMIT;