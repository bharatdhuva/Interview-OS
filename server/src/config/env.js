"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_safe_1 = __importDefault(require("dotenv-safe"));
// Validate required env keys against .env.example on startup
dotenv_safe_1.default.config({ allowEmptyValues: true, example: '.env.example' });
