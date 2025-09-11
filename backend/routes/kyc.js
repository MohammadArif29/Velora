// Simplified KYC Routes for Velora Captain Verification

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');

// Initialize User model
const userModel = new User();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = 'uploads/kyc/';
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

// Middleware to check if user is captain
const requireCaptain = async (req, res, next) => {
    try {
        const userId = req.body.userId || req.headers['user-id'];
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'User ID required'
            });
        }

        const user = await userModel.getUserById(userId);
        if (!user || user.user_type !== 'captain') {
            return res.status(403).json({
                success: false,
                message: 'Captain access required'
            });
        }

        req.userId = userId;
        next();
    } catch (error) {
        console.error('Captain auth error:', error);
        res.status(500).json({
            success: false,
            message: 'Authentication error'
        });
    }
};

// Get KYC status
router.post('/status', requireCaptain, async (req, res) => {
    try {
        const kycData = await userModel.getKYCData(req.userId);
        res.json({
            success: true,
            kycData: kycData
        });
    } catch (error) {
        console.error('KYC status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get KYC status'
        });
    }
});

// Submit KYC application
router.post('/submit', requireCaptain, upload.fields([
    { name: 'idDocument', maxCount: 1 },
    { name: 'licensePhoto', maxCount: 1 }
]), async (req, res) => {
    try {
        const { kycData } = req.body;
        const parsedKycData = JSON.parse(kycData);
        
        // Prepare file data
        const files = {
            idDocument: req.files.idDocument ? {
                path: req.files.idDocument[0].path,
                name: req.files.idDocument[0].originalname
            } : null,
            licensePhoto: req.files.licensePhoto ? {
                path: req.files.licensePhoto[0].path,
                name: req.files.licensePhoto[0].originalname
            } : null
        };

        // Validate required files
        if (!files.idDocument) {
            return res.status(400).json({
                success: false,
                message: 'ID document is required'
            });
        }

        if (!files.licensePhoto) {
            return res.status(400).json({
                success: false,
                message: 'Driving license photo is required'
            });
        }

        // Submit KYC
        const result = await userModel.submitKYC(req.userId, parsedKycData, files);
        
        res.json(result);
    } catch (error) {
        console.error('KYC submission error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit KYC application'
        });
    }
});

// Get all pending KYC applications (Admin only)
router.get('/pending', async (req, res) => {
    try {
        // TODO: Add admin authentication middleware
        const applications = await userModel.getPendingKYCApplications();
        
        res.json({
            success: true,
            applications: applications
        });
    } catch (error) {
        console.error('Error getting pending KYC applications:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get pending applications'
        });
    }
});

// Approve or reject KYC application (Admin only)
router.post('/review', async (req, res) => {
    try {
        const { userId, status, rejectionReason } = req.body;
        const reviewedBy = req.session.admin_id || 1; // TODO: Get from admin session
        
        if (!userId || !status) {
            return res.status(400).json({
                success: false,
                message: 'User ID and status are required'
            });
        }

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Status must be approved or rejected'
            });
        }

        const result = await userModel.updateKYCStatus(userId, status, reviewedBy, rejectionReason);
        res.json(result);
    } catch (error) {
        console.error('Error reviewing KYC:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to review KYC application'
        });
    }
});

module.exports = router;