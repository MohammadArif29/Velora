const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const Ride = require('../models/Ride');
const { requireAuth } = require('../middleware/auth');

// Process payment for a ride
router.post('/api/payments/process', requireAuth, async (req, res) => {
    try {
        const { rideId, paymentMethod = 'wallet' } = req.body;
        const userId = req.user.id;

        // Get ride details
        const ride = await Ride.getRideById(rideId);
        if (!ride) {
            return res.status(404).json({
                success: false,
                message: 'Ride not found'
            });
        }

        // Verify user is the student for this ride
        if (ride.student_id !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized to process payment for this ride'
            });
        }

        // Check if payment already exists
        const existingPayment = await Payment.getPaymentById(rideId);
        if (existingPayment) {
            return res.status(400).json({
                success: false,
                message: 'Payment already processed for this ride'
            });
        }

        // Create payment record
        const paymentData = {
            ride_id: rideId,
            student_id: userId,
            captain_id: ride.captain_id,
            amount: ride.fare_amount,
            platform_fee: Math.round(ride.fare_amount * 0.1 * 100) / 100, // 10% platform fee
            payment_method: paymentMethod
        };

        const paymentResult = await Payment.createPayment(paymentData);

        if (!paymentResult.success) {
            return res.status(400).json(paymentResult);
        }

        // Process payment based on method
        if (paymentMethod === 'wallet') {
            // Check wallet balance
            const balance = await Payment.getWalletBalance(userId);
            if (balance < ride.fare_amount) {
                return res.status(400).json({
                    success: false,
                    message: 'Insufficient wallet balance',
                    required: ride.fare_amount,
                    available: balance
                });
            }

            // Deduct from wallet
            const deductResult = await Payment.deductFromWallet(userId, ride.fare_amount);
            if (!deductResult.success) {
                return res.status(400).json(deductResult);
            }

            // Process payment
            const processResult = await Payment.processPayment(paymentResult.paymentId);
            if (!processResult.success) {
                // Refund if processing fails
                await Payment.addToWallet(userId, ride.fare_amount);
                return res.status(400).json(processResult);
            }
        } else {
            // For other payment methods (card, UPI, cash), just create the record
            // In a real app, you'd integrate with payment gateways here
            res.json({
                success: true,
                message: 'Payment initiated successfully',
                paymentId: paymentResult.paymentId,
                amount: ride.fare_amount
            });
            return;
        }

        res.json({
            success: true,
            message: 'Payment processed successfully',
            paymentId: paymentResult.paymentId,
            amount: ride.fare_amount
        });
    } catch (error) {
        console.error('Error processing payment:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Get wallet balance
router.get('/api/payments/wallet', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const balance = await Payment.getWalletBalance(userId);

        res.json({
            success: true,
            balance: balance
        });
    } catch (error) {
        console.error('Error getting wallet balance:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Add money to wallet
router.post('/api/payments/wallet/add', requireAuth, async (req, res) => {
    try {
        const { amount } = req.body;
        const userId = req.user.id;

        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Valid amount is required'
            });
        }

        const result = await Payment.addToWallet(userId, amount);

        if (result.success) {
            const newBalance = await Payment.getWalletBalance(userId);
            res.json({
                success: true,
                message: 'Money added to wallet successfully',
                newBalance: newBalance
            });
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Error adding to wallet:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Get payment history
router.get('/api/payments/history', requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const limit = parseInt(req.query.limit) || 20;
        const offset = parseInt(req.query.offset) || 0;

        const payments = await Payment.getUserPayments(userId, limit, offset);

        res.json({
            success: true,
            payments: payments
        });
    } catch (error) {
        console.error('Error getting payment history:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Get payment details
router.get('/api/payments/:paymentId', requireAuth, async (req, res) => {
    try {
        const { paymentId } = req.params;
        const userId = req.user.id;

        const payment = await Payment.getPaymentById(paymentId);

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        // Verify user has permission to view this payment
        if (payment.student_id !== userId && payment.captain_id !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized to view this payment'
            });
        }

        res.json({
            success: true,
            payment: payment
        });
    } catch (error) {
        console.error('Error getting payment details:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Refund payment
router.post('/api/payments/:paymentId/refund', requireAuth, async (req, res) => {
    try {
        const { paymentId } = req.params;
        const { reason } = req.body;
        const userId = req.user.id;

        // Get payment details to verify ownership
        const payment = await Payment.getPaymentById(paymentId);
        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        // Only student can request refund
        if (payment.student_id !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized to refund this payment'
            });
        }

        const result = await Payment.refundPayment(paymentId, reason);

        if (result.success) {
            res.json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Error refunding payment:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Get platform earnings (admin only)
router.get('/api/payments/earnings', requireAuth, async (req, res) => {
    try {
        // Check if user is admin (you might want to add admin middleware)
        const userId = req.user.id;
        
        // For now, allow any authenticated user to view earnings
        // In production, add proper admin authorization
        const startDate = req.query.startDate || new Date(new Date().setDate(new Date().getDate() - 30)).toISOString();
        const endDate = req.query.endDate || new Date().toISOString();

        const earnings = await Payment.getPlatformEarnings(startDate, endDate);

        res.json({
            success: true,
            earnings: earnings
        });
    } catch (error) {
        console.error('Error getting platform earnings:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

module.exports = router;
