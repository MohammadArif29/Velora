const express = require('express');
const router = express.Router();
const { execute } = require('../config/database');
const { requireAuth } = require('../middleware/auth');

// Update student/user profile
router.put('/api/user/profile', requireAuth, async (req, res) => {
    try {
        const userId = req.user.userId || req.user.id;
        const {
            fullName,
            email,
            mobile,
            studentId,
            emergencyContact,
            address
        } = req.body;

        if (!fullName || !email) {
            return res.status(400).json({ success: false, message: 'Full name and email are required' });
        }

        await execute(
            `UPDATE users 
             SET full_name = ?, email = ?, mobile_number = ?, student_id = ?, updated_at = CURRENT_TIMESTAMP 
             WHERE id = ?`,
            [fullName, email, mobile || null, studentId || null, userId]
        );

        await execute(
            `INSERT INTO user_profiles (user_id, emergency_contact, address)
             VALUES (?, ?, ?) 
             ON DUPLICATE KEY UPDATE emergency_contact = VALUES(emergency_contact), address = VALUES(address), updated_at = CURRENT_TIMESTAMP`,
            [userId, emergencyContact || null, address || null]
        );

        return res.json({ success: true, message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Update profile error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Update captain profile
router.put('/api/captain/profile', requireAuth, async (req, res) => {
    try {
        const userId = req.user.userId || req.user.id;
        const {
            fullName,
            email,
            mobile,
            licenseNumber,
            vehicleNumber,
            vehicleType,
            emergencyContact,
            address
        } = req.body;

        await execute(
            `UPDATE users 
             SET full_name = ?, email = ?, mobile_number = ?, updated_at = CURRENT_TIMESTAMP 
             WHERE id = ?`,
            [fullName || null, email || null, mobile || null, userId]
        );

        await execute(
            `INSERT INTO captain_details (user_id, license_number, vehicle_number, vehicle_type)
             VALUES (?, ?, ?, ?) 
             ON DUPLICATE KEY UPDATE 
                license_number = VALUES(license_number),
                vehicle_number = VALUES(vehicle_number),
                vehicle_type = VALUES(vehicle_type),
                updated_at = CURRENT_TIMESTAMP`,
            [userId, licenseNumber || null, vehicleNumber || null, vehicleType || null]
        );

        await execute(
            `INSERT INTO user_profiles (user_id, emergency_contact, address)
             VALUES (?, ?, ?) 
             ON DUPLICATE KEY UPDATE emergency_contact = VALUES(emergency_contact), address = VALUES(address), updated_at = CURRENT_TIMESTAMP`,
            [userId, emergencyContact || null, address || null]
        );

        return res.json({ success: true, message: 'Captain profile updated successfully' });
    } catch (error) {
        console.error('Update captain profile error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

module.exports = router;

