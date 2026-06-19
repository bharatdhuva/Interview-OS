/**
 * utils/emailService.js
 *
 * Email sending service using Brevo API or Nodemailer fallback.
 * 
 * Handles all transactional emails for the platform:
 * - Email verification
 * - Password reset
 * - Interview scheduling
 * - Post-interview reports
 * - Subscription notifications
 * - And more (12 email types as per spec)
 */

const logger = require('./logger').default;
const nodemailer = require('nodemailer');
const axios = require('axios');

class EmailService {
  constructor() {
    this.transporter = null;
    this.provider = 'none';
    this.initTransporter();
  }

  /**
   * Initialize the email transporter.
   * Tries SendGrid first, falls back to Nodemailer (dev mode)
   */
  initTransporter() {
    const brevoApiKey = process.env.BREVO_API_KEY || process.env.SENDGRID_API_KEY;

    if (brevoApiKey && brevoApiKey.startsWith('xkeysib-')) {
      this.provider = 'brevo';
      logger.info('Email service initialized with Brevo API');
    } else {
      // Development: use Ethereal (test email service)
      // In production without Brevo, this will fail—intentionally
      if (process.env.NODE_ENV === 'production') {
        throw new Error('BREVO_API_KEY is required in production');
      }

      // For development: use Ethereal test emails
      nodemailer
        .createTestAccount()
        .then((testAccount) => {
          this.transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
              user: testAccount.user,
              pass: testAccount.pass,
            },
          });
          this.provider = 'ethereal';
          logger.info('Email service initialized with Ethereal (test mode)');
        })
        .catch((err) => {
          logger.error('Failed to initialize Ethereal test account', err);
        });
    }
  }

  /**
   * Send email verification email
   * @param {string} email - Recipient email
   * @param {string} verificationToken - One-time token for verification
   * @param {string} verificationUrl - Full verification link
   */
  async sendVerificationEmail(email, verificationToken, verificationUrl) {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: white; padding: 30px; border: 1px solid #e5e7eb; }
            .button { background: #6366f1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Verify Your InterviewOS Email</h1>
            </div>
            <div class="content">
              <p>Welcome to InterviewOS! 🚀</p>
              <p>We're excited to have you on board. Please verify your email address to activate your account and get started.</p>
              <a href="${verificationUrl}" class="button">Verify Email</a>
              <p style="color: #6b7280;">Or paste this link in your browser:</p>
              <p style="word-break: break-all; background: #f3f4f6; padding: 10px; border-radius: 4px; color: #4b5563;">
                ${verificationUrl}
              </p>
              <p style="color: #6b7280; font-size: 14px;">This link expires in 24 hours.</p>
            </div>
            <div class="footer">
              <p>©️ InterviewOS | The smarter way to conduct technical interviews.</p>
              <p><a href="https://interviewos.com/unsubscribe" style="color: #6366f1;">Unsubscribe</a></p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Verify your InterviewOS Email ✉️',
      html: htmlContent,
      text: `Verify your InterviewOS account: ${verificationUrl}`,
    });
  }

  /**
   * Send welcome email after email verification
   * @param {string} email - Recipient email
   * @param {string} name - User's name
   */
  async sendWelcomeEmail(email, name) {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: white; padding: 30px; border: 1px solid #e5e7eb; }
            .button { background: #6366f1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to InterviewOS! 🎉</h1>
            </div>
            <div class="content">
              <p>Hi ${name},</p>
              <p>Your email has been verified! Your account is now active. Get ready to conduct and participate in the smartest technical interviews.</p>
              
              <h3>Quick Start Guide</h3>
              <ul>
                <li>Complete your profile with a photo and background</li>
                <li>Create your first interview room (for interviewers)</li>
                <li>Check the question bank for latest DSA & system design questions</li>
                <li>Learn about our proctoring features & AI assistance</li>
              </ul>

              <a href="https://interviewos.com/dashboard" class="button">Go to Dashboard →</a>

              <p style="color: #6b7280; font-size: 14px;">Have questions? Check our <a href="https://interviewos.com/help" style="color: #6366f1;">help center</a> or email support@interviewos.io</p>
            </div>
            <div class="footer">
              <p>©️ InterviewOS | The smarter way to conduct technical interviews.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Welcome to InterviewOS! 🚀',
      html: htmlContent,
      text: `Welcome ${name}! Your account is verified. Visit https://interviewos.com/dashboard`,
    });
  }

  /**
   * Send password reset OTP email
   * @param {string} email - Recipient email
   * @param {string} otp - 6-digit numeric OTP code
   */
  async sendPasswordResetEmail(email, otp) {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: white; padding: 30px; border: 1px solid #e5e7eb; }
            .otp-container { background: #f0fdf4; border: 2px dashed #10b981; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; }
            .otp-code { font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #047857; margin: 0; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Reset Your Password</h1>
            </div>
            <div class="content">
              <p>We received a request to reset your InterviewOS password. Use the following 6-digit One-Time Password (OTP) to complete your request:</p>
              
              <div class="otp-container">
                <p class="otp-code">${otp}</p>
              </div>
              
              <p style="color: #dc2626; font-size: 14px; font-weight: 600;">⚠️ This code expires in 10 minutes for security reasons.</p>
              <p style="color: #6b7280; font-size: 13px;">If you didn't request a password reset, you can safely ignore this email.</p>
            </div>
            <div class="footer">
              <p>©️ InterviewOS | The smarter way to conduct technical interviews.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Reset your InterviewOS password — OTP Code 🔐',
      html: htmlContent,
      text: `Your InterviewOS password reset OTP is: ${otp}. This code expires in 10 minutes.`,
    });
  }

  /**
   * Send interview scheduled email (to both interviewer and candidate)
   * @param {string} email - Recipient email
   * @param {Object} data - Interview details { candidateName, interviewerName, roomLink, date, time }
   */
  async sendInterviewScheduledEmail(email, data) {
    const { candidateName, interviewerName, roomLink, date, time, role } = data;
    
    const roleText = role === 'interviewer' ? candidateName : interviewerName;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: white; padding: 30px; border: 1px solid #e5e7eb; }
            .button { background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
            .detail { background: #f0fdf4; padding: 15px; border-left: 4px solid #10b981; margin: 15px 0; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Interview Scheduled ✅</h1>
            </div>
            <div class="content">
              <p>${role === 'interviewer' ? `You have a scheduled interview with <strong>${candidateName}</strong>` : `You've been invited for a technical interview with <strong>${interviewerName}</strong>`}</p>
              
              <div class="detail">
                <p><strong>📅 Date:</strong> ${date}</p>
                <p><strong>⏱️ Time:</strong> ${time}</p>
                <p><strong>👤 With:</strong> ${roleText}</p>
              </div>

              <a href="${roomLink}" class="button">Join Interview Room →</a>

              <p style="color: #6b7280; font-size: 14px;">💡 ${role === 'candidate' ? 'Check our <a href="https://interviewos.com/prepare" style="color: #10b981;">interview prep guide</a> to get ready.' : 'Set up your room settings before the interview starts.'}</p>
            </div>
            <div class="footer">
              <p>©️ InterviewOS | The smarter way to conduct technical interviews.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: `Interview Scheduled — ${date} at ${time}`,
      html: htmlContent,
      text: `Interview scheduled: ${date} at ${time}. Join: ${roomLink}`,
    });
  }

  /**
   * Send password reset success email confirmation
   * @param {string} email - Recipient email
   * @param {string} name - User's name
   */
  async sendPasswordResetSuccessEmail(email, name) {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: white; padding: 30px; border: 1px solid #e5e7eb; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Changed Successfully 🔒</h1>
            </div>
            <div class="content">
              <p>Hi ${name},</p>
              <p>This is a confirmation that the password for your InterviewOS account (<strong>${email}</strong>) has been successfully changed.</p>
              <p>If you made this change, you don't need to take any action.</p>
              <p style="color: #dc2626; font-weight: 600;">⚠️ If you did not request this password change, please contact our support team immediately.</p>
            </div>
            <div class="footer">
              <p>©️ InterviewOS | The smarter way to conduct technical interviews.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: 'InterviewOS Password Changed Successfully 🔒',
      html: htmlContent,
      text: `Your InterviewOS password was successfully changed. If you did not make this change, please contact support immediately.`,
    });
  }

  /**
   * Generic email sender
   * @param {Object} options - Email options { to, subject, text, html }
   */
  async sendEmail(options) {
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@interviewos.io',
      ...options,
    };

    try {
      if (this.provider === 'brevo') {
        const apiKey = process.env.BREVO_API_KEY || process.env.SENDGRID_API_KEY;
        const senderEmail = process.env.FROM_EMAIL || 'noreply@interviewos.io';

        const response = await axios.post(
          'https://api.brevo.com/v3/smtp/email',
          {
            sender: { email: senderEmail, name: 'InterviewOS' },
            to: [{ email: options.to }],
            subject: options.subject,
            htmlContent: options.html,
            textContent: options.text,
          },
          {
            headers: {
              'api-key': apiKey,
              'Content-Type': 'application/json',
            },
            timeout: 15000,
          }
        );

        const messageId = response?.data?.messageId || 'brevo-api';
        logger.info(`Email sent via Brevo: ${options.to}`, { messageId });
        return { success: true, messageId };
      }

      if (!this.transporter) {
        throw new Error('Email transporter not initialized');
      }

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent: ${options.to}`, { messageId: info.messageId });
      return { success: true, messageId: info.messageId };
    } catch (error) {
      logger.error(`Failed to send email to ${options.to}`, error);
      throw error;
    }
  }
}

// Export singleton instance
module.exports = new EmailService();
