import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Simple in-memory store for OTPs (in production, use Redis or DB)
const otpStore: Record<string, { code: string; expiresAt: number }> = {};

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    // Generate random 8-digit OTP code
    const code = Math.floor(10000000 + Math.random() * 90000000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

    otpStore[email.toLowerCase()] = { code, expiresAt };

    console.log(`📧 [REAL OTP GENERATED] Email: ${email} | Code: ${code}`);

    let emailSent = false;
    let emailDeliveryError = '';

    // Check if SMTP is configured for real email sending
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = Number(process.env.SMTP_PORT) || 587;

    if (smtpUser && smtpPass) {
      try {
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpPort === 465,
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
          tls: {
            rejectUnauthorized: false,
          },
        });

        await transporter.sendMail({
          from: `"NexERP Onboarding" <${smtpUser}>`,
          to: email,
          subject: `Your 8-Digit Onboarding Verification Code: ${code}`,
          text: `Your NexERP verification code is: ${code}\nThis code will expire in 10 minutes.`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded-radius: 12px; background-color: #ffffff;">
              <h2 style="color: #0369a1; margin-bottom: 8px;">NexERP Enterprise Verification</h2>
              <p style="color: #475569; font-size: 14px;">Use the following 8-digit verification code to complete your workspace onboarding:</p>
              <div style="background-color: #f0f9ff; border: 1px solid #bae6fd; padding: 16px; text-align: center; border-radius: 10px; margin: 20px 0;">
                <span style="font-size: 28px; font-weight: bold; font-family: monospace; letter-spacing: 4px; color: #0284c7;">${code}</span>
              </div>
              <p style="color: #64748b; font-size: 12px;">This verification code will expire in 10 minutes. If you did not request this code, please ignore this email.</p>
              <hr style="border: none; border-top: 1px solid #f1f5f9; margin-top: 20px;" />
              <p style="color: #94a3b8; font-size: 11px; text-align: center;">© NexERP Enterprise Systems</p>
            </div>
          `,
        });

        emailSent = true;
      } catch (err: any) {
        console.warn('⚠️ SMTP Sending failed:', err.message);
        emailDeliveryError = err.message;
      }
    }

    return NextResponse.json({
      success: true,
      emailSent,
      emailDeliveryError: emailSent ? undefined : emailDeliveryError,
      // For instant testing/demo fallback if SMTP credentials aren't set in env
      demoCode: code,
    });
  } catch (error: any) {
    console.error('Error generating OTP:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json({ error: 'Missing email or code' }, { status: 400 });
    }

    const record = otpStore[email.toLowerCase()];

    if (!record) {
      return NextResponse.json({ error: 'No verification code found for this email. Please click Resend Code.' }, { status: 400 });
    }

    if (Date.now() > record.expiresAt) {
      delete otpStore[email.toLowerCase()];
      return NextResponse.json({ error: 'Verification code has expired. Please request a new code.' }, { status: 400 });
    }

    if (record.code !== code.trim()) {
      return NextResponse.json({ error: 'Invalid 8-digit verification code. Please check your email.' }, { status: 400 });
    }

    // Code matches!
    delete otpStore[email.toLowerCase()];
    return NextResponse.json({ success: true, verified: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Verification failed' }, { status: 500 });
  }
}
