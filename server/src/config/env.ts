/**
 * config/env.ts
 *
 * Environment variable loader.
 *
 * Uses `dotenv-safe` which reads .env and validates that every key listed
 * in .env.example is present (empty values are allowed via allowEmptyValues).
 *
 * ⚠️  This module MUST be imported as the very first statement in server.ts
 *     before any other module referencing process.env is loaded.
 */

import dotenv from 'dotenv-safe';

// Validate required env keys against .env.example on startup
dotenv.config({ allowEmptyValues: true, example: '.env.example' });
