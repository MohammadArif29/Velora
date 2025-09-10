// Password Reset Routes for Velora

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const emailService = require('../services/emailService');

// Database connection (reuse from User model)
const mysql = require('mysql2/promise');

class PasswordResetService {
    constructor() {
        this.pool = mysql.createPool({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '1234',
            database: process.env.DB_NAME || 'velora_db',
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });
    }

    // Create password reset token
    async createResetToken(userId, email, token) {
        try {
            const expiresAt = new Date(Date.now() + (parseInt(process.env.RESET_TOKEN_EXPIRES_IN) || 3600000)); // 1 hour
            
            // Delete any existing tokens for this user
            await this.pool.execute(
                'DELETE FROM password_reset_tokens WHERE user_id = ?',
                [userId]
            );
            
            // Insert new token
            await this.pool.execute(`
                INSERT INTO password_reset_tokens (user_id, email, token, expires_at)
                VALUES (?, ?, ?, ?)
            `, [userId, email, token, expiresAt]);
            
            return { success: true, expiresAt };
        } catch (error) {
            console.error('Error creating reset token:', error);
            throw error;
        }
    }

    // Verify reset token
    async verifyResetToken(token) {
        try {
            const [rows] = await this.pool.execute(`
                SELECT prt.*, u.id as user_id, u.email, u.full_name
                FROM password_reset_tokens prt
                JOIN users u ON prt.user_id = u.id
                WHERE prt.token = ? AND prt.expires_at > NOW() AND prt.used = FALSE
            `, [token]);
            
            return rows[0] || null;
        } catch (error) {
            console.error('Error verifying reset token:', error);
            throw error;
        }
    }

    // Mark token as used
    async markTokenAsUsed(token) {
        try {
            await this.pool.execute(
                'UPDATE password_reset_tokens SET used = TRUE WHERE token = ?',
                [token]
            );
        } catch (error) {
            console.error('Error marking token as used:', error);
            throw error;
        }
    }

    // Update user password
    async updatePassword(userId, newPassword) {
        try {
            const saltRounds = 12;
            const passwordHash = await bcrypt.hash(newPassword, saltRounds);
            
            await this.pool.execute(
                'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [passwordHash, userId]
            );
            
            return { success: true };
        } catch (error) {
            console.error('Error updating password:', error);
            throw error;
        }
    }

    // Clean up expired tokens
    async cleanupExpiredTokens() {
        try {
            await this.pool.execute(
                'DELETE FROM password_reset_tokens WHERE expires_at < NOW() OR used = TRUE'
            );
        } catch (error) {
            console.error('Error cleaning up tokens:', error);
        }
    }
}

const resetService = new PasswordResetService();
const userModel = new User();

// POST /api/password/forgot
router.post('/forgot', async (req, res) => {
    try {
        const { email } = req.body;

        // Validation
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required',
                errors: [{ field: 'email', message: 'Email address is required' }]
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format',
                errors: [{ field: 'email', message: 'Please enter a valid email address' }]
            });
        }

        // Find user by email
        const user = await userModel.getUserByEmail(email.toLowerCase());
        
        if (!user) {
            // For security, don't reveal if email exists or not
            return res.json({
                success: true,
                message: 'If an account with this email exists, you will receive a password reset link shortly.',
            });
        }

        // Generate reset token
        const resetToken = emailService.generateResetToken();
        
        // Save token to database
        await resetService.createResetToken(user.id, user.email, resetToken);
        
        // Send reset email
        const emailResult = await emailService.sendPasswordResetEmail(
            user.email,
            user.full_name.split(' ')[0], // First name
            resetToken
        );

        // Clean up old tokens
        resetService.cleanupExpiredTokens();

        res.json({
            success: true,
            message: 'If an account with this email exists, you will receive a password reset link shortly.',
            // Only include in development
            ...(process.env.NODE_ENV === 'development' && { 
                resetLink: emailResult.resetLink,
                messageId: emailResult.messageId 
            })
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Unable to process password reset request. Please try again later.',
            errors: [{ field: 'general', message: 'Server error occurred' }]
        });
    }
});

