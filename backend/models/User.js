// User Model for Velora

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

class User {
    constructor() {
        this.pool = mysql.createPool({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '12345',
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

    // Get user by ID
    async getUserById(userId) {
        try {
            const [rows] = await this.pool.execute(`
                SELECT * FROM users WHERE id = ? AND is_active = true
            `, [userId]);
            
            return rows[0] || null;
        } catch (error) {
            console.error('Error getting user by ID:', error);
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

    // KYC Methods - Simplified
    async getKYCData(userId) {
        try {
            const [kycData] = await this.pool.execute(`
                SELECT 
                    cd.*,
                    u.full_name as user_full_name,
                    u.email as user_email,
                    u.mobile_number as user_mobile
                FROM captain_details cd
                LEFT JOIN users u ON cd.user_id = u.id
                WHERE cd.user_id = ?
            `, [userId]);

            if (kycData.length === 0) {
                return {
                    status: 'pending',
                    captainDetails: {},
                    documents: []
                };
            }

            const data = kycData[0];
            return {
                status: data.kyc_status || 'pending',
                captainDetails: data,
                documents: [
                    {
                        type: 'id_document',
                        name: data.id_document_name,
                        path: data.id_document_path
                    },
                    {
                        type: 'license_document',
                        name: data.license_document_name,
                        path: data.license_document_path
                    }
                ].filter(doc => doc.name)
            };
        } catch (error) {
            console.error('Error getting KYC data:', error);
            throw error;
        }
    }

    async saveKYCStep(userId, step, stepData) {
        try {
            // Validate step data based on step number
            const validation = this.validateKYCStep(step, stepData);
            if (!validation.valid) {
                return { success: false, message: validation.message };
            }

            // Start transaction
            await this.pool.execute('START TRANSACTION');

            try {
                // Update captain_details table for relevant steps
                if (step === 3) { // Driving License
                    await this.pool.execute(`
                        INSERT INTO captain_details (user_id, license_number, license_expiry, license_type)
                        VALUES (?, ?, ?, ?)
                        ON DUPLICATE KEY UPDATE
                        license_number = VALUES(license_number),
                        license_expiry = VALUES(license_expiry),
                        license_type = VALUES(license_type),
                        updated_at = CURRENT_TIMESTAMP
                    `, [userId, stepData.licenseNumber, stepData.licenseExpiry, stepData.licenseType]);
                }

                // Save document data
                await this.pool.execute(`
                    INSERT INTO kyc_documents (user_id, step, data, document_path, document_name)
                    VALUES (?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE
                    data = VALUES(data),
                    document_path = VALUES(document_path),
                    document_name = VALUES(document_name),
                    submitted_at = CURRENT_TIMESTAMP
                `, [
                    userId, 
                    step, 
                    JSON.stringify(stepData), 
                    stepData.documentPath || null,
                    stepData.documentName || null
                ]);

                // Update KYC status
                const newStatus = step === 8 ? 'submitted' : 'pending';
                await this.pool.execute(`
                    UPDATE users SET kyc_status = ? WHERE id = ?
                `, [newStatus, userId]);

                await this.pool.execute('COMMIT');
                return { success: true };

            } catch (error) {
                await this.pool.execute('ROLLBACK');
                throw error;
            }

        } catch (error) {
            console.error('Error saving KYC step:', error);
            return { success: false, message: 'Failed to save KYC step' };
        }
    }

    validateKYCStep(step, data) {
        switch (step) {
            case 3: // Driving License
                if (!data.licenseNumber || !data.licenseType || !data.licenseExpiry) {
                    return { valid: false, message: 'License number, type, and expiry are required' };
                }
                if (!data.documentPath) {
                    return { valid: false, message: 'License photo is required' };
                }
                break;
            case 4: // Vehicle Registration
                if (!data.vehicleNumber || !data.rcNumber) {
                    return { valid: false, message: 'Vehicle number and RC number are required' };
                }
                if (!data.documentPath) {
                    return { valid: false, message: 'RC document is required' };
                }
                break;
            default:
                if (!data.documentPath) {
                    return { valid: false, message: 'Document upload is required' };
                }
        }
        return { valid: true };
    }

    async getKYCDocuments(userId, step) {
        try {
            const [documents] = await this.pool.execute(`
                SELECT step, data, document_path, document_name, submitted_at
                FROM kyc_documents
                WHERE user_id = ? AND step = ?
            `, [userId, step]);

            return documents;
        } catch (error) {
            console.error('Error getting KYC documents:', error);
            throw error;
        }
    }

    // Close connection pool
    async close() {
        await this.pool.end();
    }

    // Submit complete KYC application - Simplified
    async submitKYC(userId, kycData, files) {
        try {
            await this.pool.execute('START TRANSACTION');

            try {
                // Insert or update captain details
                await this.pool.execute(`
                    INSERT INTO captain_details (
                        user_id, full_name, mobile_number, email, date_of_birth, gender, address, emergency_contact,
                        aadhar_number, pan_number, id_document_path, id_document_name,
                        license_number, license_type, license_expiry, license_document_path, license_document_name,
                        kyc_status, submitted_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'submitted', NOW())
                    ON DUPLICATE KEY UPDATE
                        full_name = VALUES(full_name),
                        mobile_number = VALUES(mobile_number),
                        email = VALUES(email),
                        date_of_birth = VALUES(date_of_birth),
                        gender = VALUES(gender),
                        address = VALUES(address),
                        emergency_contact = VALUES(emergency_contact),
                        aadhar_number = VALUES(aadhar_number),
                        pan_number = VALUES(pan_number),
                        id_document_path = VALUES(id_document_path),
                        id_document_name = VALUES(id_document_name),
                        license_number = VALUES(license_number),
                        license_type = VALUES(license_type),
                        license_expiry = VALUES(license_expiry),
                        license_document_path = VALUES(license_document_path),
                        license_document_name = VALUES(license_document_name),
                        kyc_status = 'submitted',
                        submitted_at = NOW(),
                        updated_at = CURRENT_TIMESTAMP
                `, [
                    userId,
                    kycData.fullName,
                    kycData.mobileNumber,
                    kycData.email,
                    kycData.dateOfBirth,
                    kycData.gender,
                    kycData.address,
                    kycData.emergencyContact,
                    kycData.aadharNumber,
                    kycData.panNumber,
                    files.idDocument ? files.idDocument.path : null,
                    files.idDocument ? files.idDocument.name : null,
                    kycData.licenseNumber,
                    kycData.licenseType,
                    kycData.licenseExpiry,
                    files.licensePhoto ? files.licensePhoto.path : null,
                    files.licensePhoto ? files.licensePhoto.name : null
                ]);

                await this.pool.execute('COMMIT');
                return { success: true, message: 'KYC submitted successfully' };

            } catch (error) {
                await this.pool.execute('ROLLBACK');
                throw error;
            }

        } catch (error) {
            console.error('Error submitting KYC:', error);
            throw error;
        }
    }

    // Get all pending KYC applications for admin
    async getPendingKYCApplications() {
        try {
            const [applications] = await this.pool.execute(`
                SELECT 
                    cd.*,
                    u.username,
                    u.created_at as user_created_at
                FROM captain_details cd
                LEFT JOIN users u ON cd.user_id = u.id
                WHERE cd.kyc_status = 'submitted'
                ORDER BY cd.submitted_at ASC
            `);
            
            return applications;
        } catch (error) {
            console.error('Error getting pending KYC applications:', error);
            throw error;
        }
    }

    // Approve or reject KYC application
    async updateKYCStatus(userId, status, reviewedBy, rejectionReason = null) {
        try {
            await this.pool.execute(`
                UPDATE captain_details 
                SET kyc_status = ?, reviewed_at = NOW(), reviewed_by = ?, rejection_reason = ?
                WHERE user_id = ?
            `, [status, reviewedBy, rejectionReason, userId]);

            return { success: true, message: `KYC ${status} successfully` };
        } catch (error) {
            console.error('Error updating KYC status:', error);
            throw error;
        }
    }
}

module.exports = User;
