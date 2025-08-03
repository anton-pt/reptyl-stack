-- Verify reptyl-stack:appschema on pg

BEGIN;

SELECT pg_catalog.has_schema_privilege ('reptyl_stack', 'usage');

ROLLBACK;