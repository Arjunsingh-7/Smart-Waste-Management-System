-- Migration: add wet/dry columns to dustbins for dual-compartment support
-- Run with your migration tooling (drizzle or sqlite) as appropriate

PRAGMA foreign_keys=off;
BEGIN TRANSACTION;

-- Add new columns with defaults
ALTER TABLE dustbins ADD COLUMN wet_level INTEGER NOT NULL DEFAULT 0;
ALTER TABLE dustbins ADD COLUMN dry_level INTEGER NOT NULL DEFAULT 0;
ALTER TABLE dustbins ADD COLUMN wet_status TEXT NOT NULL DEFAULT 'empty';
ALTER TABLE dustbins ADD COLUMN dry_status TEXT NOT NULL DEFAULT 'empty';

COMMIT;
PRAGMA foreign_keys=on;
