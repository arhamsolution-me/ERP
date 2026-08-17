import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, company, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    console.log('📥 NEW DEMO REQUEST RECEIVED:', { name, email, company, message });

    // Configure nodemailer transporter with user's SMTP credentials
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    try {
      // Send email to the system administrator
      await transporter.sendMail({
        from: `"NexERP Demo Request" <${process.env.SMTP_USER || 'noreply@nexerp.com'}>`,
        to: process.env.SMTP_USER || email,
        replyTo: email,
        subject: `New Demo Request: ${company || name}`,
        text: `
You have a new demo request from NexERP landing page:

Name: ${name}
Email: ${email}
Company: ${company || 'N/A'}

Message:
${message}
        `,
        html: `
          <h3>New Demo Request</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Company:</strong> ${company || 'N/A'}</p>
          <br/>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, '<br/>')}</p>
        `,
      });

      // Optionally send an auto-reply to the user
      if (process.env.SMTP_USER) {
        await transporter.sendMail({
          from: `"NexERP Team" <${process.env.SMTP_USER}>`,
          to: email,
          subject: `We received your demo request!`,
          text: `Hi ${name},\n\nThank you for your interest in NexERP. Our team will contact you shortly to schedule a personalized demo.\n\nBest,\nThe NexERP Team`,
          html: `<p>Hi ${name},</p><p>Thank you for your interest in NexERP. Our team will contact you shortly to schedule a personalized demo.</p><p>Best,<br/>The NexERP Team</p>`
        });
      }
    } catch (emailError: any) {
      console.warn('⚠️ SMTP Email delivery failed, but demo request was logged to console:', emailError.message);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error processing demo request:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
