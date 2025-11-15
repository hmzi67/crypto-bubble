import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${process.env.APP_URL}/auth/verify-email?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Verify your email - Market Bubbles',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(to right, #1f2937, #111827, #1f2937); border-radius: 12px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);">
                  <!-- Header -->
                  <tr>
                    <td style="padding: 40px 40px 20px; text-align: center; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                      <div style="display: inline-block; width: 60px; height: 60px; border-radius: 12px; background: linear-gradient(135deg, #3b82f6, #8b5cf6, #10b981); margin-bottom: 20px;"></div>
                      <h1 style="margin: 0; color: #f3f4f6; font-size: 28px; font-weight: 800; background: linear-gradient(to right, #60a5fa, #a78bfa); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">MARKET BUBBLES</h1>
                      <p style="margin: 8px 0 0; color: #9ca3af; font-size: 14px;">Live Market Visualization</p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <h2 style="margin: 0 0 16px; color: #f3f4f6; font-size: 24px; font-weight: 700;">Verify Your Email</h2>
                      <p style="margin: 0 0 24px; color: #d1d5db; font-size: 16px; line-height: 1.6;">
                        Thank you for signing up! Please click the button below to verify your email address and activate your account.
                      </p>
                      
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding: 20px 0;">
                            <a href="${verifyUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);">
                              Verify Email Address
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="margin: 24px 0 0; color: #9ca3af; font-size: 14px; line-height: 1.6;">
                        Or copy and paste this link into your browser:
                      </p>
                      <p style="margin: 8px 0 0; padding: 12px; background-color: rgba(255, 255, 255, 0.05); border-radius: 6px; word-break: break-all;">
                        <a href="${verifyUrl}" style="color: #60a5fa; text-decoration: none; font-size: 13px;">${verifyUrl}</a>
                      </p>
                      
                      <p style="margin: 24px 0 0; color: #9ca3af; font-size: 13px; line-height: 1.6;">
                        This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px 40px; background-color: rgba(0, 0, 0, 0.2); border-top: 1px solid rgba(255, 255, 255, 0.1);">
                      <p style="margin: 0; color: #6b7280; font-size: 12px; text-align: center; line-height: 1.6;">
                        © 2025 Market Bubbles. All rights reserved.<br>
                        This is an automated email, please do not reply.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending verification email:', error);
    return { success: false, error };
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.APP_URL}/auth/reset-password?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Reset your password - Market Bubbles',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(to right, #1f2937, #111827, #1f2937); border-radius: 12px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);">
                  <!-- Header -->
                  <tr>
                    <td style="padding: 40px 40px 20px; text-align: center; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                      <div style="display: inline-block; width: 60px; height: 60px; border-radius: 12px; background: linear-gradient(135deg, #3b82f6, #8b5cf6, #10b981); margin-bottom: 20px;"></div>
                      <h1 style="margin: 0; color: #f3f4f6; font-size: 28px; font-weight: 800; background: linear-gradient(to right, #60a5fa, #a78bfa); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">MARKET BUBBLES</h1>
                      <p style="margin: 8px 0 0; color: #9ca3af; font-size: 14px;">Live Market Visualization</p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <h2 style="margin: 0 0 16px; color: #f3f4f6; font-size: 24px; font-weight: 700;">Reset Your Password</h2>
                      <p style="margin: 0 0 24px; color: #d1d5db; font-size: 16px; line-height: 1.6;">
                        We received a request to reset your password. Click the button below to create a new password.
                      </p>
                      
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding: 20px 0;">
                            <a href="${resetUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);">
                              Reset Password
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="margin: 24px 0 0; color: #9ca3af; font-size: 14px; line-height: 1.6;">
                        Or copy and paste this link into your browser:
                      </p>
                      <p style="margin: 8px 0 0; padding: 12px; background-color: rgba(255, 255, 255, 0.05); border-radius: 6px; word-break: break-all;">
                        <a href="${resetUrl}" style="color: #60a5fa; text-decoration: none; font-size: 13px;">${resetUrl}</a>
                      </p>
                      
                      <p style="margin: 24px 0 0; color: #9ca3af; font-size: 13px; line-height: 1.6;">
                        This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px 40px; background-color: rgba(0, 0, 0, 0.2); border-top: 1px solid rgba(255, 255, 255, 0.1);">
                      <p style="margin: 0; color: #6b7280; font-size: 12px; text-align: center; line-height: 1.6;">
                        © 2025 Market Bubbles. All rights reserved.<br>
                        This is an automated email, please do not reply.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return { success: false, error };
  }
}
