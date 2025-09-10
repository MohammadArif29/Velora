// Admin Model for Velora Admin Panel

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

class Admin {
    constructor() {
        this.pool = mysql.createPool({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '1234',
            database: process.env.DB_NAME || 'velora_db',
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
            // Handle JSON columns properly
            typeCast: function (field, next) {
                if (field.type === 'JSON') {
                    return JSON.parse(field.string());
                }
                return next();
            }
        });
    }

    // Get admin by admin_id
    async getAdminByAdminId(adminId) {
        try {
            const [rows] = await this.pool.execute(
                'SELECT * FROM admin_users WHERE admin_id = ? AND is_active = true',
                [adminId]
            );
            
            if (rows[0]) {
                console.log('Raw admin data from DB:', rows[0]);
                console.log('Permissions type:', typeof rows[0].permissions);
                console.log('Permissions value:', rows[0].permissions);
                
                // Convert Buffer to string if needed
                if (Buffer.isBuffer(rows[0].permissions)) {
                    rows[0].permissions = rows[0].permissions.toString();
                    console.log('Converted permissions from Buffer:', rows[0].permissions);
                }
            }
            
            return rows[0] || null;
        } catch (error) {
            console.error('Error getting admin by ID:', error);
            throw error;
        }
    }

    // Verify admin password
    async verifyPassword(plainPassword, hashedPassword) {
        try {
            return await bcrypt.compare(plainPassword, hashedPassword);
        } catch (error) {
            console.error('Error verifying password:', error);
            throw error;
        }
    }

    // Create admin session
    async createSession(adminId, ipAddress, userAgent) {
        try {
            const sessionToken = crypto.randomBytes(32).toString('hex');
            const expiresAt = new Date(Date.now() + (24 * 60 * 60 * 1000)); // 24 hours

            await this.pool.execute(`
                INSERT INTO admin_sessions (admin_id, session_token, expires_at, ip_address, user_agent)
                VALUES (?, ?, ?, ?, ?)
            `, [adminId, sessionToken, expiresAt, ipAddress, userAgent]);

            return { sessionToken, expiresAt };
        } catch (error) {
            console.error('Error creating admin session:', error);
            throw error;
        }
    }

    // Verify admin session
    async verifySession(sessionToken) {
        try {
            const [rows] = await this.pool.execute(`
                SELECT s.*, a.admin_id, a.username, a.role, a.permissions
                FROM admin_sessions s
                JOIN admin_users a ON s.admin_id = a.id
                WHERE s.session_token = ? AND s.expires_at > NOW() AND a.is_active = true
            `, [sessionToken]);

            return rows[0] || null;
        } catch (error) {
            console.error('Error verifying admin session:', error);
            throw error;
        }
    }

    // Update last login
    async updateLastLogin(adminId) {
        try {
            await this.pool.execute(
                'UPDATE admin_users SET last_login = NOW() WHERE id = ?',
                [adminId]
            );
        } catch (error) {
            console.error('Error updating last login:', error);
        }
    }

