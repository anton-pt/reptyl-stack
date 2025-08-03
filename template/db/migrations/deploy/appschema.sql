-- Deploy reptyl-stack:appschema to pg

BEGIN;

CREATE SCHEMA reptyl_stack;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

COMMIT;