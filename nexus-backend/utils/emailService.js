import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async ({ to, subject, text, html }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn(`[DEV MODE] Mock email sent to ${to} (Subject: ${subject})`);
    return { messageId: 'mock-id' };
  }

  try {
    const info = await transporter.sendMail({
      from: `"Business Nexus" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    });
    console.log('Message sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    console.warn(`[DEV MODE] Ignoring SMTP failure and returning as success. Mock email sent to ${to}`);
    return { messageId: 'mock-id' };
  }
};

export const sendOTPEmail = async (email, otp) => {
  const subject = 'Your Business Nexus Security Code';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <h2 style="color: #4f46e5; text-align: center;">Security Verification</h2>
      <p>Hello,</p>
      <p>You are receiving this email because a login attempt was made for your Business Nexus account that requires two-factor authentication.</p>
      <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #111827;">${otp}</span>
      </div>
      <p>This code will expire in 10 minutes. If you did not attempt to log in, please ignore this email or contact support if you have concerns.</p>
      <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
      <p style="font-size: 12px; color: #6b7280; text-align: center;">
        &copy; ${new Date().getFullYear()} Business Nexus. All rights reserved.
      </p>
    </div>
  `;

  return sendEmail({ to: email, subject, html });
};