// GET /api/password/verify/:token
router.get('/verify/:token', async (req, res) => {
    try {
        const { token } = req.params;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Reset token is required'
            });
        }

        // Verify token
        const tokenData = await resetService.verifyResetToken(token);
        
        if (!tokenData) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token',
                errors: [{ field: 'token', message: 'This reset link is invalid or has expired' }]
            });
        }

        res.json({
            success: true,
            message: 'Token is valid',
            data: {
                email: tokenData.email,
                fullName: tokenData.full_name
            }
        });

    } catch (error) {
        console.error('Token verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Unable to verify reset token',
            errors: [{ field: 'general', message: 'Server error occurred' }]
        });
    }
});

// POST /api/password/reset
router.post('/reset', async (req, res) => {
    try {
        const { token, newPassword, confirmPassword } = req.body;

        // Validation
        if (!token || !newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required',
                errors: [
                    { field: 'token', message: 'Reset token is required' },
                    { field: 'newPassword', message: 'New password is required' },
                    { field: 'confirmPassword', message: 'Password confirmation is required' }
                ].filter(error => {
                    if (error.field === 'token') return !token;
                    if (error.field === 'newPassword') return !newPassword;
                    if (error.field === 'confirmPassword') return !confirmPassword;
                    return false;
                })
            });
        }

        // Password validation
        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Password validation failed',
                errors: [{ field: 'newPassword', message: 'Password must be at least 8 characters' }]
            });
        }

        if (!/(?=.*[a-z])/.test(newPassword)) {
            return res.status(400).json({
                success: false,
                message: 'Password validation failed',
                errors: [{ field: 'newPassword', message: 'Password must contain at least one lowercase letter' }]
            });
        }

        if (!/(?=.*[A-Z])/.test(newPassword)) {
            return res.status(400).json({
                success: false,
                message: 'Password validation failed',
                errors: [{ field: 'newPassword', message: 'Password must contain at least one uppercase letter' }]
            });
        }

        if (!/(?=.*\d)/.test(newPassword)) {
            return res.status(400).json({
                success: false,
                message: 'Password validation failed',
                errors: [{ field: 'newPassword', message: 'Password must contain at least one number' }]
            });
        }

        if (!/(?=.*[!@#$%^&*(),.?":{}|<>])/.test(newPassword)) {
            return res.status(400).json({
                success: false,
                message: 'Password validation failed',
                errors: [{ field: 'newPassword', message: 'Password must contain at least one special character' }]
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Passwords do not match',
                errors: [{ field: 'confirmPassword', message: 'Passwords do not match' }]
            });
        }

        // Verify token
        const tokenData = await resetService.verifyResetToken(token);
        
        if (!tokenData) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token',
                errors: [{ field: 'token', message: 'This reset link is invalid or has expired' }]
            });
        }

        // Update password
        await resetService.updatePassword(tokenData.user_id, newPassword);
        
        // Mark token as used
        await resetService.markTokenAsUsed(token);

        // Send confirmation email
        emailService.sendPasswordChangeConfirmation(
            tokenData.email,
            tokenData.full_name.split(' ')[0]
        ).catch(error => {
            console.error('Failed to send confirmation email:', error);
            // Don't fail the request if confirmation email fails
        });

        res.json({
            success: true,
            message: 'Password has been reset successfully. You can now login with your new password.',
        });

    } catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({
            success: false,
            message: 'Unable to reset password. Please try again later.',
            errors: [{ field: 'general', message: 'Server error occurred' }]
        });
    }
});

// POST /api/password/change (for logged-in users)
router.post('/change', async (req, res) => {
    try {
        // This would typically require authentication middleware
        // For now, we'll implement basic change password functionality
        
        const { email, currentPassword, newPassword, confirmPassword } = req.body;

        // Validation
        if (!email || !currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'New passwords do not match',
                errors: [{ field: 'confirmPassword', message: 'Passwords do not match' }]
            });
        }

        // Find user
        const user = await userModel.getUserByEmail(email);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Verify current password
        const isCurrentPasswordValid = await userModel.verifyPassword(currentPassword, user.password_hash);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect',
                errors: [{ field: 'currentPassword', message: 'Current password is incorrect' }]
            });
        }

        // Update password
        await resetService.updatePassword(user.id, newPassword);

        // Send confirmation email
        emailService.sendPasswordChangeConfirmation(
            user.email,
            user.full_name.split(' ')[0]
        ).catch(error => {
            console.error('Failed to send confirmation email:', error);
        });

        res.json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Unable to change password. Please try again later.'
        });
    }
});

module.exports = router;
