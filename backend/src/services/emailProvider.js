/**
 * Email Provider - Nodemailer
 */
import nodemailer from 'nodemailer';
import { config } from '../config/index.js';

let transporter = null;

if (config.smtpHost && config.smtpUser) {
  transporter = nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: config.smtpPort === 465,
    auth: {
      user: config.smtpUser,
      pass: config.smtpPass,
    },
  });
}

export const emailProvider = {
  // Send email
  async send(type, { email, otp, ...data }) {
    const templates = {
      'verify-email': {
        subject: 'Verify your email - AI Job Aggregator',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #4f46e5;">Verify Your Email</h1>
            <p>Thank you for registering! Please use the following OTP:</p>
            <div style="background: #f3f4f6; padding: 20px; text-align: center; font-size: 32px; letter-spacing: 8px; margin: 20px 0; border-radius: 8px;">
              <strong>${otp}</strong>
            </div>
            <p style="color: #6b7280; font-size: 14px;">This code expires in 5 minutes.</p>
          </div>
        `,
      },
      'welcome': {
        subject: 'Welcome to AI Job Aggregator!',
        html: '<div style="font-family: Arial, sans-serif;"><h1 style="color: #4f46e5;">Welcome!</h1><p>Your email has been verified.</p></div>',
      },
    };

    const template = templates[type];
    if (!template) {
      console.log(`Unknown email type: ${type}`);
      return false;
    }

    // Dev mode - just log
    if (!transporter) {
      console.log(`[DEV] Email: ${type} to ${email}`);
      if (otp) console.log(`  OTP: ${otp}`);
      return true;
    }

    try {
      await transporter.sendMail({
        from: config.smtpFrom,
        to: email,
        subject: template.subject,
        html: template.html,
      });
      console.log(`Email sent: ${type} to ${email}`);
      return true;
    } catch (err) {
      console.error(`Failed to send email: ${err.message}`);
      return false;
    }
  },
};
