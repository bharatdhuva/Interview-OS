/**
 * utils/tokenService.js
 *
 * Service for generating and validating one-time-use tokens
 * for email verification and password reset flows.
 *
 * These are different from JWT tokens — they're simple, time-limited,
 * and stored in the database tied to the user.
 */

const crypto = require('crypto');
const logger = require('./logger').default;

class TokenService {
  /**
   * Generate a random token for email verification or password reset
   * @returns {string} Random 32-character hex token
   */
  static generateToken() {
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * Create email verification token and store it in user document
   * @param {Object} user - Mongoose user document
   * @param {Date} expiresAt - Token expiration date (default: 24 hours from now)
   * @returns {string} The verification token
   */
  static async createEmailVerificationToken(user, expiresAt = null) {
    const token = this.generateToken();
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    user.emailVerification = {
      token: hashedToken,
      expiresAt: expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    };

    await user.save();
    logger.info(`Email verification token created for user ${user._id}`);
    return token; // Return plain token, not hashed
  }

  /**
   * Verify email verification token
   * @param {Object} user - Mongoose user document
   * @param {string} token - Plain token provided by user
   * @returns {boolean} true if valid, false if invalid/expired
   */
  static async verifyEmailToken(user, token) {
    if (!user.emailVerification || !user.emailVerification.token) {
      return false;
    }

    // Hash the provided token and compare with stored hash
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const isMatch = user.emailVerification.token === hashedToken;

    // Check expiration
    const isExpired = Date.now() > user.emailVerification.expiresAt;

    if (isMatch && !isExpired) {
      // Clear the token after successful verification
      user.emailVerification = undefined;
      user.isEmailVerified = true;
      await user.save();
      logger.info(`Email verified for user ${user._id}`);
      return true;
    }

    return false;
  }

  /**
   * Create password reset token
   * @param {Object} user - Mongoose user document
   * @param {Date} expiresAt - Token expiration date (default: 1 hour from now)
   * @returns {string} The reset token
   */
  static async createPasswordResetToken(user, expiresAt = null) {
    const token = this.generateToken();
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    user.passwordReset = {
      token: hashedToken,
      expiresAt: expiresAt || new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    };

    await user.save();
    logger.info(`Password reset token created for user ${user._id}`);
    return token; // Return plain token, not hashed
  }

  /**
   * Verify password reset token
   * @param {Object} user - Mongoose user document
   * @param {string} token - Plain token provided by user
   * @returns {boolean} true if valid, false if invalid/expired
   */
  static async verifyPasswordResetToken(user, token) {
    if (!user.passwordReset || !user.passwordReset.token) {
      return false;
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const isMatch = user.passwordReset.token === hashedToken;
    const isExpired = Date.now() > user.passwordReset.expiresAt;

    return isMatch && !isExpired;
  }

  /**
   * Clear password reset token
   * @param {Object} user - Mongoose user document
   */
  static async clearPasswordResetToken(user) {
    user.passwordReset = undefined;
    await user.save();
  }
}

module.exports = TokenService;
