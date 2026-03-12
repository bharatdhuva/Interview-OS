/**
 * middleware/validation/auth.validation.ts
 *
 * Zod schemas for authentication request bodies.
 *
 * These schemas are used inside the auth controller via `schema.parse(req.body)`.
 * A Zod parse failure throws a ZodError, which the controller catches and
 * converts to a 400 Bad Request response.
 */

import { z } from 'zod';

/** Schema for POST /api/v1/auth/register */
export const registerSchema = z.object({
  name:     z.string().min(2).max(100),
  email:    z.string().email(),
  password: z.string().min(6),
  // Optional — defaults to 'candidate' in the controller if omitted
  role:     z.enum(['candidate', 'interviewer', 'admin']).optional(),
});

/** Schema for POST /api/v1/auth/login */
export const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1), // at least 1 char so we get a useful message
});

/** Schema for POST /api/v1/auth/google */
export const googleAuthSchema = z.object({
  token: z.string(),            // Google OAuth2 access token
  role:  z.enum(['candidate', 'interviewer', 'admin']).optional(),
});