    // Log admin activity
    async logActivity(adminId, action, targetType = null, targetId = null, details = null, ipAddress = null, userAgent = null) {
        try {
            await this.pool.execute(`
                INSERT INTO admin_activity_logs (admin_id, action, target_type, target_id, details, ip_address, user_agent)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [adminId, action, targetType, targetId, JSON.stringify(details), ipAddress, userAgent]);
        } catch (error) {
            console.error('Error logging admin activity:', error);
        }
    }

    // Get all users with pagination
    async getAllUsers(page = 1, limit = 50, userType = null, search = null) {
        try {
            const offset = (page - 1) * limit;
            let query = `
                SELECT id, unique_id, username, email, mobile_number, user_type, 
                       student_id, full_name, is_verified, is_active, created_at
                FROM users
            `;
            let countQuery = 'SELECT COUNT(*) as total FROM users';
            let params = [];
            let conditions = [];

            if (userType) {
                conditions.push('user_type = ?');
                params.push(userType);
            }

            if (search) {
                conditions.push('(full_name LIKE ? OR email LIKE ? OR username LIKE ?)');
                params.push(`%${search}%`, `%${search}%`, `%${search}%`);
            }

            if (conditions.length > 0) {
                const whereClause = ' WHERE ' + conditions.join(' AND ');
                query += whereClause;
                countQuery += whereClause;
            }

            query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
            params.push(limit, offset);

            const [users] = await this.pool.execute(query, params);
            const [countResult] = await this.pool.execute(countQuery, params.slice(0, -2));

            return {
                users,
                total: countResult[0].total,
                page,
                limit,
                totalPages: Math.ceil(countResult[0].total / limit)
            };
        } catch (error) {
            console.error('Error getting all users:', error);
            throw error;
        }
    }

    // Get user statistics
    async getUserStats() {
        try {
            const [stats] = await this.pool.execute(`
                SELECT 
                    COUNT(*) as total_users,
                    SUM(CASE WHEN user_type = 'student' THEN 1 ELSE 0 END) as total_students,
                    SUM(CASE WHEN user_type = 'captain' THEN 1 ELSE 0 END) as total_captains,
                    SUM(CASE WHEN is_verified = true THEN 1 ELSE 0 END) as verified_users,
                    SUM(CASE WHEN is_active = true THEN 1 ELSE 0 END) as active_users,
                    SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) as today_registrations,
                    SUM(CASE WHEN DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as week_registrations,
                    SUM(CASE WHEN DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as month_registrations
                FROM users WHERE is_active = true
            `);

            return stats[0];
        } catch (error) {
            console.error('Error getting user stats:', error);
            throw error;
        }
    }

    // Update user status
    async updateUserStatus(userId, isActive) {
        try {
            await this.pool.execute(
                'UPDATE users SET is_active = ? WHERE id = ?',
                [isActive, userId]
            );
            return { success: true };
        } catch (error) {
            console.error('Error updating user status:', error);
            throw error;
        }
    }

    // Delete user
    async deleteUser(userId) {
        try {
            await this.pool.execute('DELETE FROM users WHERE id = ?', [userId]);
            return { success: true };
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    }

    // Get system settings
    async getSystemSettings() {
        try {
            const [settings] = await this.pool.execute(
                'SELECT setting_key, setting_value, setting_type, description FROM system_settings'
            );
            
            const settingsObj = {};
            settings.forEach(setting => {
                let value = setting.setting_value;
                
                // Convert based on type
                switch (setting.setting_type) {
                    case 'boolean':
                        value = value === 'true';
                        break;
                    case 'number':
                        value = parseFloat(value);
                        break;
                    case 'json':
                        try {
                            value = JSON.parse(value);
                        } catch (e) {
                            value = null;
                        }
                        break;
                }
                
                settingsObj[setting.setting_key] = {
                    value,
                    type: setting.setting_type,
                    description: setting.description
                };
            });
            
            return settingsObj;
        } catch (error) {
            console.error('Error getting system settings:', error);
            throw error;
        }
    }

    // Update system setting
    async updateSystemSetting(key, value, adminId) {
        try {
            await this.pool.execute(
                'UPDATE system_settings SET setting_value = ?, updated_by = ? WHERE setting_key = ?',
                [value.toString(), adminId, key]
            );
            return { success: true };
        } catch (error) {
            console.error('Error updating system setting:', error);
            throw error;
        }
    }

    // Get recent admin activities
    async getRecentActivities(limit = 50) {
        try {
            const [activities] = await this.pool.execute(`
                SELECT al.*, au.username as admin_username
                FROM admin_activity_logs al
                JOIN admin_users au ON al.admin_id = au.id
                ORDER BY al.created_at DESC
                LIMIT ?
            `, [limit]);

            return activities;
        } catch (error) {
            console.error('Error getting recent activities:', error);
            throw error;
        }
    }

    // Cleanup expired sessions
    async cleanupExpiredSessions() {
        try {
            await this.pool.execute('DELETE FROM admin_sessions WHERE expires_at < NOW()');
        } catch (error) {
            console.error('Error cleaning up expired sessions:', error);
        }
    }

    // Close connection pool
    async close() {
        await this.pool.end();
    }
}

module.exports = Admin;
