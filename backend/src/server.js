// Velora Backend Server
// Main server file for the Node.js/Express application

const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Import routes
const authRoutes = require('../routes/auth');
const passwordResetRoutes = require('../routes/passwordReset');
const adminRoutes = require('../routes/admin');
const kycRoutes = require('../routes/kyc');
const rideRoutes = require('../routes/rides');
const paymentRoutes = require('../routes/payments');

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(session({
    secret: process.env.JWT_SECRET || 'velora_admin_session_secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Security middleware
app.use((req, res, next) => {
    res.header('X-Content-Type-Options', 'nosniff');
    res.header('X-Frame-Options', 'DENY');
    res.header('X-XSS-Protection', '1; mode=block');
    next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/password', passwordResetRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/kyc', kycRoutes);
app.use('/api', rideRoutes);
app.use('/api', paymentRoutes);

// Basic API route
app.get('/api', (req, res) => {
    res.json({ 
        message: 'Velora API Server is running!',
        version: '1.0.0',
        status: 'active',
        timestamp: new Date().toISOString()
    });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        memory: process.memoryUsage()
    });
});

// Serve static files from frontend
app.use(express.static(path.join(__dirname, '../../frontend')));

// Admin dashboard route with authentication check
app.get('/admin/dashboard.html', (req, res) => {
    // Check if admin is logged in via session
    if (!req.session || !req.session.admin_id) {
        return res.redirect('/admin/login.html');
    }
    
    const filePath = path.join(__dirname, '../../frontend/admin/dashboard.html');
    res.sendFile(filePath);
});

// Handle client-side routing
app.get('/pages/*', (req, res) => {
    const filePath = path.join(__dirname, '../../frontend', req.path);
    res.sendFile(filePath, (err) => {
        if (err) {
            res.status(404).sendFile(path.join(__dirname, '../../frontend/index.html'));
        }
    });
});

// Serve frontend for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/index.html'));
});

// Global error handler
app.use((error, req, res, next) => {
    console.error('Global error handler:', error);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
});

// Handle 404
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Velora Server running on http://localhost:${PORT}`);
    console.log(`📱 Frontend available at http://localhost:${PORT}`);
    console.log(`🔗 API available at http://localhost:${PORT}/api`);
    console.log(`🔐 Auth endpoints: ${PORT}/api/auth/signup, ${PORT}/api/auth/login`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
