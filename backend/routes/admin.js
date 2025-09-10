// Admin Routes for Velora Admin Panel

const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');

// Initialize Admin model
const adminModel = new Admin();

// Admin authentication middleware
const requireAdmin = async (req, res, next) => {
    try {
        // Check if admin is logged in via session (for dashboard access)
        if (req.session && req.session.admin_id) {
            let permissions = [];
            try {
                permissions = req.session.permissions ? JSON.parse(req.session.permissions) : [];
            } catch (e) {
                console.error('Error parsing session permissions:', e);
                permissions = [];
            }
            
            req.admin = {
                id: req.session.admin_id,
                adminId: req.session.admin_id,
                username: req.session.admin_username,
                role: req.session.admin_role,
                permissions: permissions
            };
            return next();
        }

        // Check cookie-based authentication (for API calls)
        const sessionToken = req.headers.authorization?.replace('Bearer ', '') || 
                           req.cookies?.admin_session;

        if (!sessionToken) {
            return res.status(401).json({
                success: false,
                message: 'Admin authentication required',
                redirect: '/admin/login'
            });
        }

        const session = await adminModel.verifySession(sessionToken);
        if (!session) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired admin session',
                redirect: '/admin/login'
            });
        }

        // Get admin details from database
        const [admins] = await adminModel.pool.execute(
            'SELECT * FROM admin_users WHERE id = ?',
            [session.admin_id]
        );

        if (admins.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Admin not found',
                redirect: '/admin/login'
            });
        }

        const admin = admins[0];
        
        // Debug admin data from requireAdmin middleware
        console.log('Admin data in requireAdmin:', admin);
        console.log('Permissions type in requireAdmin:', typeof admin.permissions);
        console.log('Permissions value in requireAdmin:', admin.permissions);
        
        // Convert Buffer to string if needed
        if (Buffer.isBuffer(admin.permissions)) {
            admin.permissions = admin.permissions.toString();
            console.log('Converted permissions from Buffer in requireAdmin:', admin.permissions);
        }

        let permissions = [];
        try {
            if (Array.isArray(admin.permissions)) {
                // Already parsed by typeCast
                permissions = admin.permissions;
            } else if (typeof admin.permissions === 'string') {
                // Needs parsing
                permissions = JSON.parse(admin.permissions);
            } else {
                permissions = [];
            }
        } catch (e) {
            console.error('Error handling admin permissions:', e);
            permissions = [];
        }

        req.admin = {
            id: admin.id,
            adminId: admin.admin_id,
            username: admin.username,
            role: admin.role,
            permissions: permissions
        };

        next();
    } catch (error) {
        console.error('Admin authentication error:', error);
        res.status(500).json({
            success: false,
            message: 'Authentication error'
        });
    }
};

// Check specific permission
const requirePermission = (permission) => {
    return (req, res, next) => {
        if (req.admin.role === 'superadmin' || req.admin.permissions.includes(permission)) {
            next();
        } else {
            res.status(403).json({
                success: false,
                message: 'Insufficient permissions'
            });
        }
    };
};

// POST /api/admin/login
router.post('/login', async (req, res) => {
    try {
        const { adminId, password } = req.body;

        // Validation
        if (!adminId || !password) {
            return res.status(400).json({
                success: false,
                message: 'Admin ID and password are required',
                errors: [
                    { field: 'adminId', message: 'Admin ID is required' },
                    { field: 'password', message: 'Password is required' }
                ].filter(error => {
                    if (error.field === 'adminId') return !adminId;
                    if (error.field === 'password') return !password;
                    return false;
                })
            });
        }

        // Find admin
        const admin = await adminModel.getAdminByAdminId(adminId);
        if (!admin) {
            await adminModel.logActivity(null, 'failed_login', 'admin', null, 
                { adminId, reason: 'admin_not_found' }, req.ip, req.get('User-Agent'));
            
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials',
                errors: [{ field: 'adminId', message: 'Invalid admin ID or password' }]
            });
        }

        // Verify password
        const isValidPassword = await adminModel.verifyPassword(password, admin.password_hash);
        if (!isValidPassword) {
            await adminModel.logActivity(admin.id, 'failed_login', 'admin', admin.id, 
                { reason: 'invalid_password' }, req.ip, req.get('User-Agent'));
            
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials',
                errors: [{ field: 'password', message: 'Invalid admin ID or password' }]
            });
        }

        // Create session
        const session = await adminModel.createSession(admin.id, req.ip, req.get('User-Agent'));
        
        // Update last login
        await adminModel.updateLastLogin(admin.id);
        
        // Log successful login
        await adminModel.logActivity(admin.id, 'login', 'admin', admin.id, 
            { sessionToken: session.sessionToken.substring(0, 8) + '...' }, req.ip, req.get('User-Agent'));

        // Set secure cookie
        res.cookie('admin_session', session.sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
            sameSite: 'strict'
        });

        // Handle permissions (already parsed by typeCast or needs parsing)
        let permissions = [];
        try {
            console.log('Admin permissions from DB:', admin.permissions);
            console.log('Type of permissions:', typeof admin.permissions);
            
            if (Array.isArray(admin.permissions)) {
                // Already parsed by typeCast
                permissions = admin.permissions;
                console.log('Permissions already parsed as array:', permissions);
            } else if (typeof admin.permissions === 'string') {
                // Needs parsing
                permissions = JSON.parse(admin.permissions);
                console.log('Parsed permissions from string:', permissions);
            } else {
                permissions = [];
                console.log('No permissions found, using empty array');
            }
        } catch (e) {
            console.error('Error handling admin permissions during login:', e);
            console.error('Raw permissions value:', admin.permissions);
            permissions = [];
        }

        // Store admin data in session for dashboard access
        req.session.admin_id = admin.id;
        req.session.admin_username = admin.username;
        req.session.admin_role = admin.role;
        req.session.permissions = JSON.stringify(permissions);

        res.json({
            success: true,
            message: 'Admin login successful',
            admin: {
                id: admin.id,
                adminId: admin.admin_id,
                username: admin.username,
                role: admin.role,
                permissions: permissions,
                lastLogin: admin.last_login
            },
            session: {
                token: session.sessionToken,
                expiresAt: session.expiresAt
            }
        });

    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// POST /api/admin/logout
