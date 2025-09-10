// Email Service for Velora Password Reset

const nodemailer = require('nodemailer');
const crypto = require('crypto');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.EMAIL_PORT) || 587,
            secure: process.env.EMAIL_SECURE === 'true',
            auth: {
                user: process.env.EMAIL_USER || 'velorateamindia@gmail.com',
                pass: process.env.EMAIL_PASS || 'tzpe nysg ovbd rfst'
            },
            tls: {
                rejectUnauthorized: false,
                ciphers: 'SSLv3'
            }
        });

        // Verify transporter configuration
        this.verifyConnection();
    }

    async verifyConnection() {
        try {
            await this.transporter.verify();
            console.log('📧 Email service ready for sending messages');
        } catch (error) {
            console.error('❌ Email service configuration error:', error.message);
        }
    }

    // Generate secure reset token
    generateResetToken() {
        return crypto.randomBytes(32).toString('hex');
    }

    // Create password reset email HTML template
    createPasswordResetTemplate(userName, resetLink) {
        return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Password Reset - Velora</title>
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                
                body {
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    line-height: 1.6;
                    color: #333333;
                    background-color: #f8f9fa;
                }
                
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    border-radius: 16px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
                    overflow: hidden;
                }
                
                .header {
                    background: linear-gradient(135deg, #5A31F4, #1AD1FF);
                    padding: 40px 30px;
                    text-align: center;
                    color: white;
                }
                
                .logo {
                    width: 60px;
                    height: 60px;
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 16px;
                    font-size: 24px;
                }
                
                .header h1 {
                    font-size: 28px;
                    font-weight: 800;
                    margin-bottom: 8px;
                }
                
                .header p {
                    font-size: 16px;
                    opacity: 0.9;
                }
                
                .content {
                    padding: 40px 30px;
                }
                
                .greeting {
                    font-size: 18px;
                    font-weight: 600;
                    color: #1a1a1a;
                    margin-bottom: 16px;
                }
                
                .message {
                    font-size: 16px;
                    color: #666666;
                    margin-bottom: 32px;
                    line-height: 1.6;
                }
                
                .reset-button {
                    display: inline-block;
                    background: linear-gradient(135deg, #5A31F4, #1AD1FF);
                    color: white;
                    text-decoration: none;
                    padding: 16px 32px;
                    border-radius: 12px;
                    font-weight: 600;
                    font-size: 16px;
                    text-align: center;
                    margin-bottom: 32px;
                    transition: transform 0.3s ease;
                }
                
                .reset-button:hover {
                    transform: translateY(-2px);
                }
                
                .alternative-link {
                    background: #f8f9fa;
                    border: 1px solid #e9ecef;
                    border-radius: 8px;
                    padding: 16px;
                    margin-bottom: 24px;
                }
                
                .alternative-link p {
                    font-size: 14px;
                    color: #666666;
                    margin-bottom: 8px;
                }
                
                .alternative-link code {
                    background: #e9ecef;
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-size: 12px;
                    word-break: break-all;
                    color: #5A31F4;
                }
                
                .security-note {
                    background: #fff3cd;
                    border: 1px solid #ffeaa7;
                    border-radius: 8px;
                    padding: 16px;
                    margin-bottom: 24px;
                }
                
                .security-note h3 {
                    color: #856404;
                    font-size: 16px;
                    margin-bottom: 8px;
                }
                
                .security-note p {
                    color: #856404;
                    font-size: 14px;
                }
                
                .footer {
                    background: #f8f9fa;
                    padding: 24px 30px;
                    text-align: center;
                    border-top: 1px solid #e9ecef;
                }
                
                .footer p {
                    font-size: 14px;
                    color: #666666;
                    margin-bottom: 8px;
                }
                
                .social-links {
                    margin-top: 16px;
                }
                
                .social-links a {
                    display: inline-block;
                    margin: 0 8px;
                    color: #5A31F4;
                    text-decoration: none;
                }
                
                @media (max-width: 600px) {
                    .container {
                        margin: 0;
                        border-radius: 0;
                    }
                    
                    .header, .content, .footer {
                        padding: 24px 20px;
                    }
                    
                    .header h1 {
                        font-size: 24px;
                    }
                    
                    .reset-button {
                        display: block;
                        text-align: center;
                    }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">🚗</div>
                    <h1>Velora</h1>
                    <p>Smart Campus Transportation</p>
                </div>
                
                <div class="content">
                    <div class="greeting">Hello ${userName}!</div>
                    
                    <div class="message">
                        We received a request to reset your password for your Velora account. 
                        If you made this request, click the button below to reset your password.
                    </div>
                    
                    <a href="${resetLink}" class="reset-button">Reset My Password</a>
                    
                    <div class="alternative-link">
                        <p>If the button doesn't work, copy and paste this link into your browser:</p>
                        <code>${resetLink}</code>
                    </div>
                    
                    <div class="security-note">
                        <h3>🔒 Security Notice</h3>
                        <p>
                            This link will expire in 1 hour for security reasons. 
                            If you didn't request this password reset, please ignore this email. 
                            Your password will remain unchanged.
                        </p>
                    </div>
                </div>
                
                <div class="footer">
                    <p>&copy; 2024 Velora. All rights reserved.</p>
                    <p>Smart transportation for the smart generation</p>
                    <p>This email was sent to you because you requested a password reset.</p>
                    
                    <div class="social-links">
                        <a href="#">Help Center</a> • 
                        <a href="#">Contact Support</a> • 
                        <a href="#">Privacy Policy</a>
                    </div>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    // Send password reset email
    async sendPasswordResetEmail(email, userName, resetToken) {
        try {
            const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/pages/reset-password.html?token=${resetToken}`;
            
            const mailOptions = {
                from: {
                    name: process.env.EMAIL_FROM_NAME || 'Velora Team',
                    address: process.env.EMAIL_FROM || process.env.EMAIL_USER
                },
                to: email,
                subject: '🔒 Reset Your Velora Password',
                html: this.createPasswordResetTemplate(userName, resetLink),
                text: `
Hello ${userName}!

We received a request to reset your password for your Velora account.

Reset your password by clicking this link: ${resetLink}

This link will expire in 1 hour for security reasons.

If you didn't request this password reset, please ignore this email.

Best regards,
Velora Team
                `
            };

            const info = await this.transporter.sendMail(mailOptions);
            
            console.log('✅ Password reset email sent successfully:', info.messageId);
            return {
                success: true,
                messageId: info.messageId,
                resetLink: resetLink // For testing purposes
            };
            
        } catch (error) {
            console.error('❌ Failed to send password reset email:', error);
            throw new Error('Failed to send reset email');
        }
    }

    // Send password change confirmation email
    async sendPasswordChangeConfirmation(email, userName) {
        try {
            const mailOptions = {
                from: {
                    name: process.env.EMAIL_FROM_NAME || 'Velora Team',
                    address: process.env.EMAIL_FROM || process.env.EMAIL_USER
                },
                to: email,
                subject: '✅ Your Velora Password Has Been Changed',
                html: `
                <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #5A31F4, #1AD1FF); color: white; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
                        <h1>Password Changed Successfully</h1>
                        <p>Your Velora account is now secure with your new password.</p>
                    </div>
                    
                    <div style="padding: 20px;">
                        <p>Hello ${userName},</p>
                        <p>This email confirms that your password has been successfully changed for your Velora account.</p>
                        <p>If you didn't make this change, please contact our support team immediately.</p>
                        
                        <div style="background: #f8f9fa; padding: 16px; border-radius: 8px; margin: 20px 0;">
                            <p style="margin: 0; color: #666;">
                                <strong>Security Tip:</strong> Always use a strong, unique password for your account.
                            </p>
                        </div>
                        
                        <p>Best regards,<br>Velora Team</p>
                    </div>
                </div>
                `,
                text: `
Hello ${userName},

This email confirms that your password has been successfully changed for your Velora account.

If you didn't make this change, please contact our support team immediately.

Best regards,
Velora Team
                `
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log('✅ Password change confirmation sent:', info.messageId);
            return { success: true, messageId: info.messageId };
            
        } catch (error) {
            console.error('❌ Failed to send confirmation email:', error);
            // Don't throw error for confirmation email - password change was successful
            return { success: false, error: error.message };
        }
    }
}

module.exports = new EmailService();
