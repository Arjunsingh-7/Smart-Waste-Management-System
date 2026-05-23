import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const from = process.env.EMAIL_FROM || 'onboarding@resend.dev';

  console.log('[email] Attempting to send email:', {
    to,
    subject,
    from,
    hasApiKey: !!process.env.RESEND_API_KEY,
  });

  if (!process.env.RESEND_API_KEY) {
    console.error('[email] RESEND_API_KEY is not defined in environment variables');
    return { success: false, error: 'RESEND_API_KEY missing' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
    });

    if (error) {
      console.error('[email] Resend API error:', error);
      return { success: false, error: error.message };
    }

    console.log('[email] Email sent successfully:', {
      id: data?.id,
      to,
      subject,
    });
    return { success: true, data };
  } catch (error) {
    console.error('[email] Failed to send email via Resend:', error);
    return { success: false, error };
  }
}

// Test email function
export async function sendTestEmail(to: string) {
  console.log('[email] Sending test email to:', to);

  return await sendEmail({
    to,
    subject: 'Waste Wizard Test Email',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #16C47F;">Waste Wizard Test Email</h1>
        <p>Email service is working successfully!</p>
        <p>If you received this email, the Resend API integration is working correctly.</p>
        <hr>
        <p style="color: #666; font-size: 12px;">This is a test email from Waste Wizard Smart Waste Management System.</p>
      </div>
    `,
  });
}

// Welcome email function
export async function sendWelcomeEmail(email: string, organizationName: string) {
  console.log('[email] Sending welcome email to:', email, 'for organization:', organizationName);

  const html = createWelcomeEmailTemplate(organizationName, email);

  return await sendEmail({
    to: email,
    subject: 'Welcome to Waste Wizard 🚀',
    html,
  });
}

// Verification email function
export async function sendVerificationEmail(email: string, verificationUrl: string) {
  console.log('[email] Sending verification email to:', email);

  const html = createVerificationEmailTemplate(verificationUrl);

  return await sendEmail({
    to: email,
    subject: 'Verify your Waste Wizard account',
    html,
  });
}

// Professional verification email template
export function createVerificationEmailTemplate(verificationUrl: string) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email - Waste Wizard</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #16C47F 0%, #00C661 100%); padding: 40px 32px; text-align: center;">
          <div style="display: inline-flex; align-items: center; gap: 12px; margin-bottom: 16px;">
            <div style="width: 48px; height: 48px; background-color: rgba(255, 255, 255, 0.2); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 6L5 6L21 6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M19 6V20C19 21 18 22 17 22H7C6 22 5 21 5 20V6M8 6V4C8 3 9 2 10 2H14C15 2 16 3 16 4V6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M10 11L10 17" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M14 11L14 17" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h1 style="color: white; font-size: 28px; font-weight: 700; margin: 0; letter-spacing: -0.5px;">Waste Wizard</h1>
          </div>
          <p style="color: rgba(255, 255, 255, 0.9); font-size: 16px; margin: 0; font-weight: 500;">Smart Waste Management Platform</p>
        </div>

        <!-- Main Content -->
        <div style="padding: 48px 32px;">
          <h2 style="color: #0f172a; font-size: 24px; font-weight: 700; margin: 0 0 16px 0; line-height: 1.3;">
            Verify Your Email Address 📧
          </h2>
          
          <p style="color: #334155; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
            Thank you for registering with Waste Wizard! To complete your account setup and start managing your smart waste systems, please verify your email address.
          </p>

          <!-- CTA Button -->
          <div style="text-align: center; margin: 32px 0;">
            <a href="${verificationUrl}" 
               style="display: inline-block; background: linear-gradient(135deg, #16C47F 0%, #00C661 100%); 
                      color: white; text-decoration: none; padding: 16px 32px; font-size: 16px; 
                      font-weight: 600; border-radius: 12px; box-shadow: 0 4px 12px rgba(22, 196, 127, 0.3);
                      transition: all 0.2s ease;">
              Verify Email Address
            </a>
          </div>

          <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 24px 0;">
            If the button doesn't work, copy and paste this link into your browser:
          </p>
          
          <div style="background-color: #f8fafc; border-radius: 8px; padding: 16px; margin: 16px 0; border-left: 4px solid #16C47F;">
            <p style="color: #16C47F; font-size: 12px; word-break: break-all; margin: 0; font-family: monospace;">
              ${verificationUrl}
            </p>
          </div>

          <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 24px 0 0 0;">
            This verification link will expire in 24 hours for security reasons.
          </p>
        </div>

        <!-- Footer -->
        <div style="background-color: #f1f5f9; padding: 32px; text-align: center; border-top: 1px solid #e2e8f0;">
          <div style="margin-bottom: 16px;">
            <h4 style="color: #0f172a; font-size: 16px; font-weight: 600; margin: 0 0 8px 0;">Waste Wizard</h4>
            <p style="color: #64748b; font-size: 14px; margin: 0;">Smart Waste Management Platform</p>
          </div>
          
          <div style="margin-bottom: 16px;">
            <p style="color: #64748b; font-size: 14px; margin: 0;">
              Support: <a href="mailto:wastewizard24@gmail.com" style="color: #16C47F; text-decoration: none; font-weight: 500;">wastewizard24@gmail.com</a>
            </p>
          </div>
          
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
          
          <p style="color: #94a3b8; font-size: 12px; margin: 0;">
            &copy; ${new Date().getFullYear()} Waste Wizard. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Professional welcome email template
export function createWelcomeEmailTemplate(organizationName: string, userEmail: string) {
  const dashboardUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`;
  const supportEmail = 'wastewizard24@gmail.com';
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Waste Wizard</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #16C47F 0%, #00C661 100%); padding: 40px 32px; text-align: center;">
          <div style="display: inline-flex; align-items: center; gap: 12px; margin-bottom: 16px;">
            <div style="width: 48px; height: 48px; background-color: rgba(255, 255, 255, 0.2); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 6L5 6L21 6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M19 6V20C19 21 18 22 17 22H7C6 22 5 21 5 20V6M8 6V4C8 3 9 2 10 2H14C15 2 16 3 16 4V6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M10 11L10 17" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M14 11L14 17" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h1 style="color: white; font-size: 28px; font-weight: 700; margin: 0; letter-spacing: -0.5px;">Waste Wizard</h1>
          </div>
          <p style="color: rgba(255, 255, 255, 0.9); font-size: 16px; margin: 0; font-weight: 500;">Smart Waste Management Platform</p>
        </div>

        <!-- Main Content -->
        <div style="padding: 48px 32px;">
          <h2 style="color: #0f172a; font-size: 24px; font-weight: 700; margin: 0 0 16px 0; line-height: 1.3;">
            Welcome to Waste Wizard! 🚀
          </h2>
          
          <p style="color: #334155; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
            Hi <strong style="color: #0f172a;">${organizationName}</strong>,
          </p>
          
          <p style="color: #334155; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
            Thank you for joining Waste Wizard! Your account has been successfully created and you're now ready to revolutionize your waste management with our smart IoT-powered platform.
          </p>

          <!-- Features Section -->
          <div style="background-color: #f8fafc; border-radius: 16px; padding: 24px; margin: 32px 0;">
            <h3 style="color: #0f172a; font-size: 18px; font-weight: 600; margin: 0 0 16px 0;">What you can do with Waste Wizard:</h3>
            <ul style="margin: 0; padding: 0; list-style: none;">
              <li style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px;">
                <div style="width: 20px; height: 20px; background-color: #16C47F; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-top: 2px; flex-shrink: 0;">
                  <span style="color: white; font-size: 12px; font-weight: bold;">✓</span>
                </div>
                <span style="color: #475569; font-size: 14px; line-height: 1.5;">Monitor smart dustbins in real-time with IoT sensors</span>
              </li>
              <li style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px;">
                <div style="width: 20px; height: 20px; background-color: #16C47F; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-top: 2px; flex-shrink: 0;">
                  <span style="color: white; font-size: 12px; font-weight: bold;">✓</span>
                </div>
                <span style="color: #475569; font-size: 14px; line-height: 1.5;">Receive automated alerts when waste levels reach 75%</span>
              </li>
              <li style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px;">
                <div style="width: 20px; height: 20px; background-color: #16C47F; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-top: 2px; flex-shrink: 0;">
                  <span style="color: white; font-size: 12px; font-weight: bold;">✓</span>
                </div>
                <span style="color: #475569; font-size: 14px; line-height: 1.5;">Track analytics and optimize collection schedules</span>
              </li>
              <li style="display: flex; align-items: flex-start; gap: 12px;">
                <div style="width: 20px; height: 20px; background-color: #16C47F; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-top: 2px; flex-shrink: 0;">
                  <span style="color: white; font-size: 12px; font-weight: bold;">✓</span>
                </div>
                <span style="color: #475569; font-size: 14px; line-height: 1.5;">Manage multiple locations from a unified dashboard</span>
              </li>
            </ul>
          </div>

          <!-- CTA Button -->
          <div style="text-align: center; margin: 32px 0;">
            <a href="${dashboardUrl}" 
               style="display: inline-block; background: linear-gradient(135deg, #16C47F 0%, #00C661 100%); 
                      color: white; text-decoration: none; padding: 16px 32px; font-size: 16px; 
                      font-weight: 600; border-radius: 12px; box-shadow: 0 4px 12px rgba(22, 196, 127, 0.3);
                      transition: all 0.2s ease;">
              Access Your Dashboard
            </a>
          </div>

          <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 24px 0 0 0; text-align: center;">
            Need help getting started? Our support team is here to assist you.
          </p>
        </div>

        <!-- Footer -->
        <div style="background-color: #f1f5f9; padding: 32px; text-align: center; border-top: 1px solid #e2e8f0;">
          <div style="margin-bottom: 16px;">
            <h4 style="color: #0f172a; font-size: 16px; font-weight: 600; margin: 0 0 8px 0;">Waste Wizard</h4>
            <p style="color: #64748b; font-size: 14px; margin: 0;">Smart Waste Management Platform</p>
          </div>
          
          <div style="margin-bottom: 16px;">
            <p style="color: #64748b; font-size: 14px; margin: 0;">
              Support: <a href="mailto:${supportEmail}" style="color: #16C47F; text-decoration: none; font-weight: 500;">${supportEmail}</a>
            </p>
          </div>
          
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
          
          <p style="color: #94a3b8; font-size: 12px; margin: 0;">
            &copy; ${new Date().getFullYear()} Waste Wizard. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}
