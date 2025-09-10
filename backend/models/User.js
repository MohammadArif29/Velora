// User Model for Velora

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

class User {
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

    // Generate unique ID for users
    generateUniqueId(userType) {
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        const prefix = userType === 'student' ? 'STU' : 'CAP';
        return `${prefix}${timestamp}${random}`;
    }

    // Check if username exists
    async checkUsernameExists(username) {
        try {
            const [rows] = await this.pool.execute(
                'SELECT id FROM users WHERE username = ?',
                [username]
            );
            return rows.length > 0;
        } catch (error) {
            console.error('Error checking username:', error);
            throw error;
        }
    }

    // Check if email exists
    async checkEmailExists(email) {
        try {
            const [rows] = await this.pool.execute(
                'SELECT id FROM users WHERE email = ?',
                [email]
            );
            return rows.length > 0;
        } catch (error) {
            console.error('Error checking email:', error);
            throw error;
        }
    }

    // Check if mobile number exists
    async checkMobileExists(mobile) {
        try {
            const [rows] = await this.pool.execute(
                'SELECT id FROM users WHERE mobile_number = ?',
                [mobile]
            );
            return rows.length > 0;
        } catch (error) {
            console.error('Error checking mobile:', error);
            throw error;
        }
    }

    // Check if student ID exists
    async checkStudentIdExists(studentId) {
        try {
            const [rows] = await this.pool.execute(
                'SELECT id FROM users WHERE student_id = ?',
                [studentId]
            );
            return rows.length > 0;
        } catch (error) {
            console.error('Error checking student ID:', error);
            throw error;
        }
    }

    // Create new user
    async createUser(userData) {
        const connection = await this.pool.getConnection();
        
        try {
            await connection.beginTransaction();

            // Generate unique ID
            let uniqueId;
            let isUnique = false;
            let attempts = 0;
            
            while (!isUnique && attempts < 10) {
                uniqueId = this.generateUniqueId(userData.userType);
                const [existingId] = await connection.execute(
                    'SELECT id FROM users WHERE unique_id = ?',
                    [uniqueId]
                );
                isUnique = existingId.length === 0;
                attempts++;
            }

            if (!isUnique) {
                throw new Error('Failed to generate unique ID');
            }

            // Hash password
            const saltRounds = 12;
            const passwordHash = await bcrypt.hash(userData.password, saltRounds);

            // Insert user
            const [userResult] = await connection.execute(`
                INSERT INTO users (
                    unique_id, username, email, mobile_number, password_hash,
                    user_type, student_id, full_name
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                uniqueId,
                userData.username,
                userData.email,
                userData.mobile,
                passwordHash,
                userData.userType,
                userData.studentId || null,
                userData.fullName
            ]);

            const userId = userResult.insertId;

            // Create user profile
            await connection.execute(`
                INSERT INTO user_profiles (user_id) VALUES (?)
            `, [userId]);

            // Create captain details if user is captain
            if (userData.userType === 'captain') {
                await connection.execute(`
                    INSERT INTO captain_details (user_id) VALUES (?)
                `, [userId]);
            }

            await connection.commit();

            return {
                id: userId,
                uniqueId: uniqueId,
                username: userData.username,
                email: userData.email,
                userType: userData.userType,
                fullName: userData.fullName
            };

        } catch (error) {
            await connection.rollback();
            console.error('Error creating user:', error);
            throw error;
        } finally {
            connection.release();
        }
    }

    // Get user by email
    async getUserByEmail(email) {
        try {
            const [rows] = await this.pool.execute(`
                SELECT * FROM users WHERE email = ? AND is_active = true
            `, [email]);
            
            return rows[0] || null;
        } catch (error) {
            console.error('Error getting user by email:', error);
            throw error;
        }
    }

    // Get user by username
    async getUserByUsername(username) {
        try {
            const [rows] = await this.pool.execute(`
                SELECT * FROM users WHERE username = ? AND is_active = true
            `, [username]);
            
            return rows[0] || null;
        } catch (error) {
            console.error('Error getting user by username:', error);
            throw error;
        }
    }

    // Verify password
    async verifyPassword(plainPassword, hashedPassword) {
        try {
            return await bcrypt.compare(plainPassword, hashedPassword);
        } catch (error) {
            console.error('Error verifying password:', error);
            throw error;
        }
    }

    // Get user stats
    async getUserStats() {
        try {
            const [stats] = await this.pool.execute(`
                SELECT 
                    COUNT(*) as total_users,
                    SUM(CASE WHEN user_type = 'student' THEN 1 ELSE 0 END) as total_students,
                    SUM(CASE WHEN user_type = 'captain' THEN 1 ELSE 0 END) as total_captains,
                    SUM(CASE WHEN is_verified = true THEN 1 ELSE 0 END) as verified_users
                FROM users WHERE is_active = true
            `);
            
            return stats[0];
        } catch (error) {
            console.error('Error getting user stats:', error);
            throw error;
        }
    }

    // Close connection pool
    async close() {
        await this.pool.end();
    }
}

module.exports = User;
