// Authentication Routes for Velora

const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Initialize User model
const userModel = new User();

// Validation middleware
const validateSignup = (req, res, next) => {
    const { userType, fullName, username, email, mobile, password, studentId } = req.body;
    const errors = [];

    // User type validation
    if (!userType || !['student', 'captain'].includes(userType)) {
        errors.push({ field: 'userType', message: 'Please select a valid user type' });
    }

    // Full name validation
    if (!fullName || fullName.trim().length < 2) {
        errors.push({ field: 'fullName', message: 'Full name must be at least 2 characters' });
    }

    // Username validation
    if (!username || username.length < 3 || username.length > 20) {
        errors.push({ field: 'username', message: 'Username must be 3-20 characters' });
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        errors.push({ field: 'username', message: 'Username can only contain letters, numbers, and underscores' });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        errors.push({ field: 'email', message: 'Please enter a valid email address' });
    }

    // Mobile validation (Indian numbers starting with 6-9)
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobile || !mobileRegex.test(mobile)) {
        errors.push({ field: 'mobile', message: 'Please enter a valid 10-digit Indian mobile number' });
    }

    // Student ID validation (only for students)
    if (userType === 'student') {
        if (!studentId) {
            errors.push({ field: 'studentId', message: 'Student ID is required for students' });
        } else {
            const studentIdRegex = /^[0-9]{5}[A-Za-z][0-9]{6}$/;
            if (!studentIdRegex.test(studentId)) {
                errors.push({ field: 'studentId', message: 'Please enter a valid student ID (e.g., 22102A041057)' });
            }
        }
    }

    // Password validation
    if (!password || password.length < 8) {
        errors.push({ field: 'password', message: 'Password must be at least 8 characters' });
    }

    if (!/(?=.*[a-z])/.test(password)) {
        errors.push({ field: 'password', message: 'Password must contain at least one lowercase letter' });
    }

    if (!/(?=.*[A-Z])/.test(password)) {
        errors.push({ field: 'password', message: 'Password must contain at least one uppercase letter' });
    }

    if (!/(?=.*\d)/.test(password)) {
        errors.push({ field: 'password', message: 'Password must contain at least one number' });
    }

    if (!/(?=.*[!@#$%^&*(),.?":{}|<>])/.test(password)) {
        errors.push({ field: 'password', message: 'Password must contain at least one special character' });
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors
        });
    }

    next();
};

