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
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
          <style>
            body {
              background-color: #fafafa;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              margin: 0;
              padding: 40px 20px;
              -webkit-font-smoothing: antialiased;
            }
            .wrapper {
              background-color: #ffffff;
              border: 1px solid #e4e4e7;
              border-radius: 8px;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
              margin: 0 auto;
              max-width: 500px;
              padding: 32px;
            }
            .brand {
              color: #18181b;
              font-size: 16px;
              font-weight: 700;
              letter-spacing: -0.02em;
              margin-bottom: 24px;
            }
            h1 {
              color: #18181b;
              font-size: 20px;
              font-weight: 600;
              line-height: 1.3;
              margin: 0 0 16px 0;
            }
            p {
              color: #3f3f46;
              font-size: 14px;
              line-height: 1.6;
              margin: 0 0 20px 0;
            }
            .btn-container {
              margin: 28px 0;
            }
            .btn {
              background-color: #0d631b;
              border-radius: 6px;
              color: #ffffff !important;
              display: inline-block;
              font-size: 14px;
              font-weight: 500;
              padding: 10px 20px;
              text-decoration: none;
            }
            .link-text {
              background-color: #f4f4f5;
              border-radius: 4px;
              color: #71717a;
              font-family: monospace;
              font-size: 12px;
              margin-top: 16px;
              padding: 12px;
              word-break: break-all;
            }
            .footer {
              border-top: 1px solid #f4f4f5;
              color: #a1a1aa;
              font-size: 12px;
              line-height: 1.5;
              margin-top: 32px;
              padding-top: 16px;
            }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <div class="brand">InterviewOS</div>
            <h1>Verify your email address</h1>
            <p>Thank you for signing up for InterviewOS. To get started, please confirm your email address by clicking the button below.</p>
            <div class="btn-container">
              <a href="${verificationUrl}" class="btn">Verify Email</a>
            </div>
            <p style="color: #71717a; font-size: 13px;">Or copy and paste this URL into your browser:</p>
            <div class="link-text">${verificationUrl}</div>
            <p style="color: #71717a; font-size: 13px; margin-top: 16px;">This link will expire in 24 hours.</p>
            <div class="footer">
              This email was sent to ${email} for your InterviewOS account.<br />
              &copy; ${new Date().getFullYear()} InterviewOS. All rights reserved.
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Verify your email address for InterviewOS',
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
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
          <style>
            body {
              background-color: #fafafa;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              margin: 0;
              padding: 40px 20px;
              -webkit-font-smoothing: antialiased;
            }
            .wrapper {
              background-color: #ffffff;
              border: 1px solid #e4e4e7;
              border-radius: 8px;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
              margin: 0 auto;
              max-width: 500px;
              padding: 32px;
            }
            .brand {
              color: #18181b;
              font-size: 16px;
              font-weight: 700;
              letter-spacing: -0.02em;
              margin-bottom: 24px;
            }
            h1 {
              color: #18181b;
              font-size: 20px;
              font-weight: 600;
              line-height: 1.3;
              margin: 0 0 16px 0;
            }
            p {
              color: #3f3f46;
              font-size: 14px;
              line-height: 1.6;
              margin: 0 0 20px 0;
            }
            .btn-container {
              margin: 28px 0;
            }
            .btn {
              background-color: #0d631b;
              border-radius: 6px;
              color: #ffffff !important;
              display: inline-block;
              font-size: 14px;
              font-weight: 500;
              padding: 10px 20px;
              text-decoration: none;
            }
            .list {
              color: #3f3f46;
              font-size: 14px;
              line-height: 1.6;
              margin: 0 0 24px 0;
              padding-left: 20px;
            }
            .list-item {
              margin-bottom: 8px;
            }
            .footer {
              border-top: 1px solid #f4f4f5;
              color: #a1a1aa;
              font-size: 12px;
              line-height: 1.5;
              margin-top: 32px;
              padding-top: 16px;
            }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <div class="brand">InterviewOS</div>
            <h1>Welcome to InterviewOS</h1>
            <p>Hi ${name},</p>
            <p>Your email has been verified and your account is active. Here are a few quick steps to help you get started:</p>
            <ul class="list">
              <li class="list-item">Complete your profile to customize your workspace</li>
              <li class="list-item">Explore the question bank for system design and DSA problems</li>
              <li class="list-item">Create your first interview room to start testing candidates</li>
            </ul>
            <div class="btn-container">
              <a href="http://localhost:8080/dashboard" class="btn">Go to Dashboard</a>
            </div>
            <p style="color: #71717a; font-size: 13px;">If you have any questions or need support, reply directly to this email or visit our help center.</p>
            <div class="footer">
              &copy; ${new Date().getFullYear()} InterviewOS. All rights reserved.
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Welcome to InterviewOS',
      html: htmlContent,
      text: `Welcome ${name}! Your account is verified. Visit http://localhost:8080/dashboard`,
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
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
          <style>
            body {
              background-color: #fafafa;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              margin: 0;
              padding: 40px 20px;
              -webkit-font-smoothing: antialiased;
            }
            .wrapper {
              background-color: #ffffff;
              border: 1px solid #e4e4e7;
              border-radius: 8px;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
              margin: 0 auto;
              max-width: 500px;
              padding: 32px;
            }
            .brand {
              color: #18181b;
              font-size: 16px;
              font-weight: 700;
              letter-spacing: -0.02em;
              margin-bottom: 24px;
            }
            h1 {
              color: #18181b;
              font-size: 20px;
              font-weight: 600;
              line-height: 1.3;
              margin: 0 0 16px 0;
            }
            p {
              color: #3f3f46;
              font-size: 14px;
              line-height: 1.6;
              margin: 0 0 20px 0;
            }
            .otp-card {
              background-color: #f4f4f5;
              border: 1px solid #e4e4e7;
              border-radius: 6px;
              color: #18181b;
              font-family: Menlo, Monaco, Consolas, "Courier New", monospace;
              font-size: 28px;
              font-weight: 700;
              letter-spacing: 6px;
              margin: 24px 0;
              padding: 16px;
              text-align: center;
            }
            .footer {
              border-top: 1px solid #f4f4f5;
              color: #a1a1aa;
              font-size: 12px;
              line-height: 1.5;
              margin-top: 32px;
              padding-top: 16px;
            }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <div class="brand">InterviewOS</div>
            <h1>Password reset request</h1>
            <p>We received a request to reset the password for your InterviewOS account. Use the code below to complete the reset. This code is valid for 10 minutes.</p>
            <div class="otp-card">${otp}</div>
            <p style="color: #71717a; font-size: 13px;">If you did not request a password reset, you can safely ignore this email.</p>
            <div class="footer">
              &copy; ${new Date().getFullYear()} InterviewOS. All rights reserved.
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Reset your InterviewOS password',
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
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
          <style>
            body {
              background-color: #fafafa;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              margin: 0;
              padding: 40px 20px;
              -webkit-font-smoothing: antialiased;
            }
            .wrapper {
              background-color: #ffffff;
              border: 1px solid #e4e4e7;
              border-radius: 8px;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
              margin: 0 auto;
              max-width: 500px;
              padding: 32px;
            }
            .brand {
              color: #18181b;
              font-size: 16px;
              font-weight: 700;
              letter-spacing: -0.02em;
              margin-bottom: 24px;
            }
            h1 {
              color: #18181b;
              font-size: 20px;
              font-weight: 600;
              line-height: 1.3;
              margin: 0 0 16px 0;
            }
            p {
              color: #3f3f46;
              font-size: 14px;
              line-height: 1.6;
              margin: 0 0 20px 0;
            }
            .detail-box {
              background-color: #fcfcfc;
              border: 1px solid #e4e4e7;
              border-radius: 6px;
              margin: 24px 0;
              padding: 20px;
            }
            .detail-row {
              color: #3f3f46;
              font-size: 14px;
              margin-bottom: 10px;
            }
            .detail-row:last-child {
              margin-bottom: 0;
            }
            .detail-label {
              color: #71717a;
              display: inline-block;
              font-weight: 500;
              width: 100px;
            }
            .btn-container {
              margin: 28px 0;
            }
            .btn {
              background-color: #0d631b;
              border-radius: 6px;
              color: #ffffff !important;
              display: inline-block;
              font-size: 14px;
              font-weight: 500;
              padding: 10px 20px;
              text-decoration: none;
            }
            .footer {
              border-top: 1px solid #f4f4f5;
              color: #a1a1aa;
              font-size: 12px;
              line-height: 1.5;
              margin-top: 32px;
              padding-top: 16px;
            }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <div class="brand">InterviewOS</div>
            <h1>Interview Scheduled</h1>
            <p>${role === 'interviewer' ? `You have scheduled an interview with <strong>${candidateName}</strong>.` : `You have been invited to a technical interview with <strong>${interviewerName}</strong>.`}</p>
            
            <div class="detail-box">
              <div class="detail-row"><span class="detail-label">Date:</span> ${date}</div>
              <div class="detail-row"><span class="detail-label">Time:</span> ${time}</div>
              <div class="detail-row"><span class="detail-label">With:</span> ${roleText}</div>
            </div>
            
            <div class="btn-container">
              <a href="${roomLink}" class="btn">Join Interview Room</a>
            </div>
            
            <p style="color: #71717a; font-size: 13px;">Please make sure to test your camera and microphone setup before joining the room.</p>
            <div class="footer">
              &copy; ${new Date().getFullYear()} InterviewOS. All rights reserved.
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: `Interview Scheduled: ${date} at ${time}`,
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
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
          <style>
            body {
              background-color: #fafafa;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              margin: 0;
              padding: 40px 20px;
              -webkit-font-smoothing: antialiased;
            }
            .wrapper {
              background-color: #ffffff;
              border: 1px solid #e4e4e7;
              border-radius: 8px;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
              margin: 0 auto;
              max-width: 500px;
              padding: 32px;
            }
            .brand {
              color: #18181b;
              font-size: 16px;
              font-weight: 700;
              letter-spacing: -0.02em;
              margin-bottom: 24px;
            }
            h1 {
              color: #18181b;
              font-size: 20px;
              font-weight: 600;
              line-height: 1.3;
              margin: 0 0 16px 0;
            }
            p {
              color: #3f3f46;
              font-size: 14px;
              line-height: 1.6;
              margin: 0 0 20px 0;
            }
            .footer {
              border-top: 1px solid #f4f4f5;
              color: #a1a1aa;
              font-size: 12px;
              line-height: 1.5;
              margin-top: 32px;
              padding-top: 16px;
            }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <div class="brand">InterviewOS</div>
            <h1>Password updated successfully</h1>
            <p>Hi ${name},</p>
            <p>This email confirms that the password for your InterviewOS account (<strong>${email}</strong>) has been successfully changed.</p>
            <p style="color: #71717a; font-size: 13px;">If you made this change, no further action is required. If you did not request this change, please contact our support team immediately.</p>
            <div class="footer">
              &copy; ${new Date().getFullYear()} InterviewOS. All rights reserved.
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Your InterviewOS password has been reset',
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