router.post('/logout', requireAdmin, async (req, res) => {
    try {
        const sessionToken = req.headers.authorization?.replace('Bearer ', '') || 
                           req.cookies?.admin_session;

        if (sessionToken) {
            // Delete session from database
            await adminModel.pool.execute(
                'DELETE FROM admin_sessions WHERE session_token = ?',
                [sessionToken]
            );
        }

        // Log logout
        await adminModel.logActivity(req.admin.id, 'logout', 'admin', req.admin.id, 
            null, req.ip, req.get('User-Agent'));

        // Clear cookie
        res.clearCookie('admin_session');

        // Clear session data
        req.session.destroy((err) => {
            if (err) {
                console.error('Session destroy error:', err);
            }
        });

        res.json({
            success: true,
            message: 'Admin logout successful'
        });

    } catch (error) {
        console.error('Admin logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Logout error'
        });
    }
});

// GET /api/admin/dashboard
router.get('/dashboard', requireAdmin, async (req, res) => {
    try {
        // Get user statistics
        const userStats = await adminModel.getUserStats();
        
        // Get recent activities
        const recentActivities = await adminModel.getRecentActivities(10);
        
        // Get system settings
        const systemSettings = await adminModel.getSystemSettings();

        res.json({
            success: true,
            data: {
                userStats,
                recentActivities,
                systemSettings,
                admin: {
                    username: req.admin.username,
                    role: req.admin.role,
                    permissions: req.admin.permissions
                }
            }
        });

    } catch (error) {
        console.error('Admin dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to load dashboard data'
        });
    }
});

// GET /api/admin/users
router.get('/users', requireAdmin, requirePermission('user_management'), async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const userType = req.query.userType || null;
        const search = req.query.search || null;

        const result = await adminModel.getAllUsers(page, limit, userType, search);

        // Log activity
        await adminModel.logActivity(req.admin.id, 'view_users', 'users', null, 
            { page, limit, userType, search }, req.ip, req.get('User-Agent'));

        res.json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('Admin get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users'
        });
    }
});

// PUT /api/admin/users/:userId/status
router.put('/users/:userId/status', requireAdmin, requirePermission('user_management'), async (req, res) => {
    try {
        const { userId } = req.params;
        const { isActive } = req.body;

        if (typeof isActive !== 'boolean') {
            return res.status(400).json({
                success: false,
                message: 'isActive must be a boolean value'
            });
        }

        await adminModel.updateUserStatus(userId, isActive);

        // Log activity
        await adminModel.logActivity(req.admin.id, 'update_user_status', 'user', userId, 
            { isActive }, req.ip, req.get('User-Agent'));

        res.json({
            success: true,
            message: `User ${isActive ? 'activated' : 'deactivated'} successfully`
        });

    } catch (error) {
        console.error('Admin update user status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update user status'
        });
    }
});

// DELETE /api/admin/users/:userId
router.delete('/users/:userId', requireAdmin, requirePermission('user_management'), async (req, res) => {
    try {
        const { userId } = req.params;

        await adminModel.deleteUser(userId);

        // Log activity
        await adminModel.logActivity(req.admin.id, 'delete_user', 'user', userId, 
            null, req.ip, req.get('User-Agent'));

        res.json({
            success: true,
            message: 'User deleted successfully'
        });

    } catch (error) {
        console.error('Admin delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete user'
        });
    }
});

// GET /api/admin/settings
router.get('/settings', requireAdmin, requirePermission('system_settings'), async (req, res) => {
    try {
        const settings = await adminModel.getSystemSettings();

        res.json({
            success: true,
            data: settings
        });

    } catch (error) {
        console.error('Admin get settings error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch settings'
        });
    }
});

// PUT /api/admin/settings/:key
router.put('/settings/:key', requireAdmin, requirePermission('system_settings'), async (req, res) => {
    try {
        const { key } = req.params;
        const { value } = req.body;

        await adminModel.updateSystemSetting(key, value, req.admin.id);

        // Log activity
        await adminModel.logActivity(req.admin.id, 'update_setting', 'setting', null, 
            { key, value }, req.ip, req.get('User-Agent'));

        res.json({
            success: true,
            message: 'Setting updated successfully'
        });

    } catch (error) {
        console.error('Admin update setting error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update setting'
        });
    }
});

// GET /api/admin/activities
router.get('/activities', requireAdmin, requirePermission('logs'), async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 100;
        const activities = await adminModel.getRecentActivities(limit);

        res.json({
            success: true,
            data: activities
        });

    } catch (error) {
        console.error('Admin get activities error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch activities'
        });
    }
});

// GET /api/admin/verify - Verify admin session
router.get('/verify', requireAdmin, (req, res) => {
    res.json({
        success: true,
        admin: {
            username: req.admin.username,
            role: req.admin.role,
            permissions: req.admin.permissions
        }
    });
});

module.exports = router;