// POST /api/auth/signup
router.post('/signup', validateSignup, async (req, res) => {
    try {
        const { userType, fullName, username, email, mobile, password, studentId } = req.body;

        // Check for existing users
        const checks = [
            { check: () => userModel.checkUsernameExists(username), field: 'username', message: 'Username already exists' },
            { check: () => userModel.checkEmailExists(email), field: 'email', message: 'Email already registered' },
            { check: () => userModel.checkMobileExists(mobile), field: 'mobile', message: 'Mobile number already registered' }
        ];

        // Add student ID check if user is student
        if (userType === 'student' && studentId) {
            checks.push({
                check: () => userModel.checkStudentIdExists(studentId),
                field: 'studentId',
                message: 'Student ID already registered'
            });
        }

        // Run all checks
        const checkResults = await Promise.all(checks.map(async (item) => ({
            exists: await item.check(),
            field: item.field,
            message: item.message
        })));

        // Collect errors
        const errors = checkResults
            .filter(result => result.exists)
            .map(result => ({ field: result.field, message: result.message }));

        if (errors.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'User data already exists',
                errors: errors
            });
        }

        // Create user
        const userData = {
            userType,
            fullName: fullName.trim(),
            username: username.toLowerCase().trim(),
            email: email.toLowerCase().trim(),
            mobile,
            password,
            studentId: userType === 'student' ? studentId.toUpperCase() : null
        };

        const newUser = await userModel.createUser(userData);

        // Success response
        res.status(201).json({
            success: true,
            message: `${userType === 'student' ? 'Student' : 'Captain'} account created successfully! Please login to continue.`,
            uniqueId: newUser.uniqueId,
            user: {
                id: newUser.id,
                uniqueId: newUser.uniqueId,
                username: newUser.username,
                email: newUser.email,
                userType: newUser.userType,
                fullName: newUser.fullName
            }
        });

    } catch (error) {
        console.error('Signup error:', error);
        
        // Handle specific database errors
        if (error.code === 'ER_DUP_ENTRY') {
            const field = error.sqlMessage.includes('username') ? 'username' :
                         error.sqlMessage.includes('email') ? 'email' :
                         error.sqlMessage.includes('mobile') ? 'mobile' : 'general';
            
            return res.status(409).json({
                success: false,
                message: 'Data already exists',
                errors: [{ field, message: `This ${field} is already registered` }]
            });
        }

        res.status(500).json({
            success: false,
            message: 'Internal server error. Please try again later.',
            errors: [{ field: 'general', message: 'Server error occurred' }]
        });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { identifier, password } = req.body;

        // Validation
        if (!identifier || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email/username and password are required',
                errors: [
                    { field: 'identifier', message: 'Email or username is required' },
                    { field: 'password', message: 'Password is required' }
                ]
            });
        }

        // Find user by email or username
        let user = await userModel.getUserByEmail(identifier);
        if (!user) {
            user = await userModel.getUserByUsername(identifier);
        }

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials',
                errors: [{ field: 'identifier', message: 'User not found' }]
            });
        }

        // Verify password
        const isValidPassword = await userModel.verifyPassword(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials',
                errors: [{ field: 'password', message: 'Incorrect password' }]
            });
        }

        // Generate JWT token
        const jwt = require('jsonwebtoken');
        const token = jwt.sign(
            { 
                userId: user.id, 
                username: user.username, 
                userType: user.user_type,
                role: user.user_type 
            },
            process.env.JWT_SECRET || 'velora_jwt_secret',
            { expiresIn: '24h' }
        );

        // Success response (without sensitive data)
        res.json({
            success: true,
            message: 'Login successful',
            token: token,
            user: {
                id: user.id,
                uniqueId: user.unique_id,
                username: user.username,
                email: user.email,
                userType: user.user_type,
                fullName: user.full_name,
                isVerified: user.is_verified,
                kycStatus: user.kyc_status
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error. Please try again later.',
            errors: [{ field: 'general', message: 'Server error occurred' }]
        });
    }
});

// GET /api/auth/stats
router.get('/stats', async (req, res) => {
    try {
        const stats = await userModel.getUserStats();
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch stats'
        });
    }
});

// POST /api/auth/check-availability
router.post('/check-availability', async (req, res) => {
    try {
        const { field, value } = req.body;
        
        if (!field || !value) {
            return res.status(400).json({
                success: false,
                message: 'Field and value are required'
            });
        }

        let exists = false;
        
        switch (field) {
            case 'username':
                exists = await userModel.checkUsernameExists(value);
                break;
            case 'email':
                exists = await userModel.checkEmailExists(value);
                break;
            case 'mobile':
                exists = await userModel.checkMobileExists(value);
                break;
            case 'studentId':
                exists = await userModel.checkStudentIdExists(value);
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: 'Invalid field'
                });
        }

        res.json({
            success: true,
            available: !exists,
            message: exists ? `${field} is already taken` : `${field} is available`
        });

    } catch (error) {
        console.error('Availability check error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check availability'
        });
    }
});

// Verify token endpoint
router.get('/verify', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        const token = authHeader.substring(7);
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        // Verify token
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'velora_jwt_secret');
        
        // Get user details
        const user = await userModel.getUserById(decoded.userId);
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found.'
            });
        }

        res.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                userType: user.user_type,
                fullName: user.full_name
            }
        });

    } catch (error) {
        console.error('Token verification error:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token.'
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired.'
            });
        }
        
        return res.status(500).json({
            success: false,
            message: 'Internal server error.'
        });
    }
});

// Logout endpoint
router.post('/logout', (req, res) => {
    try {
        // In a real app, you might want to blacklist the token
        // For now, we'll just return success
        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

module.exports = router;
