// app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

async function sendResetEmail(email: string, resetLink: string) {
  try {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('='.repeat(60));
      console.log('PASSWORD RESET EMAIL');
      console.log('='.repeat(60));
      console.log(`To: ${email}`);
      console.log(`Reset Link: ${resetLink}`);
      console.log('='.repeat(60));
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER, // Your Gmail address
        pass: process.env.GMAIL_APP_PASSWORD, // Gmail App Password (NOT your regular password)
      },
    });

    // Send email
    const info = await transporter.sendMail({
      from: `"CloudBillr" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Reset Your Password - CloudBillr',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">CloudBillr</h1>
            </div>
            
            <div style="background: #f9f9f9; padding: 40px 30px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #333; margin-top: 0;">Reset Your Password</h2>
              
              <p style="color: #666; font-size: 16px;">
                We received a request to reset your password. Click the button below to create a new password:
              </p>
              
              <div style="text-align: center; margin: 35px 0;">
                <a href="${resetLink}" 
                   style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                          color: white; 
                          padding: 14px 40px; 
                          text-decoration: none; 
                          border-radius: 8px; 
                          font-weight: 600;
                          font-size: 16px;
                          display: inline-block;
                          box-shadow: 0 4px 6px rgba(102, 126, 234, 0.4);">
                  Reset Password
                </a>
              </div>
              
              <p style="color: #666; font-size: 14px; margin-top: 30px;">
                Or copy and paste this link into your browser:
              </p>
              <p style="color: #667eea; font-size: 13px; word-break: break-all; background: white; padding: 12px; border-radius: 6px; border: 1px solid #e0e0e0;">
                ${resetLink}
              </p>
              
              <div style="margin-top: 35px; padding-top: 25px; border-top: 2px solid #e0e0e0;">
                <p style="color: #999; font-size: 13px; margin: 5px 0;">
                  <strong>This link will expire in 1 hour.</strong>
                </p>
                <p style="color: #999; font-size: 13px; margin: 5px 0;">
                  If you didn't request this, please ignore this email.
                </p>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 30px; color: #999; font-size: 12px;">
              <p>&copy; ${new Date().getFullYear()} CloudBillr. All rights reserved.</p>
            </div>
          </body>
        </html>
      `,
      text: `Reset Your Password\n\nWe received a request to reset your password.\n\nClick this link to reset your password:\n${resetLink}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this, please ignore this email.\n\n© ${new Date().getFullYear()} CloudBillr`
    });

    console.log('✅ Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Email sending error:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('cloudbillr');
    const users = db.collection('users');

    // Check if user exists
    const user = await users.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Don't reveal if email exists (security best practice)
      return NextResponse.json(
        { message: 'If an account exists with this email, a reset link has been sent' },
        { status: 200 }
      );
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    // Save reset token to database
    await users.updateOne(
      { _id: user._id },
      {
        $set: {
          resetToken: resetTokenHash,
          resetTokenExpiry: resetTokenExpiry,
        },
      }
    );

    // Create reset link
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const resetLink = `${baseUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    // Send email
    const emailSent = await sendResetEmail(email, resetLink);

    if (!emailSent) {
      console.error('Failed to send email to:', email);
      return NextResponse.json(
        { error: 'Failed to send reset email. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Password reset link has been sent to your email',
        // For development only - remove in production
        ...(process.env.NODE_ENV === 'development' && { resetLink })
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}