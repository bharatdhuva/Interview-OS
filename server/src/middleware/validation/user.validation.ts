/**
 * middleware/validation/user.validation.ts
 *
 * Zod schemas for user profile and password update request bodies.
 */

import { z } from 'zod';

/** Schema for PATCH /api/v1/users/profile */
export const updateProfileSchema = z.object({
  name:   z.string().min(2).max(50).optional(),
  avatar: z.string().url().optional(), // must be a valid URL (e.g. CDN link)
});

/** Schema for PATCH /api/v1/users/password */
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(8), // verified against the stored hash
  newPassword:     z.string().min(8), // will be hashed before persisting
});
