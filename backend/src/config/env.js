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
const dotenvSafe = require("dotenv-safe");

// Validate required env keys against .env.example on startup, without crashing
// production boots if optional service/AI keys are omitted from platform env vars.
try {
  dotenvSafe.config({ allowEmptyValues: true, example: ".env.example" });
} catch (err) {
  const coreKeys = ["MONGODB_URI", "JWT_ACCESS_SECRET", "JWT_REFRESH_SECRET"];
  const missingCore = coreKeys.filter((key) => !process.env[key]);
  if (missingCore.length > 0) {
    throw err;
  }
  console.warn(
    `[env] Optional environment keys from .env.example are not set: ${err.missing ? err.missing.join(", ") : err.message}`
  );
}
