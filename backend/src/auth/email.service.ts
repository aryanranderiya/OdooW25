import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private resend: Resend;
  private fromEmail: string;
  private frontendUrl: string;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
    this.fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    this.frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  }

  async sendVerificationEmail(email: string, name: string, token: string) {
    const verificationUrl = `${this.frontendUrl}/verify-email?token=${token}`;

    await this.resend.emails.send({
      from: this.fromEmail,
      to: email,
      subject: 'Verify your email address',
      html: this.getVerificationEmailTemplate(name, verificationUrl),
    });
  }

  async sendPasswordResetEmail(email: string, name: string, token: string) {
    const resetUrl = `${this.frontendUrl}/reset-password?token=${token}`;

    await this.resend.emails.send({
      from: this.fromEmail,
      to: email,
      subject: 'Reset your password',
      html: this.getPasswordResetEmailTemplate(name, resetUrl),
    });
  }

  async sendPasswordResetConfirmationEmail(email: string, name: string) {
    await this.resend.emails.send({
      from: this.fromEmail,
      to: email,
      subject: 'Password reset successful',
      html: this.getPasswordResetConfirmationTemplate(name),
    });
  }

  async sendUserCredentialsEmail(
    email: string,
    name: string,
    password: string,
    companyName: string,
  ) {
    await this.resend.emails.send({
      from: this.fromEmail,
      to: email,
      subject: 'Welcome to Expense Manager - Your Account Details',
      html: this.getUserCredentialsEmailTemplate(
        name,
        email,
        password,
        companyName,
      ),
    });
  }

  private getVerificationEmailTemplate(
    name: string,
    verificationUrl: string,
  ): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <tr>
                    <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px;">Verify Your Email</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 40px;">
                      <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.5; color: #333333;">
                        Hi ${name},
                      </p>
                      <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.5; color: #333333;">
                        Thank you for signing up! Please verify your email address by clicking the button below.
                      </p>
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding: 20px 0;">
                            <a href="${verificationUrl}" style="display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                              Verify Email
                            </a>
                          </td>
                        </tr>
                      </table>
                      <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.5; color: #666666;">
                        Or copy and paste this link in your browser:
                      </p>
                      <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.5; color: #667eea; word-break: break-all;">
                        ${verificationUrl}
                      </p>
                      <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.5; color: #666666;">
                        This link will expire in 24 hours.
                      </p>
                      <p style="margin: 20px 0 0; font-size: 14px; line-height: 1.5; color: #666666;">
                        If you didn't create an account, you can safely ignore this email.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 20px 40px; background-color: #f8f9fa; text-align: center; border-top: 1px solid #e9ecef;">
                      <p style="margin: 0; font-size: 12px; color: #999999;">
                        © ${new Date().getFullYear()} Expense Manager. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;
  }

  private getPasswordResetEmailTemplate(
    name: string,
    resetUrl: string,
  ): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <tr>
                    <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px;">Reset Your Password</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 40px;">
                      <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.5; color: #333333;">
                        Hi ${name},
                      </p>
                      <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.5; color: #333333;">
                        We received a request to reset your password. Click the button below to create a new password.
                      </p>
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding: 20px 0;">
                            <a href="${resetUrl}" style="display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                              Reset Password
                            </a>
                          </td>
                        </tr>
                      </table>
                      <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.5; color: #666666;">
                        Or copy and paste this link in your browser:
                      </p>
                      <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.5; color: #f5576c; word-break: break-all;">
                        ${resetUrl}
                      </p>
                      <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.5; color: #666666;">
                        This link will expire in 1 hour.
                      </p>
                      <p style="margin: 20px 0 0; font-size: 14px; line-height: 1.5; color: #666666;">
                        If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 20px 40px; background-color: #f8f9fa; text-align: center; border-top: 1px solid #e9ecef;">
                      <p style="margin: 0; font-size: 12px; color: #999999;">
                        © ${new Date().getFullYear()} Expense Manager. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;
  }

  private getPasswordResetConfirmationTemplate(name: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset Successful</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <tr>
                    <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px;">Password Reset Successful</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 40px;">
                      <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.5; color: #333333;">
                        Hi ${name},
                      </p>
                      <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.5; color: #333333;">
                        Your password has been successfully reset. You can now log in with your new password.
                      </p>
                      <p style="margin: 20px 0 0; font-size: 14px; line-height: 1.5; color: #666666;">
                        If you didn't make this change, please contact support immediately.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 20px 40px; background-color: #f8f9fa; text-align: center; border-top: 1px solid #e9ecef;">
                      <p style="margin: 0; font-size: 12px; color: #999999;">
                        © ${new Date().getFullYear()} Expense Manager. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;
  }

  private getUserCredentialsEmailTemplate(
    name: string,
    email: string,
    password: string,
    companyName: string,
  ): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Expense Manager</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <tr>
                    <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px;">Welcome to Expense Manager</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 40px;">
                      <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.5; color: #333333;">
                        Hi ${name},
                      </p>
                      <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.5; color: #333333;">
                        Welcome to Expense Manager! Your account has been created for ${companyName}. Here are your login credentials:
                      </p>

                      <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px; padding: 15px; margin: 20px 0;">
                        <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #856404; font-weight: bold;">
                          📧 Important: Please check your email for a verification link. You must verify your email address before you can log in.
                        </p>
                      </div>
                      
                      <div style="background-color: #f8f9fa; border: 1px solid #e9ecef; border-radius: 6px; padding: 20px; margin: 20px 0;">
                        <p style="margin: 0 0 10px; font-size: 14px; color: #666666; font-weight: bold;">Email:</p>
                        <p style="margin: 0 0 20px; font-size: 16px; color: #333333; font-family: monospace;">${email}</p>
                        
                        <p style="margin: 0 0 10px; font-size: 14px; color: #666666; font-weight: bold;">Temporary Password:</p>
                        <p style="margin: 0; font-size: 16px; color: #333333; font-family: monospace; background-color: #ffffff; padding: 10px; border: 1px solid #dee2e6; border-radius: 4px;">${password}</p>
                      </div>

                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding: 20px 0;">
                            <a href="${this.frontendUrl}/login" style="display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                              Login After Email Verification
                            </a>
                          </td>
                        </tr>
                      </table>

                      <p style="margin: 20px 0 10px; font-size: 14px; line-height: 1.5; color: #e67e22; font-weight: bold;">
                        Getting Started:
                      </p>
                      <ol style="margin: 0 0 20px; font-size: 14px; line-height: 1.5; color: #666666; padding-left: 20px;">
                        <li>Check your email for a verification link and click it to verify your account</li>
                        <li>Use the credentials above to log in</li>
                        <li>Change your password after your first login for security purposes</li>
                      </ol>
                      
                      <p style="margin: 20px 0 0; font-size: 14px; line-height: 1.5; color: #666666;">
                        If you have any questions, please contact your administrator.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 20px 40px; background-color: #f8f9fa; text-align: center; border-top: 1px solid #e9ecef;">
                      <p style="margin: 0; font-size: 12px; color: #999999;">
                        © ${new Date().getFullYear()} Expense Manager. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;
  }
}
